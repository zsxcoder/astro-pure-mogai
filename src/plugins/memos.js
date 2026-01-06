function renderTalks() {
  const talkContainer = document.querySelector('#talk')
  if (!talkContainer) return
  if (typeof talkContainer.__shuoshuoCleanup === 'function') {
    talkContainer.__shuoshuoCleanup()
    talkContainer.__shuoshuoCleanup = null
  }
  talkContainer.innerHTML = ''
  const loadingEl = document.querySelector('#talk-loading')
  const setTalkLoading = (isLoading) => {
    if (loadingEl) {
      loadingEl.style.display = isLoading ? 'flex' : 'none'
      loadingEl.setAttribute('aria-busy', String(isLoading))
    }
    if (isLoading) {
      talkContainer.classList.add('talk-pending')
    } else {
      talkContainer.classList.remove('talk-pending')
    }
  }
  setTalkLoading(true)
  const generateIconSVG = () => {
    return `<svg viewBox="0 0 512 512"xmlns="http://www.w3.org/2000/svg"class="is-badge icon"><path d="m512 268c0 17.9-4.3 34.5-12.9 49.7s-20.1 27.1-34.6 35.4c.4 2.7.6 6.9.6 12.6 0 27.1-9.1 50.1-27.1 69.1-18.1 19.1-39.9 28.6-65.4 28.6-11.4 0-22.3-2.1-32.6-6.3-8 16.4-19.5 29.6-34.6 39.7-15 10.2-31.5 15.2-49.4 15.2-18.3 0-34.9-4.9-49.7-14.9-14.9-9.9-26.3-23.2-34.3-40-10.3 4.2-21.1 6.3-32.6 6.3-25.5 0-47.4-9.5-65.7-28.6-18.3-19-27.4-42.1-27.4-69.1 0-3 .4-7.2 1.1-12.6-14.5-8.4-26-20.2-34.6-35.4-8.5-15.2-12.8-31.8-12.8-49.7 0-19 4.8-36.5 14.3-52.3s22.3-27.5 38.3-35.1c-4.2-11.4-6.3-22.9-6.3-34.3 0-27 9.1-50.1 27.4-69.1s40.2-28.6 65.7-28.6c11.4 0 22.3 2.1 32.6 6.3 8-16.4 19.5-29.6 34.6-39.7 15-10.1 31.5-15.2 49.4-15.2s34.4 5.1 49.4 15.1c15 10.1 26.6 23.3 34.6 39.7 10.3-4.2 21.1-6.3 32.6-6.3 25.5 0 47.3 9.5 65.4 28.6s27.1 42.1 27.1 69.1c0 12.6-1.9 24-5.7 34.3 16 7.6 28.8 19.3 38.3 35.1 9.5 15.9 14.3 33.4 14.3 52.4zm-266.9 77.1 105.7-158.3c2.7-4.2 3.5-8.8 2.6-13.7-1-4.9-3.5-8.8-7.7-11.4-4.2-2.7-8.8-3.6-13.7-2.9-5 .8-9 3.2-12 7.4l-93.1 140-42.9-42.8c-3.8-3.8-8.2-5.6-13.1-5.4-5 .2-9.3 2-13.1 5.4-3.4 3.4-5.1 7.7-5.1 12.9 0 5.1 1.7 9.4 5.1 12.9l58.9 58.9 2.9 2.3c3.4 2.3 6.9 3.4 10.3 3.4 6.7-.1 11.8-2.9 15.2-8.7z"fill="#1da1f2"></path></svg>`
  }
  const debounce = (fn, waitMs = 60) => {
    let timer = null
    return (...args) => {
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => fn(...args), waitMs)
    }
  }

  const waitForLoadableResources = async (container, { timeoutMs = 3500, signal }) => {
    const getPendingTargets = () => {
      const pendingImages = [...container.querySelectorAll('img')].filter((img) => !img.complete)
      const pendingIframes = [...container.querySelectorAll('iframe')].filter(
        (iframe) => iframe.contentDocument == null
      )
      return { pendingImages, pendingIframes }
    }

    const waitForEvent = (target, type) =>
      new Promise((resolve) => {
        target.addEventListener(type, resolve, { once: true, signal })
      })

    const awaitImagesAndIframes = async () => {
      const { pendingImages, pendingIframes } = getPendingTargets()
      const promises = [
        ...pendingImages.flatMap((img) => [waitForEvent(img, 'load'), waitForEvent(img, 'error')]),
        ...pendingIframes.flatMap((iframe) => [
          waitForEvent(iframe, 'load'),
          waitForEvent(iframe, 'error')
        ])
      ]
      if (!promises.length) return
      await Promise.race([
        Promise.all(promises),
        new Promise((resolve) => window.setTimeout(resolve, timeoutMs))
      ])
    }

    const awaitFonts = async () => {
      const ready = document.fonts?.ready
      if (!ready) return
      await Promise.race([ready, new Promise((resolve) => window.setTimeout(resolve, timeoutMs))])
    }

    await Promise.allSettled([awaitImagesAndIframes(), awaitFonts()])
    return getPendingTargets()
  }

  const waterfallLayout = (a) => {
    function b(a, b) {
      var c = window.getComputedStyle(b)
      return parseFloat(c['margin' + a]) || 0
    }

    function c(a) {
      return a + 'px'
    }

    function d(a) {
      return parseFloat(a.style.top)
    }

    function e(a) {
      return parseFloat(a.style.left)
    }

    function f(a) {
      return a.clientWidth
    }

    function g(a) {
      return a.clientHeight
    }

    function h(a) {
      return d(a) + g(a) + b('Bottom', a)
    }

    function i(a) {
      return e(a) + f(a) + b('Right', a)
    }

    function j(a) {
      a = a.sort(function (a, b) {
        return h(a) === h(b) ? e(b) - e(a) : h(b) - h(a)
      })
    }
    'string' == typeof a && (a = document.querySelector(a))
    if (!a) return
    var l = [].map.call(a.children, function (a) {
      return ((a.style.position = 'absolute'), a)
    })
    a.style.position = 'relative'
    if (!l.length) {
      a.style.height = '0px'
      return
    }
    var m = []
    l.length && ((l[0].style.top = '0px'), (l[0].style.left = c(b('Left', l[0]))), m.push(l[0]))
    for (var n = 1; n < l.length; n++) {
      var o = l[n - 1],
        p = l[n],
        q = i(o) + f(p) <= f(a)
      if (!q) break
      ;((p.style.top = o.style.top), (p.style.left = c(i(o) + b('Left', p))), m.push(p))
    }
    for (; n < l.length; n++) {
      j(m)
      var p = l[n],
        r = m.pop()
      ;((p.style.top = c(h(r) + b('Top', p))), (p.style.left = c(e(r))), m.push(p))
    }
    j(m)
    var s = m[0]
    a.style.height = c(h(s) + b('Bottom', s))
  }

  const setupWaterfallLayoutOnce = (container, { onReady } = {}) => {
    const abortController = new AbortController()
    const { signal } = abortController

    const relayout = debounce(() => waterfallLayout(container), 80)
    window.addEventListener('resize', relayout, { signal })

    let didReady = false
    const markReady = () => {
      if (didReady) return
      didReady = true
      // 重新初始化 MediumZoom 以处理动态添加的图片
      if (window.mediumZoom) {
        window.mediumZoom('.prose .zoomable, .talk_content_text img.zoomable', {
          background: 'rgba(24, 24, 27, 0.9)'
        })
      }
      if (typeof onReady === 'function') onReady()
    }

    const scheduleLateRelayoutOnce = (targets) => {
      let didLateRelayout = false
      const lateRelayout = () => {
        if (didLateRelayout) return
        didLateRelayout = true
        relayout()
      }

      targets.pendingImages.forEach((img) => {
        img.addEventListener('load', lateRelayout, { once: true, signal })
        img.addEventListener('error', lateRelayout, { once: true, signal })
      })
      targets.pendingIframes.forEach((iframe) => {
        iframe.addEventListener('load', lateRelayout, { once: true, signal })
        iframe.addEventListener('error', lateRelayout, { once: true, signal })
      })
    }

    Promise.resolve()
      .then(() => waitForLoadableResources(container, { timeoutMs: 2500, signal }))
      .then((pendingTargets) => {
        relayout()
        requestAnimationFrame(() => {
          relayout()
          markReady()
        })
        if (pendingTargets.pendingImages.length || pendingTargets.pendingIframes.length) {
          scheduleLateRelayoutOnce(pendingTargets)
        }
      })
      .catch(() => {
        relayout()
        markReady()
      })

    return () => {
      abortController.abort()
    }
  }

  const fetchAndRenderTalks = () => {
    const url = 'https://pyq.mcyzsx.top/action/icefox?do=getPostData'
    const cacheKey = 'memosCache'
    const cacheTimeKey = 'memosCacheTime'
    const cacheDuration = 5 * 60 * 1000 // 缩短缓存时间为 5 分钟
    let cachedData = null
    let cachedTime = null
    
    // 尝试获取缓存数据，但处理可能的异常
    try {
      cachedData = localStorage.getItem(cacheKey)
      cachedTime = localStorage.getItem(cacheTimeKey)
    } catch (error) {
      console.log('LocalStorage is not available, using fallback data')
    }
    
    const now = Date.now()

    // 首先尝试从 API 获取数据
    fetch(url)
      .then((res) => {
        // 检查响应状态
        if (!res.ok) {
          throw new Error(`HTTP Error: ${res.status} ${res.statusText}`)
        }
        
        // 尝试解析响应数据
        return res.json()
      })
      .then((data) => {
        // 根据文档验证数据格式
        if (data.code === 1 && data.msg === "获取文章成功！" && data.data) {
          // 处理单篇文章和多篇文章的情况
          const items = Array.isArray(data.data.items) ? data.data.items : (data.data.id ? [data.data] : [])
          
          if (items.length > 0) {
            // 尝试缓存数据
            try {
              localStorage.setItem(cacheKey, JSON.stringify(items))
              localStorage.setItem(cacheTimeKey, now.toString())
            } catch (error) {
              // 静默处理缓存错误
            }
            renderTalksList(items)
          } else {
            // 显示空状态
            talkContainer.innerHTML = '<div style="text-align: center; padding: 40px 0; color: #666;">暂无数据</div>'
            setTalkLoading(false)
          }
        } else {
          // 显示错误状态
          talkContainer.innerHTML = '<div style="text-align: center; padding: 40px 0; color: #666;">数据格式错误</div>'
          setTalkLoading(false)
        }
      })
      .catch((err) => {
        // 过滤掉包含内存地址的错误信息
        const errorMsg = err.message || String(err)
        if (!/0x[0-9a-f]+/i.test(errorMsg)) {
          // 只在开发环境下打印错误信息
          if (typeof process === 'undefined' || process.env?.NODE_ENV === 'development') {
            console.error('Error fetching memos:', errorMsg)
          }
        }
        // 尝试使用缓存数据
        if (cachedData && cachedTime) {
          try {
            const cachedTimeNum = parseInt(cachedTime, 10)
            if (!isNaN(cachedTimeNum) && now - cachedTimeNum < cacheDuration) {
              const parsedData = JSON.parse(cachedData)
              if (Array.isArray(parsedData)) {
                renderTalksList(parsedData)
                return
              }
            }
          } catch (error) {
            // 静默处理缓存解析错误
          }
        }
        // 显示错误状态
        talkContainer.innerHTML = '<div style="text-align: center; padding: 40px 0; color: #666;">获取数据失败</div>'
        setTalkLoading(false)
      })
  }

  const renderTalksList = (list) => {
    console.log('Rendering talks list with', list.length, 'items')
    // 清空容器
    talkContainer.innerHTML = ''
    // 渲染每个项目
    list.map(formatTalk).forEach((item) => talkContainer.appendChild(generateTalkElement(item)))
    // 设置瀑布流布局
    talkContainer.__shuoshuoCleanup = setupWaterfallLayoutOnce(talkContainer, {
      onReady: () => {
        console.log('Talks list rendered successfully')
        setTalkLoading(false)
      }
    })
  }

  const formatTalk = (item) => {
    const date = formatTime(item.created_at)
    let content = item.content || ''
    
    // 初始化 marked 配置
    if (window.marked) {
      // 配置 marked 支持代码高亮
      window.marked.setOptions({
        highlight: function(code, lang) {
          try {
            if (window.hljs && window.hljs.highlight) {
              const language = window.hljs.getLanguage(lang) ? lang : 'plaintext';
              return window.hljs.highlight(code, { language }).value;
            } else {
              // 如果 highlight.js 未加载，返回原始代码
              return code;
            }
          } catch (error) {
            // 如果高亮失败，返回原始代码
            return code;
          }
        },
        langPrefix: 'hljs language-'
      });
    }
    
    const marked = window.marked || {
      // 降级处理：如果 marked 未加载，使用简单的替换
      parse: (text) => text
        .replace(/```\s*(\w*)\s*\n([\s\S]*?)\n\s*```/g, function(match, lang, code) {
          return `<pre><code class="language-${lang || 'plaintext'}">${code}</code></pre>`;
        })
        .replace(
          /(?<!\!)\[(.*?)\]\((.*?)\)/g,
          `<a href="$2" target="_blank" rel="nofollow noopener">@$1</a>`
        )
        .replace(
          /!\[(.*?)\]\((.*?)\)/g,
          `<img src="$2" alt="$1" class="zoomable">`
        )
        .replace(/- \[ \]/g, '⚪')
        .replace(/- \[x\]/g, '⚫')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
    }
    
    // 使用 marked 解析 Markdown
    let parsedContent = typeof marked.parse === 'function' 
      ? marked.parse(content) 
      : content
    
    // 为图片添加 zoomable 类
    parsedContent = parsedContent.replace(
      /<img src="([^"]+)" alt="([^"]*)"\/?>/g,
      '<img src="$1" alt="$2" class="zoomable">'
    )
    
    content = `<div class="talk_content_text prose">${parsedContent}</div>`

    // 图片
    if (Array.isArray(item.images) && item.images.length > 0) {
      const imgDiv = document.createElement('div')
      imgDiv.className = 'prose'
      item.images.forEach((img) => {
        const imgTag = document.createElement('img')
        imgTag.src = img.image_url + '?fmt=webp&q=75'
        imgTag.className = 'zoomable'
        imgDiv.appendChild(imgTag)
      })
      content += imgDiv.outerHTML
    }

    // 外链 / GitHub 项目
    if (['WEBSITE', 'GITHUBPROJ'].includes(item.extension_type)) {
      let siteUrl = '',
        title = ''
      let extensionBack = 'https://p.liiiu.cn/i/2024/07/27/66a4632bbf06e.webp'

      // 解析 extension 字段
      try {
        const extObj =
          typeof item.extension === 'string' ? JSON.parse(item.extension) : item.extension
        siteUrl = extObj.site || extObj.url || item.extension
        title = extObj.title || siteUrl
      } catch {
        siteUrl = item.extension
        title = siteUrl
      }

      // 特殊处理 GitHub 项目
      if (item.extension_type === 'GITHUBPROJ') {
        extensionBack = 'https://p.liiiu.cn/i/2024/07/27/66a461a3098aa.webp'

        // 提取 GitHub 项目名
        const match = siteUrl.match(/^https?:\/\/github\.com\/[^/]+\/([^/?#]+)/i)
        if (match) {
          title = match[1] // 获取仓库名
        } else {
          // fallback：从最后一个路径段提取
          try {
            const parts = new URL(siteUrl).pathname.split('/').filter(Boolean)
            title = parts.pop() || siteUrl
          } catch {
            // 如果 URL 无效则保留原始
          }
        }
      }

      // 输出 HTML 结构
      content += `
                <div class="shuoshuo-external-link">
                    <a class="external-link" href="${siteUrl}" target="_blank" rel="nofollow noopener">
                        <div class="external-link-left" style="background-image:url(${extensionBack})"></div>
                        <div class="external-link-right">
                            <div class="external-link-title">${title}</div>
                            <div>点击跳转<i class="fa-solid fa-angle-right"></i></div>
                        </div>
                    </a>
                </div>`
    }

    // 音乐
    if (item.extension_type === 'MUSIC' && item.extension) {
      const link = item.extension
      let server = ''
      if (link.includes('music.163.com')) server = 'netease'
      else if (link.includes('y.qq.com')) server = 'tencent'
      const idMatch = link.match(/id=(\d+)/)
      const id = idMatch ? idMatch[1] : ''
      if (server && id) {
        content += `<meting-js server="${server}" type="song" id="${id}" api="https://met.liiiu.cn/meting/api?server=:server&type=:type&id=:id&auth=:auth&r=:r"></meting-js>`
      }
    }

    // 视频
    if (item.extension_type === 'VIDEO' && item.extension) {
      const video = item.extension
      if (video.startsWith('BV')) {
        const bilibiliUrl = `https://www.bilibili.com/blackboard/html5mobileplayer.html?bvid=${video}&as_wide=1&high_quality=1&danmaku=0`
        content += `
                    <div style="position: relative; padding: 30% 45%; margin-top: 10px;">
                        <iframe style="position:absolute;width:100%;height:100%;left:0;top:0;border-radius:12px;" 
                                src="${bilibiliUrl}" 
                                frameborder="no" 
                                allowfullscreen="true" 
                                loading="lazy"></iframe>
                    </div>`
      } else {
        const youtubeUrl = `https://www.youtube.com/embed/${video}`
        content += `
                    <div style="position: relative; padding: 30% 45%; margin-top: 10px;">
                        <iframe style="position:absolute;width:100%;height:100%;left:0;top:0;border-radius:12px;" 
                                src="${youtubeUrl}" 
                                title="YouTube video player" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                allowfullscreen></iframe>
                    </div>`
      }
    }

    return {
      content,
      user: item.username || '钟神秀',
      avatar: 'https://home.zsxcoder.top/api/avatar.png',
      date,
      location: item.position || '',
      locationUrl: item.positionUrl || '',
      tags:
        Array.isArray(item.tags) && item.tags.length ? item.tags.map((t) => t.name) : ['icefox朋友圈'],
      text: content.replace(/\[(.*?)\]\((.*?)\)/g, '[链接]'),
      originalUrl: 'https://pyq.mcyzsx.top'
    }
  }

  const generateTalkElement = (item) => {
    const talkItem = document.createElement('div')
    talkItem.className = 'talk_item'

    const talkMeta = document.createElement('div')
    talkMeta.className = 'talk_meta'
    const avatar = document.createElement('img')
    avatar.className = 'no-lightbox avatar'
    avatar.src = item.avatar

    const info = document.createElement('div')
    info.className = 'info'
    const nick = document.createElement('span')
    nick.className = 'talk_nick'
    nick.innerHTML = `${item.user} ${generateIconSVG()}`
    const date = document.createElement('span')
    date.className = 'talk_date'
    date.textContent = item.date
    info.appendChild(nick)
    info.appendChild(date)
    talkMeta.appendChild(avatar)
    talkMeta.appendChild(info)

    const talkContent = document.createElement('div')
    talkContent.className = 'talk_content'
    talkContent.innerHTML = item.content

    const talkBottom = document.createElement('div')
    talkBottom.className = 'talk_bottom'
    const tags = document.createElement('div')
    tags.style.display = 'flex'
    tags.style.alignItems = 'center'
    tags.style.gap = '8px'
    
    // 标签部分，改为可点击的链接
    const tagContainer = document.createElement('a')
    tagContainer.href = item.originalUrl || 'https://pyq.mcyzsx.top'
    tagContainer.target = '_blank'
    tagContainer.rel = 'nofollow noopener'
    tagContainer.style.textDecoration = 'none'
    tagContainer.style.color = 'inherit'
    
    const tag = document.createElement('span')
    tag.className = 'talk_tag'
    tag.textContent = `🏷️${item.tags}`
    tagContainer.appendChild(tag)
    tags.appendChild(tagContainer)
    
    // 地点信息
    if (item.location) {
      const loc = document.createElement('span')
      loc.className = 'talk_tag'
      loc.style.display = 'inline-flex'
      loc.style.alignItems = 'center'
      
      if (item.locationUrl) {
        const locLink = document.createElement('a')
        locLink.href = item.locationUrl
        locLink.target = '_blank'
        locLink.rel = 'nofollow noopener'
        locLink.textContent = `🌍${item.location}`
        locLink.style.textDecoration = 'none'
        locLink.onmouseover = () => {
          locLink.style.textDecoration = 'underline'
        }
        locLink.onmouseout = () => {
          locLink.style.textDecoration = 'none'
        }
        loc.appendChild(locLink)
      } else {
        loc.textContent = `🌍${item.location}`
      }
      tags.appendChild(loc)
    }

    const commentLink = document.createElement('a')
    commentLink.href = 'javascript:;'
    commentLink.onclick = () => goComment(item.text)
    commentLink.className = 'quote-btn'
    commentLink.title = '引用此说说'
    const icon = document.createElement('span')
    icon.className = 'icon'
    icon.innerHTML = '<i class="fa-solid fa-quote-left fa-fw"></i>'
    commentLink.appendChild(icon)

    talkBottom.appendChild(tags)
    talkBottom.appendChild(commentLink)

    talkItem.appendChild(talkMeta)
    talkItem.appendChild(talkContent)
    talkItem.appendChild(talkBottom)

    return talkItem
  }

  const goComment = (e) => {
    const match = e.match(/<div class="talk_content_text">([\s\S]*?)<\/div>/)
    const textContent = match ? match[1] : ''
    const textarea = document.querySelector('.wl-editor')
    textarea.value = `> ${textContent}\n\n`
    textarea.focus()
    // 使用类似友链页面的提示机制
    document.dispatchEvent(
      new CustomEvent('toast', {
        detail: {
          message: '已为您引用该说说，不删除空格效果更佳 ✨'
        }
      })
    )
  }

  const formatTime = (time) => {
    if (!time) return '未知时间'
    // 确保 time 是数字类型
    const timestamp = typeof time === 'string' ? parseInt(time, 10) : time
    if (isNaN(timestamp)) return '无效时间'
    
    const d = new Date(timestamp * 1000) // 转换为毫秒
    if (isNaN(d.getTime())) return '无效时间'
    
    const pad = (n) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  fetchAndRenderTalks()
}

renderTalks()