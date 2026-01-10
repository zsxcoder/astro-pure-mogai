import React, { useState, useRef, useEffect } from 'react';
import type { FriendLink } from '../friends';
import { DISCONNECTED_LEVEL } from '../consts/friendLevels';
import { AlertCircle } from 'lucide-react';

interface DisconnectedFriendCardProps {
    link: FriendLink;
}

const DisconnectedFriendCard: React.FC<DisconnectedFriendCardProps> = ({ link }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    // 获取安全链接
    const getSafeLink = (url: string): string => {
        const exclude = ['blog.ljx.icu', 'localhost', '127.0.0.1', 'b.zsxcoder.top', 'mcy.zsxcoder.top']

        if (!url || (!url.startsWith('http') && !url.startsWith('//'))) return url

        try {
            const urlObj = new URL(url)
            if (
                exclude.some(
                    (domain) => urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
                )
            ) {
                return url
            }
            return `/safego?url=${encodeURIComponent(url)}`
        } catch {
            return url
        }
    }

    useEffect(() => {
        if (!imgRef.current || shouldLoad) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '100px' }
        );

        observer.observe(imgRef.current);
        return () => observer.disconnect();
    }, [shouldLoad]);

    return (
        <a
            href={getSafeLink(link.url)}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative flex flex-col gap-3 p-5 rounded-xl border transition-all duration-300 
                bg-white dark:bg-white/5 
                hover:-translate-y-1 hover:shadow-lg
                ${DISCONNECTED_LEVEL.border.replace('border-', 'border-opacity-50 hover:border-opacity-100 ')}
                overflow-hidden min-h-[140px] h-auto opacity-70 group-hover:opacity-100 no-underline
            `}
        >
            {/* Background Decoration Pattern */}
            <div className={`absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none ${DISCONNECTED_LEVEL.theme}`}>
                <DISCONNECTED_LEVEL.Icon size={120} />
            </div>

            {/* Main Content Container */}
            <div className="flex items-start gap-4 w-full">
                {/* Avatar Section */}
                <div ref={imgRef} className="relative w-16 h-16 flex-shrink-0">
                    <div className={`absolute inset-0 rounded-full border-2 ${DISCONNECTED_LEVEL.border} opacity-20 scale-110`} />

                    {!imageLoaded && !imageError && (
                        <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    )}

                    {(!imageError && shouldLoad) ? (
                        <img
                            src={link.avatar}
                            alt={link.name}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => {
                                setImageError(true);
                                setImageLoaded(true);
                            }}
                            className={`w-16 h-16 rounded-full object-cover relative z-10 transition-transform duration-500 group-hover:rotate-12 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        />
                    ) : imageError && (
                        <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-500 text-lg z-10 relative">
                            {link.name.charAt(0)}
                        </div>
                    )}

                    {/* Disconnected Badge */}
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-20">
                        <AlertCircle size={10} />
                        失联
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-grow min-w-0 z-10 flex flex-col pr-12 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate line-through no-underline text-base">
                            {link.name}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 line-through no-underline">
                        {link.description}
                    </p>
                </div>
            </div>

            {/* Disconnected Stamp */}
            <div className="absolute bottom-[-5px] right-[-5px] opacity-25 group-hover:opacity-40 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-12deg] pointer-events-none">
                <div className={`relative w-24 h-24 flex items-center justify-center ${DISCONNECTED_LEVEL.color}`}>
                    <div className="absolute top-3 font-black tracking-widest uppercase text-[10px] opacity-100 font-serif">
                        {DISCONNECTED_LEVEL.title}
                    </div>
                    <DISCONNECTED_LEVEL.Icon size={40} strokeWidth={1.5} className="currentColor opacity-60" />
                    <div className="absolute bottom-3 font-mono text-[9px] opacity-100 font-bold">
                        DISCONNECTED
                    </div>
                </div>
            </div>
        </a>
    );
};

export default DisconnectedFriendCard;
