/**
 * 为 MD/MDX 文章生成并写入 AI 摘要（静态）
 * 使用方法：运行 tsx scripts/generateSummary.ts
 * 配置来源优先级：
 * 1) src/plugins/custom.ts 顶部注释中的 AI_SUMMARY_API / AI_SUMMARY_KEY
 * 2) 进程环境变量 AI_SUMMARY_API / AI_SUMMARY_KEY
 *
 * 说明：
 * - 若未配置 API，将使用本地简易规则生成摘要（截取正文前 200~300 字）。
 * - 脚本会扫描 src/content/blog/** 下的 index.md 或 index.mdx 文件，读取正文与前言并写入 summary 字段。
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog')
// 摘要目标长度（500字的单句陈述，结尾必须为句号）
const SUMMARY_MAX_LEN = 500

/**
 * 判断字符串是否为纯 ASCII（避免在 HTTP 头中出现非 ASCII 导致 ByteString 报错）
 */
function isASCII(str: string): boolean {
  return /^[\x00-\x7F]*$/.test(str)
}

/**
 * 从 src/plugins/custom.ts 的文件注释中读取 AI 摘要相关配置。
 * 格式示例：
 * // AI_SUMMARY_API=https://example.com/api/summary
 * // AI_SUMMARY_KEY=your-api-key
 */
function readAIConfigFromCustom(): { api: string | null; key: string | null } {
  const customPath = path.join(ROOT, 'src', 'plugins', 'custom.ts')
  if (!fs.existsSync(customPath)) {
    return { api: null, key: null }
  }
  const content = fs.readFileSync(customPath, 'utf-8')
  const read = (key: string): string | null => {
    const re = new RegExp('^\\s*//\\s*' + key + '\\s*[:=]\\s*(.+)$', 'm')
    const m = content.match(re)
    if (!m) return null
    let val = m[1].trim()
    // 去除收尾引号与内联注释
    val = val
      .replace(/^['"]/,'')
      .replace(/['"]$/,'')
      .replace(/\s+\/\/.*$/,'')
      .replace(/[;]+$/,'')
      .trim()

    return val.length ? val : null
  }
  return {
    api: read('AI_SUMMARY_API'),
    key: read('AI_SUMMARY_KEY'),
  }
}

/**
 * 从 custom.ts 中读取 sparkLite_wordLimit（变量声明）。
 * 支持格式：var sparkLite_wordLimit = 8000; 或带空格与分号。
 */
function readWordLimitFromCustom(): number | null {
  const customPath = path.join(ROOT, 'src', 'plugins', 'aisummary.config.ts')
  if (!fs.existsSync(customPath)) return null
  const content = fs.readFileSync(customPath, 'utf-8')
  // 兼容旧变量名与新变量名
  const m = content.match(/var\s+(?:aisummaryWordLimit|sparkLite_wordLimit)\s*=\s*([0-9]+)/)
  if (!m) return null
  const v = parseInt(m[1], 10)
  return Number.isFinite(v) && v > 0 ? v : null
}

/**
 * 从环境变量读取字数限制，支持 SPARKLITE_WORD_LIMIT 与 AI_SUMMARY_WORD_LIMIT。
 */
function readWordLimitFromEnv(): number | null {
  const envVal = process.env.AISUMMARY_WORD_LIMIT || process.env.SPARKLITE_WORD_LIMIT || process.env.AI_SUMMARY_WORD_LIMIT || ''
  const v = parseInt(envVal, 10)
  return Number.isFinite(v) && v > 0 ? v : null
}

/**
 * 获取最大字数限制：优先 custom.ts，其次环境变量，默认 8000。
 */
function getWordLimit(): number {
  return readWordLimitFromCustom() ?? readWordLimitFromEnv() ?? 8000
}

/**
 * 根据限制截断正文到指定最大字符数；保留原文长度不足的情况。
 */
function limitBody(body: string, maxChars: number): string {
  if (!Number.isFinite(maxChars) || maxChars <= 0) return body
  return body.length > maxChars ? body.slice(0, maxChars) : body
}

/**
 * 递归查找目录下所有 index.md 或 index.mdx 文件
 */
function findMarkdownEntries(dir: string): string[] {
  const results: string[] = []
  const items = fs.readdirSync(dir, { withFileTypes: true })
  for (const item of items) {
    const fp = path.join(dir, item.name)
    if (item.isDirectory()) {
      results.push(...findMarkdownEntries(fp))
    } else if (item.isFile() && /index\.mdx?$/.test(item.name)) {
      results.push(fp)
    }
  }
  return results
}

/**
 * 提取“主” frontmatter 与正文。
 * 只提取第一个以 `---` 包裹的 frontmatter 区块，
 * 自动兼容没有空行的情况。
 */
function splitFrontmatterAndBody(content: string): { frontmatter: string; body: string } {
  // 去除文件开头可能的 BOM 和多余空行
  content = content.replace(/^\uFEFF?/, '').trimStart()

  // 允许 frontmatter 后无换行或紧接正文
  // 支持 Windows (CRLF) 与 Unix (LF) 换行
  const re = /^---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/
  const match = re.exec(content)

  if (!match) {
    return { frontmatter: '', body: content }
  }

  const start = match.index
  let fm = match[0]
  let tail = content.slice(start + fm.length)

  // 若 frontmatter 后紧跟另一个 frontmatter，进行合并，避免重复块
  const second = re.exec(tail)
  if (second && second.index === 0) {
    const fm2 = second[0]
    fm = mergeFrontmatterBlocks(fm, fm2)
    tail = tail.slice(fm2.length)
  }

  const body = tail.replace(/^\r?\n*/, '') // 去掉多余空行
  return { frontmatter: fm, body }
}

/**
 * 合并两个相邻的 YAML frontmatter 块（各自以 `---` 包裹）。
 * 处理策略：
 * - 去除两侧分隔线，仅拼接内部内容；
 * - 去重已有的 `summary:` 行，保留后续统一写入的位置；
 * - 结果始终包含收尾分隔线与结尾换行。
 */
function mergeFrontmatterBlocks(fm1: string, fm2: string): string {
  const lines1 = fm1.split(/\r?\n/)
  const lines2 = fm2.split(/\r?\n/)
  const endIdx1 = lines1.findIndex((l, i) => i > 0 && l.trim() === '---')
  const endIdx2 = lines2.findIndex((l, i) => i > 0 && l.trim() === '---')
  const inner1 = endIdx1 > -1 ? lines1.slice(1, endIdx1) : lines1.slice(1)
  const inner2 = endIdx2 > -1 ? lines2.slice(1, endIdx2) : lines2.slice(1)

  const cleaned1 = inner1.filter(l => !/^\s*summary\s*:/i.test(l))
  const cleaned2 = inner2.filter(l => !/^\s*summary\s*:/i.test(l))

  const combined = ['---', ...cleaned1, ...cleaned2, '---']
  const fmStr = combined.join('\n')
  return fmStr.endsWith('\n') ? fmStr : fmStr + '\n'
}

/**
 * 清洗任意文本为摘要友好格式（单段、纯文本、约定最大长度）。
 * 处理步骤：
 * - 移除代码块（``` ... ```）与行内代码（`...`）
 * - 移除图片与保留超链接可读文本（[text](url) -> text）
 * - 去除标题/引用/列表开头的 Markdown 语法符号
 * - 去除 HTML 标签，压缩空白，替换换行为空格
 * - 截断到 SUMMARY_MAX_LEN，保证结尾有句号或省略号
 */
function sanitizeSummaryText(text: string, maxLen = SUMMARY_MAX_LEN): string {
  if (!text) return ''
  let s = String(text)
  // 去除三引号代码块
  s = s.replace(/```[\s\S]*?```/g, '')
  // 去除行内代码
  s = s.replace(/`[^`]*`/g, '')
  // 图片
  s = s.replace(/!\[[^\]]*\]\([^\)]+\)/g, '')
  // 链接，保留可读文本
  s = s.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
  // 去除加粗/斜体标记
  s = s.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
  s = s.replace(/__([^_]+)__/g, '$1').replace(/_([^_]+)_/g, '$1')
  // 标题/引用/列表标记
  s = s.replace(/^[ \t]*#{1,6}[^\n]*\n/gm, '')
  s = s.replace(/^>\s+/gm, '')
  s = s.replace(/^[ \t]*[-*+]\s+/gm, '')
  s = s.replace(/^[ \t]*\d+\.\s+/gm, '')
  // HTML 标签
  s = s.replace(/<[^>]+>/g, '')
  // 压缩空白与换行
  s = s.replace(/\r?\n+/g, ' ')
  s = s.replace(/\s{2,}/g, ' ').trim()

  if (!s) return ''
  return toDeclarativeSentence(s, maxLen)
}

/**
 * 判断文本是否包含明显的代码痕迹，若是则不适合作为摘要。
 */
function looksLikeCode(text: string): boolean {
  if (!text) return false
  const patterns = [
    /\b(import|export|const|let|var|function|interface|class|return|new)\b/,
    /=>|\{|\}|;|\(|\)|\[|\]|::|\.|\/\w+/,
  ]
  return patterns.some(re => re.test(text))
}

/**
 * 基于正文生成本地摘要（无 API 时的兜底）。
 * 仅使用正文的纯文本信息，避免标题/代码等干扰，保证单段约200字。
 */
function localGenerateSummary(title: string, body: string, maxLen = SUMMARY_MAX_LEN): string {
  // 初步清洗正文，得到纯文本
  let clean = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/^[ \t]*#{1,6}[^\n]*\n/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/^[ \t]*[-*+]\s+/gm, '')
    .replace(/^[ \t]*\d+\.\s+/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()

  if (!clean) {
    // 若正文清洗后为空，则用标题作简介
    return toDeclarativeSentence(title || '本文介绍相关主题与步骤。', maxLen)
  }
  return toDeclarativeSentence(clean, maxLen)
}

/**
 * 将任意纯文本整形成“单句、约200字”的陈述句摘要。
 * 处理规范：
 * - 统一中英文标点（.,!? -> 。！？）；移除不必要符号（引号、括号、斜杠、竖线、冒号、分号等）
 * - 按句子边界切分，将多句以“，”连接为一整句，结尾强制“。”
 * - 最终长度不超过 maxLen，若超出则在句末前截断；确保不以顿号/逗号等结束
 */
function toDeclarativeSentence(text: string, maxLen = SUMMARY_MAX_LEN): string {
  let s = String(text)
  // 统一中英文标点到中文风格
  s = s
    .replace(/[\.;]{1,}/g, '。')
    .replace(/[!?]+/g, '！')
    .replace(/[,，]+/g, '，')
    .replace(/[:：]+/g, '：')
    .replace(/[;；]+/g, '；')

  // 移除不适合摘要的符号（保持数字与中文）
  s = s
    .replace(/["'`~^_*@#$%&+=<>]/g, '')
    .replace(/[\(\)\[\]\{\}（ ）【 】]/g, '')
    .replace(/[|\\/]/g, '')

  // 多句合并为单句（句末标点替换为逗号，最后保留为句号）
  const parts = s
    .split(/[。！？!？…]+/)
    .map(t => t.trim())
    .filter(Boolean)
  let merged = parts.join('，')

  // 清理多余空白与重复逗号
  merged = merged.replace(/\s{2,}/g, ' ').replace(/，{2,}/g, '，').trim()
  // 截断到目标长度-1（为结尾句号预留1字符）
  const coreMax = Math.max(1, maxLen - 1)
  if (merged.length > coreMax) {
    merged = merged.slice(0, coreMax)
    // 避免以逗号/顿号/冒号/分号结尾
    merged = merged.replace(/[，、：；]+$/g, '')
  } else {
    // 长度不足时，去除末尾非句号标点
    merged = merged.replace(/[，、：；]+$/g, '')
  }
  // 结尾强制句号
  return merged.endsWith('。') ? merged : merged + '。'
}


/**
 * 在 frontmatter 中写入/更新 `summary` 字段
 * 要求：summary 出现在两个 `---` 之间的最后一行（结束分隔线之前）。
 * 若已存在则移除原位置，统一追加到结束分隔线前；若无 frontmatter 则只写入 summary。
 * @param frontmatter 原始 frontmatter 字符串（包含分隔线）
 * @param summary 需要写入的摘要文本（已为单句、长度受控）
 * @returns 更新后的 frontmatter 字符串（确保结束分隔线后带换行）
 */
function upsertSummaryInFrontmatter(frontmatter: string, summary: string): string {
  if (!frontmatter) {
    return `---\nsummary: ${escapeYaml(summary)}\n---\n`
  }

  const lines = frontmatter.split('\n')
  let endIdx = lines.findIndex((l, i) => i > 0 && l.trim() === '---')
  if (endIdx === -1) endIdx = lines.length

  // 过滤 frontmatter 内非 YAML 内容（如错误写入的代码块或纯文本）
  const bodyLines = lines
    .slice(1, endIdx)
    .filter(l => {
      if (/^\s*summary\s*:/i.test(l)) return false
      if (/^\s*```/.test(l)) return false
      const yamlKey = /^\s*[A-Za-z_][\w-]*\s*:/
      const yamlListItem = /^\s*-\s+.+/
      const yamlComment = /^\s*#/
      const empty = /^\s*$/
      return yamlKey.test(l) || yamlListItem.test(l) || yamlComment.test(l) || empty.test(l)
    })
  const rebuilt = [
    '---',
    ...bodyLines,
    `summary: ${escapeYaml(summary)}`,
    '---'
  ]
  // 保证结束分隔线后有一个换行，以便与正文分隔
  const fmStr = rebuilt.join('\n')
  return fmStr.endsWith('\n') ? fmStr : fmStr + '\n'
}


/**
 * 简易 YAML 转义（单行文本）
 * @param text 需要转义的摘要文本
 * @returns 适配 YAML 的安全字符串（使用双引号包裹）
 */
function escapeYaml(text: string): string {
  const s = (text || '').replace(/"/g, '\\"')
  // 使用引号以防特殊字符
  return '"' + s + '"'
}

/**
 * 基于正文生成简易摘要（本地 fallback）
 */
function localFallbackSummary(title: string, body: string): string {
  const clean = body
    .replace(/<[^>]+>/g, '')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s{2,}/g, ' ') // 压缩空白
    .trim()
  const maxLen = 280
  const slice = clean.slice(0, maxLen)
  return slice.length < clean.length ? slice + '…' : slice || title
}

/**
 * 调用外部 API 生成摘要；优先读取 custom.ts 注释配置，其次读取环境变量。
 * 当密钥包含非 ASCII 字符时，不使用 Authorization 头，改为在 JSON 体中传递 apiKey 字段，规避 ByteString 错误。
 */
async function callSummaryAPI(title: string, body: string, limit: number): Promise<string | null> {
  const cfg = readAIConfigFromCustom()
  const api = cfg.api || process.env.AI_SUMMARY_API
  const key = cfg.key || process.env.AI_SUMMARY_KEY
  if (!api) return null
  const limited = limitBody(body, limit)
  const payload: Record<string, unknown> = { title, content: limited, wordLimit: limit }
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' }
  if (key) {
    if (isASCII(key)) {
      headers['Authorization'] = 'Bearer ' + key
    } else {
      // 非 ASCII 密钥：在请求体中传递，避免 ByteString 报错
      payload['apiKey'] = key
    }
  }

  try {
    const res = await fetch(api, { method: 'POST', headers, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const data = await res.json()
    // 约定返回 { summary: string }
    return typeof (data as any).summary === 'string' ? (data as any).summary.trim() : null
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('AI 摘要 API 调用失败：', msg)
    return null
  }
}

/**
 * 从 frontmatter 中读取标题（用于提示词与兜底处理）
 */
function readTitleFromFrontmatter(frontmatter: string): string {
  const m = frontmatter.match(/\ntitle:\s*['\"]?([^'\"]+)['\"]?\s*\n/)
  return m ? m[1].trim() : ''
}

/**
 * 主流程：扫描文章、生成摘要并写入文件。
 * 规则：若 src/plugins/custom.ts 未声明 AI_SUMMARY_API，则保持 summary 为空值
 * 否则尝试调用 API，失败时使用本地兜底摘要。
 */
async function run(): Promise<void> {
  const files = findMarkdownEntries(BLOG_DIR)
  if (!files.length) {
    console.log('未找到任何 Markdown 文章。')
    return
  }
  const wordLimit = getWordLimit()
  const cfg = readAIConfigFromCustom()
  const hasCustomAPI = !!(cfg.api || process.env.AI_SUMMARY_API)

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    const { frontmatter, body } = splitFrontmatterAndBody(content)
    const title = readTitleFromFrontmatter(frontmatter)
    const limitedBody = limitBody(body, wordLimit)

    // 生成摘要：优先 API；无/失败则本地规则
    const apiSummary = hasCustomAPI ? await callSummaryAPI(title, limitedBody, wordLimit) : null
    let summaryRaw = apiSummary ?? ''
    let summary = sanitizeSummaryText(summaryRaw, SUMMARY_MAX_LEN)
    if (!summary || looksLikeCode(summary)) {
      summary = localGenerateSummary(title, limitedBody, SUMMARY_MAX_LEN)
    }
    // 统一为单句陈述句
    summary = toDeclarativeSentence(summary, SUMMARY_MAX_LEN)

    const nextFrontmatter = upsertSummaryInFrontmatter(frontmatter, summary)
    const nextContent = nextFrontmatter + body
    fs.writeFileSync(file, nextContent, 'utf8')
    console.log('已写入摘要：' + path.relative(ROOT, file))
  }
}

run().catch((e) => {
  console.error('摘要生成脚本执行失败：', e)
  process.exitCode = 1
})