import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import type { FriendLink } from '../friends';
import FriendCard from './FriendCard';

interface FriendsListProps {
    links: FriendLink[];
}

const FriendsList: React.FC<FriendsListProps> = ({ links }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const friendsPerPage = 10;
    // Scroll to top distance (pixels from top of page)
    const scrollToTopDistance = 925;
    
    // Force TOC to update when component mounts
    useEffect(() => {
        // Trigger scroll event to force TOC update
        window.dispatchEvent(new Event('scroll'));
    }, []);

    // Filter out disconnected friends
    const activeFriends = links.filter(link => !link.disconnected);

    // Calculate total pages
    const totalPages = Math.ceil(activeFriends.length / friendsPerPage);

    // Get current friends
    const indexOfLastFriend = currentPage * friendsPerPage;
    const indexOfFirstFriend = indexOfLastFriend - friendsPerPage;
    const currentFriends = activeFriends.slice(indexOfFirstFriend, indexOfLastFriend);

    // Page change with scroll to top with configurable distance
    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        // Scroll to configured distance from top
        window.scrollTo({
            top: scrollToTopDistance,
            behavior: 'smooth'
        });
    };

    // Get page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            pageNumbers.push(1);
            if (startPage > 2) {
                pageNumbers.push('...');
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push('...');
            }
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    return (
        <div className="mb-24" style={{ minHeight: '300px' }}>
            <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-docs-accent dark:text-dark-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'translateY(7px)' }}>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <h2 id="connected-friends" className="text-xl font-bold text-slate-900 dark:text-white">活跃友链</h2>
            </div>

            {activeFriends.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400">暂无活跃友链</p>
                </div>
            ) : (
                <>
                    {/* Friends Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {currentFriends.map((link, index) => (
                            <FriendCard 
                                key={`${link.name}-${index}`} 
                                link={link} 
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                上一页
                            </button>

                            <div className="flex items-center gap-1">
                                {getPageNumbers().map((number, index) => (
                                    <button
                                        key={index}
                                        onClick={() => typeof number === 'number' && paginate(number)}
                                        disabled={typeof number !== 'number'}
                                        className={`px-3 py-1 rounded-lg transition-colors ${typeof number === 'number' ? (
                                            currentPage === number
                                                ? 'bg-primary text-white dark:bg-primary dark:text-white'
                                                : 'border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                                        ) : 'text-slate-500 dark:text-slate-400 cursor-default'}`}
                                    >
                                        {number}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                下一页
                            </button>
                        </div>
                    )}

                    {/* Page Info */}
                    <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                        显示第 {indexOfFirstFriend + 1} 至 {Math.min(indexOfLastFriend, activeFriends.length)} 项，共 {activeFriends.length} 项
                    </div>
                </>
            )}
        </div>
    );
};

export default FriendsList;
