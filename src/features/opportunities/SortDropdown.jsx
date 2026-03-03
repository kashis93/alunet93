import React, { useState } from 'react';

const SortDropdown = ({ sortBy, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { id: 'latest', label: 'Latest' },
    { id: 'deadline', label: 'Deadline Soon' },
    { id: 'applied', label: 'Most Applied' },
    { id: 'recommended', label: 'Recommended' }
  ];

  const selectedLabel = sortOptions.find(opt => opt.id === sortBy)?.label || 'Latest';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm font-medium text-gray-700"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707l-6.414-6.414A1 1 0 013 6.586V4z" />
        </svg>
        {selectedLabel}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                onSortChange(option.id);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                sortBy === option.id
                  ? 'bg-teal-50 text-teal-700 font-medium'
                  : 'text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
