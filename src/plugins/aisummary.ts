{/* global aisummaryTypingAnimate, aisummaryPostSelector */}
console.log('\n %c AISummary（静态版） %c Auther: Ljxme \n', 'color: #fadfa3; background: #030307; padding:5px 0;', 'background: #fadfa3; padding:5px 0;')

// 运行标记，防止重复动画
let aisummaryIsRunning: boolean = false;

// 核心对象：仅保留静态摘要读取与动画显示
const aisummary = {
  /**
   * 获取摘要纯文本
   * @returns 优先返回 data-ai-summary 的值，否则返回元素文本
   */
  getStaticSummary(): string {
    const el = (document.querySelector('.aisummary-explanation') || document.querySelector('.sparkLite-explanation')) as HTMLElement | null;
    if (!el) return '';
    const attr = el.getAttribute('data-ai-summary');
    const text = attr && attr.trim().length ? attr : (el.textContent || '').trim();
    return text || '';
  },

  /**
   * 展示摘要文本：根据开关决定是否执行打字机动画
   * @param text 完整摘要文本
   */
  aiShowAnimation(text: string): void {
    const element = (document.querySelector('.aisummary-explanation') || document.querySelector('.sparkLite-explanation')) as HTMLElement | null;
    if (!element || !text) return;
    if (aisummaryIsRunning) return;

    // 不启用动画时直接渲染
    if (typeof aisummaryTypingAnimate !== 'undefined' && !aisummaryTypingAnimate) {
      element.innerHTML = text;
      element.style.maxHeight = 'none';
      element.style.overflow = 'visible';
      return;
    }

    aisummaryIsRunning = true;
    const TYPING_DELAY = 25;
    const PUNCTUATION_MULT = 6;

    element.style.display = 'block';
    element.style.maxHeight = 'none';
    element.style.overflow = 'visible';
    element.innerHTML = '生成中...' + '<span class="blinking-cursor"></span>';

    let animationRunning = true;
    let currentIndex = 0;
    let lastUpdateTime = performance.now();
    let started = false;

    const animate = (): void => {
      if (currentIndex < text.length && animationRunning) {
        const currentTime = performance.now();
        const timeDiff = currentTime - lastUpdateTime;
        const letter = text.slice(currentIndex, currentIndex + 1);
        const isPunctuation = /[，。！、？,.!?]/.test(letter);
        const delay = isPunctuation ? TYPING_DELAY * PUNCTUATION_MULT : TYPING_DELAY;

        if (timeDiff >= delay) {
          lastUpdateTime = currentTime;
          currentIndex++;
          if (currentIndex < text.length) {
            element.innerHTML = text.slice(0, currentIndex) + '<span class="blinking-cursor"></span>';
          } else {
            element.innerHTML = text;
            element.style.display = 'block';
            aisummaryIsRunning = false;
            observer.disconnect();
          }
        }
        requestAnimationFrame(animate);
      }
    };

    // 进入视口时才运行动画，提高性能
    const observer = new IntersectionObserver((entries): void => {
      const isVisible = entries[0].isIntersecting;
      animationRunning = isVisible;
      if (animationRunning && !started) {
        started = true;
        setTimeout(() => requestAnimationFrame(animate), 200);
      }
    }, { threshold: 0 });

    const container = (document.querySelector('.aisummary-container') || document.querySelector('.post-SparkLite')) as HTMLElement | null;
    if (container) observer.observe(container);
  }
};

/**
 * 确保摘要容器插入到正文容器的开头位置
 */
function ensureSummaryPosition(): void {
  const containerSelector = typeof aisummaryPostSelector === 'string' && aisummaryPostSelector.trim().length
    ? aisummaryPostSelector
    : '#content';
  const contentEl = document.querySelector(containerSelector) as HTMLElement | null;
  const summaryEl = (document.querySelector('.aisummary-container') || document.querySelector('.post-SparkLite')) as HTMLElement | null;
  if (!contentEl || !summaryEl) return;
  if (!contentEl.contains(summaryEl)) {
    contentEl.insertBefore(summaryEl, contentEl.firstChild);
  }
}

/**
 * 初始化 AISummary：读取静态摘要并渲染（或执行动画）
 */
function initializeAISummary(): void {
  const summaryEl = (document.querySelector('.aisummary-explanation') || document.querySelector('.sparkLite-explanation')) as HTMLElement | null;
  if (!summaryEl) return;
  ensureSummaryPosition();
  const summary = aisummary.getStaticSummary();
  if (!summary) return;
  aisummary.aiShowAnimation(summary);
}

/**
 * 保证在各种加载时机下都能触发初始化
 * - 若文档仍在解析（readyState === 'loading'），监听 DOMContentLoaded
 * - 若文档已解析完成，立即执行初始化
 * - 为避免重复绑定，先移除旧的 DOMContentLoaded 监听器
 */
(function ensureInit(): void {
  document.removeEventListener('DOMContentLoaded', initializeAISummary);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAISummary);
  } else {
    initializeAISummary();
  }
})();