import React from "react";

export default function SyncBanner({ isSyncing, onRetry }) {
  if (!isSyncing) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 
                    bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100
                    px-4 py-2 rounded-lg shadow-md flex items-center gap-3 z-50">
      <span className="font-medium">⚠️ Server sedang offline.</span>
      <button
        onClick={onRetry}
        className="px-3 py-1 bg-yellow-300 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100
                   rounded-md text-sm hover:bg-yellow-400 dark:hover:bg-yellow-700 transition-colors"
      >
        Coba Sinkron Ulang
      </button>
    </div>
  );
}
