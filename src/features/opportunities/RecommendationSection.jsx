import React from 'react';
import SkillTag from './SkillTag';

const RecommendationSection = ({ opportunities, onApply, onViewDetails }) => {
  const recommendedOpps = opportunities
    .filter(opp => opp.badge === 'Recommended')
    .slice(0, 2);

  if (recommendedOpps.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <h3 className="text-lg font-bold text-gray-900">Recommended For You</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendedOpps.map((opp) => (
          <div
            key={opp.id}
            onClick={() => onViewDetails && onViewDetails(opp.id)}
            className="group bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start gap-3 mb-3">
              <img
                src={opp.logo}
                alt={opp.company}
                className="w-10 h-10 rounded-lg object-cover bg-white"
              />
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                  {opp.title}
                </h4>
                <p className="text-sm text-gray-700">{opp.company}</p>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
                ⭐ Recommended
              </span>
            </div>

            <div className="space-y-2 mb-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{opp.location} • {opp.workMode}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-700">{opp.salary || opp.stipend}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {opp.skills.slice(0, 3).map((skill, idx) => (
                <SkillTag key={idx} skill={skill} />
              ))}
              {opp.skills.length > 3 && (
                <span className="text-xs text-gray-600 px-2 py-1">+{opp.skills.length - 3}</span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onApply) onApply(opp.id);
              }}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-all text-sm"
            >
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationSection;
