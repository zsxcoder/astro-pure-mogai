import type { Root } from 'hast'
import type { Plugin } from 'unified'

/**
 * Rehype plugin to make external links go through safego.astro
 */
const rehypeSafegoLinks: Plugin<[], Root> = () => {
  return (tree) => {
    const exclude = ['blog.ljx.icu', 'localhost', '127.0.0.1', 'b.zsxcoder.top', 'mcy.zsxcoder.top']

    const visit = (node: any) => {
      if (node.type === 'element' && node.tagName === 'a') {
        const href = node.properties.href as string
        if (href) {
          try {
            const urlObj = new URL(href)
            if (
              !exclude.some(
                (domain) => urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
              )
            ) {
              // Make external links go through safego
              node.properties.href = `/safego?url=${encodeURIComponent(href)}`
            }
          } catch {
            // Invalid URL, leave as is
          }
        }
      }

      if (node.children) {
        node.children.forEach(visit)
      }
    }

    visit(tree)
  }
}

export default rehypeSafegoLinks
