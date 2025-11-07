// console.log("\n %c SparkLite AI 摘要（静态版） %c Auther: Ljxme \n", "color: #fadfa3; background: #030307; padding:5px 0;", "background: #fadfa3; padding:5px 0;")

// 运行标记，防止重复动画
let sparkLiteIsRunning: boolean = false;

// 核心对象：仅保留静态摘要读取与动画显示
const sparkLite = {
    /**
     * 从页面中读取静态摘要文本
     * 优先读取 .sparkLite-explanation 的 data-ai-summary 属性，如果没有则回退到文本内容。
     */
    getStaticSummary: function (): string {
        const el = document.querySelector('.sparkLite-explanation') as HTMLElement | null;
        if (!el) return '';
        const attr = el.getAttribute('data-ai-summary');
        const text = attr && attr.trim().length ? attr : (el.textContent || '').trim();
        return text || '';
    },

    /**
     * 打字机动画展示摘要文本
     * 当 sparkLite_typingAnimate 为 false 时，直接渲染，不执行动画。
     */
    aiShowAnimation: function (text: string): void {
        const element = document.querySelector('.sparkLite-explanation') as HTMLElement | null;
        if (!element || !text) return;
        if (sparkLiteIsRunning) return;

        // 不启用动画时直接渲染
        if (typeof sparkLite_typingAnimate !== 'undefined' && !sparkLite_typingAnimate) {
            element.innerHTML = text;
            element.style.maxHeight = 'none';
            element.style.overflow = 'visible';
            return;
        }

        sparkLiteIsRunning = true;
        const typingDelay = 25;
        const punctuationDelayMultiplier = 6;

        element.style.display = 'block';
        element.style.maxHeight = 'none';
        element.style.overflow = 'visible';
        element.innerHTML = '生成中...' + '<span class="blinking-cursor"></span>';

        let animationRunning: boolean = true;
        let currentIndex = 0;
        let initialAnimation: boolean = true;
        let lastUpdateTime = performance.now();

        const animate = () => {
            if (currentIndex < text.length && animationRunning) {
                const currentTime = performance.now();
                const timeDiff = currentTime - lastUpdateTime;
                const letter = text.slice(currentIndex, currentIndex + 1);
                const isPunctuation = /[，。！、？,.!?]/.test(letter);
                const delay = isPunctuation ? typingDelay * punctuationDelayMultiplier : typingDelay;

                if (timeDiff >= delay) {
                    element.innerText = text.slice(0, currentIndex + 1);
                    lastUpdateTime = currentTime;
                    currentIndex++;

                    if (currentIndex < text.length) {
                        element.innerHTML = text.slice(0, currentIndex) + '<span class="blinking-cursor"></span>';
                    } else {
                        element.innerHTML = text;
                        element.style.display = 'block';
                        sparkLiteIsRunning = false;
                        observer.disconnect();
                    }
                }
                requestAnimationFrame(animate);
            }
        };

        // 进入视口时才运行动画，提高性能
        const observer = new IntersectionObserver((entries) => {
            const isVisible = entries[0].isIntersecting;
            animationRunning = isVisible;
            if (animationRunning && initialAnimation) {
                setTimeout(() => {
                    requestAnimationFrame(animate);
                }, 200);
            }
        }, { threshold: 0 });

        const container = document.querySelector('.post-SparkLite');
        if (container) observer.observe(container);
    }
};

/**
 * 保证摘要容器位于正文容器的开头位置。
 * 若摘要容器不在 `#content`（或用户配置的选择器）内，则移动到正文容器首位。
 */
function ensureSummaryPosition(): void {
    const containerSelector = typeof sparkLite_postSelector === 'string' && sparkLite_postSelector.trim().length
        ? sparkLite_postSelector
        : '#content';
    const contentEl = document.querySelector(containerSelector) as HTMLElement | null;
    const summaryEl = document.querySelector('.post-SparkLite') as HTMLElement | null;
    if (!contentEl || !summaryEl) return;
    if (!contentEl.contains(summaryEl)) {
        contentEl.insertBefore(summaryEl, contentEl.firstChild);
    }
}

/**
 * 初始化入口：读取静态摘要并渲染（或执行动画）
 */
function initializeSparkLite(): void {
    // 仅在摘要容器存在的页面执行
    const summaryEl = document.querySelector('.sparkLite-explanation') as HTMLElement | null;
    if (!summaryEl) return;

    // 位置校正：确保摘要块在正文容器的最前面
    ensureSummaryPosition();

    const summary = sparkLite.getStaticSummary();
    if (!summary) return;
    sparkLite.aiShowAnimation(summary);
}

// 初始加载时运行
document.removeEventListener('DOMContentLoaded', initializeSparkLite);
document.addEventListener('DOMContentLoaded', initializeSparkLite);