import React, { useEffect } from 'react';
import { FRIEND_LEVELS, DISCONNECTED_LEVEL } from '../consts/friendLevels';

interface FriendLevelLegendProps {
    // No props needed for now
}

const FriendLevelLegend: React.FC<FriendLevelLegendProps> = () => {
    // Force TOC to update when component mounts
    useEffect(() => {
        // Trigger scroll event to force TOC update
        window.dispatchEvent(new Event('scroll'));
    }, []);

    // 计算天数范围
    const getDayRange = (level: typeof FRIEND_LEVELS[0], index: number) => {
        const prevDays = index === 0 ? 0 : FRIEND_LEVELS[index - 1].days;
        const currentDays = level.days;
        return `${prevDays}-${currentDays} 天`;
    };

    return (
        <div className="mb-24">
            <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-docs-accent dark:text-dark-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'translateY(7px)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                <h2 id="friend-levels" className="text-xl font-bold text-slate-900 dark:text-white">友链等级</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 text-center">
                {/* Disconnected Level */}
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full ${DISCONNECTED_LEVEL.color}`}>
                        <DISCONNECTED_LEVEL.Icon size={16} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{DISCONNECTED_LEVEL.title}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 cursor-default">失联</span>
                    </div>
                </div>

                {/* Regular Levels */}
                {FRIEND_LEVELS.map((level, index) => (
                    <div key={level.level} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${level.color}`}>
                            <level.Icon size={16} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{level.title}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 cursor-default">
                                {getDayRange(level, index)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-sm text-slate-600 dark:text-slate-400 text-center">
                <p>根据友链添加天数自动升级，等级越高，边框颜色越独特</p>
            </div>
        </div>
    );
};

export default FriendLevelLegend;
