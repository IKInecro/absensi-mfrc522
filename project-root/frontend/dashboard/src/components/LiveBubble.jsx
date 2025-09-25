import React from "react";

export default function LiveBubble({ student, time }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-800 
                    text-green-800 dark:text-green-100 rounded-full shadow-sm">
      <span className="font-semibold">{student}</span>
      <span className="text-xs text-gray-600 dark:text-gray-300">{time}</span>
    </div>
  );
}
