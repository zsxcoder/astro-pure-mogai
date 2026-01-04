export interface DomainIconMap {
  [domain: string]: string
}

export const domainIcons: DomainIconMap = {
  'github.com': 'github',
  'gitlab.com': 'gitlab',
  'discord.com': 'discord',
  'youtube.com': 'youtube',
  'instagram.com': 'instagram',
  'twitter.com': 'x',
  'x.com': 'x',
  'telegram.org': 'telegram',
  't.me': 'telegram',
  'reddit.com': 'reddit',
  'bluesky.app': 'bluesky',
  'tiktok.com': 'tiktok',
  'weibo.com': 'weibo',
  'steamcommunity.com': 'steam',
  'bilibili.com': 'bilibili',
  'zhihu.com': 'zhihu',
  'coolapk.com': 'coolapk',
  'music.163.com': 'netease',
  'android.com': 'androidstudio',
  'apple.com': 'apple',
  'google.com': 'chrome',
  'mozilla.org': 'firefox',
  'safari.com': 'safari',
  'microsoft.com': 'edge',
  'jetbrains.com': 'intellij-idea',
  'vim.org': 'neovim',
  'notion.so': 'notion',
  'qt.io': 'qt',
  'tailscale.com': 'tailscale',
  'unity.com': 'unity',
  'warp.dev': 'warp',
  'zerotier.com': 'zerotier'
}

/**
 * Get icon name from domain
 * @param url - The URL to get icon from
 * @returns Icon name or empty string if no match
 */
export function getIconFromDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname
    
    // Check exact match first
    if (domainIcons[domain]) {
      return domainIcons[domain]
    }
    
    // Check subdomain match (e.g., gist.github.com -> github.com)
    const parts = domain.split('.')
    for (let i = 1; i < parts.length - 1; i++) {
      const subdomain = parts.slice(i).join('.')
      if (domainIcons[subdomain]) {
        return domainIcons[subdomain]
      }
    }
    
    return ''
  } catch (error) {
    return ''
  }
}
