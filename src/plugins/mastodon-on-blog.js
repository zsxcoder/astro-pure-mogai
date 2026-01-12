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

  const Dataset = document.currentScript.dataset
  const Config = {
    instance: Dataset.instance, // required
    userId: Dataset.userId, // required
    staticStatusesDataPath: Dataset.staticStatusesDataPath,
    token: Dataset.token,
    tag: Dataset.tag,
    shownMax: +Dataset.shownMax || 15
  }

  function loadFile (path, token) {
    return fetch(path, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .catch(e => {
        console.error('Load file ' + path + ' failed.')
        throw e
      })
  }

  const formatTime = (time) => {
    const d = new Date(time)
    const pad = (n) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const getEmojiWrapper = (emojisData) => 
    (match, p1) => {
      if (!emojisData) return match
      const data = emojisData.find(e => e.shortcode === p1)
      return data ? `<img class="emoji" src="${data.static_url}"/>` : match
    }

  const formatContent = (content, emojis) => {
    let formatted = content.replace(/:(\w+):/g, getEmojiWrapper(emojis))
    // 先移除所有的 invisible span 标签
    formatted = formatted.replace(/<span class="invisible">([^<]+)<\/span>/g, '$1');
    // 处理外链，确保经过 safego 中转页
    formatted = formatted.replace(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g, function(match, href, text) {
      // 修剪文本内容前后的空白字符
      text = text.trim();
      // 检查是否是外链
      const exclude = ['blog.ljx.icu', 'localhost', '127.0.0.1', 'b.zsxcoder.top', 'mcy.zsxcoder.top'];
      try {
        const urlObj = new URL(href);
        if (exclude.some(domain => urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain))) {
          return `<a href="${href}" target="_blank" rel="nofollow noopener">${text}</a>`;
        } else {
          return `<a href="/safego?url=${encodeURIComponent(href)}" target="_blank" rel="nofollow noopener">${text}</a>`;
        }
      } catch {
        return `<a href="${href}" target="_blank" rel="nofollow noopener">${text}</a>`;
      }
    });
    formatted = formatted.replace(/\n/g, '<br>')
    return `<div class="talk_content_text">${formatted}</div>`
  }

  const formatTalk = (item) => {
    const d = item.reblog || item
    const content = formatContent(d.content, d.emojis)
    
    // 图片处理
    let imagesContent = ''
    if (d.media_attachments && d.media_attachments.some(e => e.type === 'image')) {
      const imgDiv = document.createElement('div')
      imgDiv.className = 'prose'
      d.media_attachments.filter(e => e.type === 'image').forEach((img) => {
        const imgTag = document.createElement('img')
        imgTag.src = img.url
        imgTag.className = 'zoomable'
        imgTag.loading = 'lazy'
        imgDiv.appendChild(imgTag)
      })
      imagesContent = imgDiv.outerHTML
    }
    
    return {
      content: content + imagesContent,
      user: '钟神秀',
      avatar: 'https://home.zsxcoder.top/api/avatar.png',
      date: formatTime(d.created_at),
      location: '',
      tags: ['日常'],
      text: content.replace(/<[^>]+>/g, '')
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
    const tag = document.createElement('span')
    tag.className = 'talk_tag'
    tag.textContent = `🏷️${item.tags}`
    tags.appendChild(tag)

    const commentLink = document.createElement('a')
    commentLink.href = 'javascript:;'
    commentLink.onclick = () => goComment(item.text)
    commentLink.className = 'quote-btn'
    commentLink.title = '引用此动态'
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
    const quoteText = `> ${e}\n\n`
    
    // 复制引用文本到剪贴板
    navigator.clipboard.writeText(quoteText)
      .then(() => {
        // 跳转到页面底部的 Giscus 评论区
        const giscusElement = document.querySelector('.giscus')
        if (giscusElement) {
          giscusElement.scrollIntoView({ behavior: 'smooth' })
          
          // 等待一下，确保滚动完成
          setTimeout(() => {
            // 尝试聚焦到 Giscus 评论输入框
            const iframes = document.querySelectorAll('.giscus iframe')
            iframes.forEach(iframe => {
              try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
                const textarea = iframeDoc.querySelector('textarea')
                if (textarea) {
                  textarea.focus()
                }
              } catch (error) {
                // 跨域访问可能会失败，忽略错误
              }
            })
          }, 500)
        }
        
        // 显示提示消息
        document.dispatchEvent(
          new CustomEvent('toast', {
            detail: {
              message: '已复制引用文本并跳转到评论区，请粘贴使用 ✨'
            }
          })
        )
      })
      .catch(err => {
        console.error('无法复制文本: ', err)
        
        // 即使复制失败，也跳转到评论区
        const giscusElement = document.querySelector('.giscus')
        if (giscusElement) {
          giscusElement.scrollIntoView({ behavior: 'smooth' })
        }
        
        // 显示提示消息
        document.dispatchEvent(
          new CustomEvent('toast', {
            detail: {
              message: '已跳转到评论区，请手动复制引用文本 ✨'
            }
          })
        )
      })
  }

  const fetchAndRenderTalks = () => {
    const path = Config.staticStatusesDataPath ||
      `https://${Config.instance}/api/v1/accounts/${Config.userId}/statuses?tagged=${Config.tag || ''}&exclude_replies=true`

    loadFile(path, Config.token)
      .then(data => {
        if (data.status >= 400) {
          throw new Error(`HTTP Error: ${data.status} ${data.statusText}`)
        }
        return data.json()
      })
      .then(data => {
        // 确保返回的数据是数组
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: expected array')
        }
        const list = data.slice(0, Config.shownMax || data.length)
        list.map(formatTalk).forEach((item) => talkContainer.appendChild(generateTalkElement(item)))
        talkContainer.__shuoshuoCleanup = setupWaterfallLayoutOnce(talkContainer, {
          onReady: () => {
            setTalkLoading(false)
            // 重新初始化 MediumZoom 以支持动态加载的图片
            if (window.mediumZoom) {
              // 使用与组件相同的配置选项初始化
              window.mediumZoom('.prose .zoomable', {
                background: 'rgba(24, 24, 27, 0.9)'
              })
            }
          }
        })
      })
      .catch((err) => {
        // 过滤掉包含内存地址的错误信息
        const errorMsg = err.message || String(err)
        if (!/0x[0-9a-f]+/i.test(errorMsg)) {
          console.error('Error fetching Mastodon data:', errorMsg)
        }
        setTalkLoading(false)
      })
  }

  fetchAndRenderTalks()
}

renderTalks()