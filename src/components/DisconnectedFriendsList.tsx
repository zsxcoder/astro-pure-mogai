import React, { useState, useEffect } from 'react';
import type { FriendLink } from '../friends';
import DisconnectedFriendCard from './DisconnectedFriendCard';

interface DisconnectedFriendsListProps {
    links: FriendLink[];
}

const DisconnectedFriendsList: React.FC<DisconnectedFriendsListProps> = ({ links }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Force TOC to update when component mounts
    useEffect(() => {
        // Trigger scroll event to force TOC update
        window.dispatchEvent(new Event('scroll'));
    }, []);

    // Filter disconnected friends
    const disconnectedFriends = links.filter(link => link.disconnected);

    if (disconnectedFriends.length === 0) {
        return null;
    }

    return (
        <div className="mb-24">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full p-4 mb-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-300"
            >
                <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'translateY(9.5px)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <h2 id="disconnected-links" className="text-xl font-bold text-slate-900 dark:text-white">失联友链</h2>
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 flex-shrink-0" style={{ transform: 'translateY(10px)' }}>
                        {disconnectedFriends.length}
                    </span>
                </div>
                <svg className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>

            {isExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    {disconnectedFriends.map((link, index) => (
                        <DisconnectedFriendCard key={`${link.name}-${index}`} link={link} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DisconnectedFriendsList;
