/**
 * AISummary 前端配置
 * - aisummaryTypingAnimate：是否启用打字机动画（true 动画；false 直接渲染）
 * - aisummaryPostSelector：摘要容器插入的正文选择器（如 #content / .post-content）
 * - aisummaryWordLimit：提交给 API 的最大字数限制（后端/脚本参考）
 *
 * 说明：本文件作为普通脚本注入页面（非模块），使用 var 保持全局可见。
 */
// AI 摘要脚本配置（供脚本读取）：
// AI_SUMMARY_API=https://aisummary.ljx.icu/api/spark-proxy
// AI_SUMMARY_KEY=
// 说明：上面两行仅作为配置占位与注释，被离线脚本解析，不会在浏览器中使用。
// AISummary 静态摘要配置：
var aisummaryTypingAnimate = true; // true 开启打字机动画；false 直接渲染文本
var aisummaryPostSelector = '#content'; // 文章内容容器选择器，例如 #article-container, .post-content
var aisummaryWordLimit = 8000; // 提交给 API 的最大字数限制