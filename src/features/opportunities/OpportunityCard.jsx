import React, { useState } from 'react';
import SkillTag from './SkillTag';
import AlumniBadge from './AlumniBadge';

const OpportunityCard = ({ opportunity, onApply, onSave, onViewDetails }) => {
  const [isSaved, setIsSaved] = useState(opportunity.saved);

  const handleSave = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    if (onSave) onSave(opportunity.id, !isSaved);
  };

  const handleApply = (e) => {
    e.stopPropagation();
    if (onApply) onApply(opportunity.id);
  };

  const handleAction = (e) => {
    e.stopPropagation();
    // always mark as applied if handler provided
    if (onApply) onApply(opportunity.id);

    if (opportunity.applicationLink) {
      if (opportunity.applicationLink.startsWith('http')) {
        window.open(opportunity.applicationLink, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = `mailto:${opportunity.applicationLink}`;
      }
    }
  };

  const getBadgeColor = () => {
    if (opportunity.badge === 'Urgent') return 'bg-red-50 border-red-200 text-red-700';
    if (opportunity.badge === 'Recommended') return 'bg-green-50 border-green-200 text-green-700';
    return 'bg-blue-50 border-blue-200 text-blue-700';
  };

  const getTypeColor = () => {
    const types = {
      Job: 'bg-blue-100 text-blue-800',
      Internship: 'bg-purple-100 text-purple-800',
      Freelance: 'bg-amber-100 text-amber-800',
      Project: 'bg-cyan-100 text-cyan-800'
    };
    return types[opportunity.type] || types.Job;
  };

  const daysUntilDeadline = Math.ceil(
    (new Date(opportunity.deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      onClick={() => onViewDetails && onViewDetails(opportunity.id)}
      className="group h-full bg-white rounded-2xl border border-gray-200 hover:border-teal-300 hover:shadow-xl transition-all duration-300 ease-out cursor-pointer overflow-hidden p-5 flex flex-col"
    >
      {/* Header Section */}
      <div className="flex items-start gap-3 mb-4">
        <img
          src={opportunity.logo}
          alt={opportunity.company}
          className="w-12 h-12 rounded-lg object-cover bg-gray-100"
        />
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-teal-600 transition-colors">
            {opportunity.title}
          </h3>
          <p className="text-sm text-gray-600">{opportunity.company}</p>
        </div>
        <button
          onClick={handleSave}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isSaved
              ? 'bg-red-50 text-red-500'
              : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Badge and Type */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getTypeColor()}`}>
          {opportunity.type}
        </span>
        {opportunity.badge && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getBadgeColor()}`}>
            {opportunity.badge === 'Urgent' ? '🔥 ' : opportunity.badge === 'Recommended' ? '⭐ ' : '🎓 '}
            {opportunity.badge}
          </span>
        )}
      </div>

      {/* Details Section */}
      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span>{opportunity.location}</span>
          <span className="text-gray-400">•</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">{opportunity.workMode}</span>
        </div>
        {opportunity.duration && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{opportunity.duration}</span>
          </div>
        )}
      </div>

      {/* Salary/Stipend */}
      <div className="mb-4 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-100">
        <p className="text-xs text-gray-600 mb-1">
          {opportunity.type === 'Internship' ? 'Stipend' : 'Salary'}
        </p>
        <p className="font-bold text-teal-700">
          {opportunity.salary || opportunity.stipend}
        </p>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">Required Skills</p>
        <div className="flex flex-wrap gap-2">
          {opportunity.skills.map((skill, idx) => (
            <SkillTag key={idx} skill={skill} />
          ))}
        </div>
      </div>

      {/* Alumni Info */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">Posted by</p>
        <AlumniBadge
          name={opportunity.postedBy}
          batch={opportunity.batch}
          verified={opportunity.verified}
        />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-t border-gray-100">
        <span>Posted {opportunity.postedDate}</span>
        <span>{opportunity.applicants} applicants</span>
        {daysUntilDeadline <= 7 && (
          <span className="text-red-600 font-semibold">Closes in {daysUntilDeadline}d</span>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={handleAction}
        className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
          opportunity.applied
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 shadow-md hover:shadow-lg'
        }`}
      >
        {opportunity.applicationLink
          ? opportunity.applicationLink.startsWith('http')
            ? 'Apply via Link'
            : 'Contact via Email'
          : opportunity.applied
          ? '✓ Applied'
          : 'Apply Now'}
      </button>
    </div>
  );
};

export default OpportunityCard;
