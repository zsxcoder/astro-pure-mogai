import type { Root } from 'hast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

interface Options {
  exclude?: string[]
}

const rehypeSafeGo: Plugin<[Options?], Root> = (options = {}) => {
  const exclude = options.exclude || []

  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && node.properties && typeof node.properties.href === 'string') {
        const href = node.properties.href

        // 简单的外链判断：以 http 开头
        const isExternal = href.startsWith('http') || href.startsWith('//')

        if (isExternal) {
          try {
            const urlObj = new URL(href, 'https://example.com') // 第二个参数用于解析相对路径，虽然这里只处理 http 开头
            const hostname = urlObj.hostname

            // 排除列表中的域名（包含自身域名）
            if (exclude.some((domain) => hostname === domain || hostname.endsWith('.' + domain))) {
              return
            }

            // 重写 href 到中转页
            node.properties.href = `/safego?url=${encodeURIComponent(href)}`
            // 强制新标签页打开
            node.properties.target = '_blank'
            node.properties.rel = 'noopener noreferrer'
          } catch (e) {
            // 解析失败忽略
          }
        }
      }
    })
  }
}

export default rehypeSafeGo
