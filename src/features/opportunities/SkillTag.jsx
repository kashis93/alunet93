import React from 'react';

const SkillTag = ({ skill, className = '' }) => {
  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 border border-teal-100 ${className}`}
    >
      {skill}
    </span>
  );
};

export default SkillTag;
