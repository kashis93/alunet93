import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Cpu, Award, Timer, Target } from 'lucide-react';

const FilterSection = ({ title, children, icon: Icon, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-slate-100 py-4 last:border-0 group/section">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-xs font-black text-slate-800 uppercase tracking-wider hover:text-blue-600 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-3.5 w-3.5 text-slate-400 group-hover/section:text-blue-500 transition-colors" />}
                    {title}
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {isOpen && <div className="space-y-2 mt-4 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
        </div>
    );
};

const ChallengeFilters = ({ filters, onFilterChange }) => {
    const handleToggle = (key, value) => {
        const current = filters[key] || [];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        onFilterChange(key, updated);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                FILTERS
            </h2>

            <FilterSection title="Domains" icon={Cpu}>
                {[
                    { id: 'Technology', label: 'Technology' },
                    { id: 'Design', label: 'Design' },
                    { id: 'Management', label: 'Management' },
                    { id: 'Marketing', label: 'Marketing' },
                    { id: 'Data Science', label: 'Data Science' }
                ].map(dom => (
                    <label key={dom.id} className="flex items-center gap-3 cursor-pointer group px-1 py-1 rounded-lg hover:bg-slate-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={(filters.domains || []).includes(dom.id)}
                            onChange={() => handleToggle('domains', dom.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors font-bold uppercase">{dom.label}</span>
                    </label>
                ))}
            </FilterSection>

            <FilterSection title="Rewards" icon={Award}>
                {[
                    { id: 'cash', label: 'Cash Prize' },
                    { id: 'internship', label: 'Internship Opportunity' },
                    { id: 'mentorship', label: '1-on-1 Mentorship' },
                    { id: 'certificate', label: 'Certificate' }
                ].map(rew => (
                    <label key={rew.id} className="flex items-center gap-3 cursor-pointer group px-1 py-1 rounded-lg hover:bg-slate-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={(filters.rewards || []).includes(rew.id)}
                            onChange={() => handleToggle('rewards', rew.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors font-bold uppercase">{rew.label}</span>
                    </label>
                ))}
            </FilterSection>

            <FilterSection title="Difficulty" icon={Target}>
                {[
                    { id: 'beginner', label: 'Beginner' },
                    { id: 'intermediate', label: 'Intermediate' },
                    { id: 'advanced', label: 'Advanced / Expert' }
                ].map(diff => (
                    <label key={diff.id} className="flex items-center gap-3 cursor-pointer group px-1 py-1 rounded-lg hover:bg-slate-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={(filters.difficulty || []).includes(diff.id)}
                            onChange={() => handleToggle('difficulty', diff.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors font-bold uppercase">{diff.label}</span>
                    </label>
                ))}
            </FilterSection>

            <FilterSection title="Duration" icon={Timer}>
                {[
                    { id: '24h', label: '24h Hackathon' },
                    { id: '1week', label: '1 Week Challenge' },
                    { id: '1month', label: 'Monthly Contest' },
                    { id: 'flexible', label: 'Flexible / Ongoing' }
                ].map(dur => (
                    <label key={dur.id} className="flex items-center gap-3 cursor-pointer group px-1 py-1 rounded-lg hover:bg-slate-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={(filters.duration || []).includes(dur.id)}
                            onChange={() => handleToggle('duration', dur.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors font-bold uppercase">{dur.label}</span>
                    </label>
                ))}
            </FilterSection>
        </div>
    );
};

export default ChallengeFilters;
