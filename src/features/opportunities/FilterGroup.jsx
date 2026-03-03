import React, { useState } from 'react';

const FilterGroup = ({ title, items, selectedItems, onItemToggle, isRange = false, min, max, onRangeChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (isRange) {
    return (
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between py-2 font-semibold text-gray-900 hover:text-teal-600 transition-colors"
        >
          {title}
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={min}
                onChange={(e) => onRangeChange(parseInt(e.target.value) || 0, max)}
                placeholder="Min"
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              />
              <input
                type="number"
                min="0"
                value={max}
                onChange={(e) => onRangeChange(min, parseInt(e.target.value) || 100000)}
                placeholder="Max"
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              />
            </div>
            <input
              type="range"
              min="0"
              max="1000000"
              step="10000"
              value={max}
              onChange={(e) => onRangeChange(min, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-gray-600">
              ₹{(min / 100000).toFixed(1)}L - ₹{(max / 100000).toFixed(1)}L
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2 font-semibold text-gray-900 hover:text-teal-600 transition-colors"
      >
        {title}
        <svg
          className={`w-5 h-5 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <label key={item.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => onItemToggle(item.id)}
                className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
              />
              <span className="flex-1 text-sm text-gray-700">{item.label}</span>
              {item.count !== undefined && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {item.count}
                </span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterGroup;
