import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            setHasError(true);
            setError(event.error);
            console.error('Error caught by ErrorBoundary:', event.error);
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    if (hasError) {
        return (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
                <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">组件加载失败</h2>
                <p className="text-red-500 dark:text-red-300 mb-4">很抱歉，该组件在加载过程中遇到了问题。</p>
                <details className="text-sm text-red-400 dark:text-red-200">
                    <summary className="cursor-pointer">查看错误详情</summary>
                    <pre className="mt-2 p-3 bg-red-900/30 dark:bg-red-800/50 rounded text-left overflow-x-auto">
                        {error && error.toString()}
                    </pre>
                </details>
            </div>
        );
    }

    return children;
};

export default ErrorBoundary;
