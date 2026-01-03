import React from 'react';
import { Copy, Check } from 'lucide-react';
import config from '../site.config';

const SiteInfo: React.FC = () => {
    const [copied, setCopied] = React.useState(false);
    const [copyingField, setCopyingField] = React.useState<string | null>(null);

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopyingField(field);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                setCopyingField(null);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Get site info from config
    const applyTip = config.integ?.links?.applyTip || [];
    const getValue = (name: string) => {
        return applyTip.find(item => item.name === name)?.val || '';
    };

    const siteInfoItems = [
        { label: '名称', value: getValue('Name'), field: 'name' },
        { label: '描述', value: getValue('Desc'), field: 'description' },
        { label: '地址', value: getValue('Link'), field: 'url' },
        { label: '头像', value: getValue('Avatar'), field: 'avatar' },
        { label: 'RSS', value: getValue('Rss'), field: 'rss' },
    ];

    return (
        <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-6">
            <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-docs-accent dark:text-dark-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'translateY(7px)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">本站信息</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {siteInfoItems.map((item) => (
                    <div key={item.field} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                            <button
                                onClick={() => copyToClipboard(item.value, item.field)}
                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-docs-accent dark:hover:text-dark-accent transition-colors"
                                title="复制"
                            >
                                {copied && copyingField === item.field ? (
                                    <>
                                        <Check size={12} className="text-green-500" />
                                        <span className="text-green-500">已复制</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={12} />
                                        <span>复制</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                readOnly
                                value={item.value}
                                className="w-full px-3 py-2 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-docs-accent dark:focus:ring-dark-accent focus:border-transparent"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SiteInfo;
