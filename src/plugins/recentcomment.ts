/**
 * 获取并处理最新评论数据
 * 通过Worker端点获取Giscus评论并格式化显示
 */

// 定义评论数据接口
interface GiscusComment {
  nick: string // 评论者昵称
  comment: string // 评论内容
  url: string // 评论页面URL
  avatar: string // 头像URL
  time: number // 评论时间戳
  like?: number // 点赞数
  addr?: string // 地址
}

// 定义Worker响应接口
interface WorkerResponse {
  data: {
    repository: {
      discussions: {
        nodes: Array<{
          title: string
          body: string
          author: {
            login: string
            avatarUrl: string
          } | null
          createdAt: string
          id: string
          comments: {
            nodes: Array<{
              body: string
              author: {
                login: string
                avatarUrl: string
              } | null
              createdAt: string
              id: string
            }>
          }
        }>
      }
    }
  }
}

/**
 * 获取最新评论数据
 * @param limit 获取评论数量限制
 * @returns 格式化后的评论数据
 */
export async function fetchRecentComments(limit: number = 5): Promise<GiscusComment[]> {
  try {
    // 使用新的 worker 端点
    const apiUrl = 'https://giscus.mcyzsx.top/api/giscus'
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        owner: 'zsxcoder',
        repo: 'astro-pure-mogai'
      })
    })
    
    if (!response.ok) {
      throw new Error(`获取评论失败: ${response.status}`)
    }

    const result: WorkerResponse = await response.json()
    
    // 检查响应结构
    if (!result || !result.data || !result.data.repository || !result.data.repository.discussions || !result.data.repository.discussions.nodes) {
      console.warn('响应数据结构不完整，返回空评论列表')
      return []
    }
    
    // 获取所有讨论
    const discussions = result.data.repository.discussions.nodes
    
    // 收集所有评论
    let allComments: GiscusComment[] = []
    
    discussions.forEach(discussion => {
      // 跳过没有评论的讨论
      if (!discussion.comments || !discussion.comments.nodes || !discussion.comments.nodes.length) return
      
      // 从讨论标题中提取页面 URL
      let url = '/'
      try {
        const title = discussion.title.trim()
        if (title) {
          url = title.startsWith('/') ? title : `/${title}`
        }
      } catch (error) {
        console.error('解析评论 URL 出错:', error)
      }
      
      // 处理每条评论
      discussion.comments.nodes.forEach(comment => {
        // 处理匿名用户
        const authorName = comment.author?.login || '匿名用户'
        const avatarUrl = comment.author?.avatarUrl || 'https://github.com/ghost.png'
        
        allComments.push({
          nick: authorName,
          comment: stripHtml(comment.body || ''),
          url: url,
          avatar: avatarUrl,
          time: comment.createdAt ? new Date(comment.createdAt).getTime() : Date.now(),
          like: 0 // 暂不支持点赞数
        })
      })
    })
    
    // 按时间排序（最新的在前）
    allComments.sort((a, b) => b.time - a.time)
    
    // 返回指定数量的评论
    return allComments.slice(0, limit)
  } catch (error) {
    console.error('获取最新评论出错:', error)
    return []
  }
}

/**
 * 格式化评论时间
 * @param timestamp 时间戳
 * @returns 格式化后的时间字符串
 */
export function formatCommentTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 一分钟内
  if (diff < 60 * 1000) {
    return '刚刚'
  }

  // 一小时内
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  }

  // 一天内
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  }

  // 一周内
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
  }

  // 其他情况显示具体日期
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * 清理HTML标签
 * @param html HTML字符串
 * @returns 清理后的纯文本
 */
export function stripHtml(html: string): string {
  // 使用正则表达式替代DOM操作，可在服务器端运行
  return html.replace(/<[^>]*>/g, '')
}

/**
 * 截断文本
 * @param text 原始文本
 * @param length 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string, length: number = 100): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}
