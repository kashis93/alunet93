import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Rocket, Layout, Users, MapPin, Target } from 'lucide-react';

const FilterSection = ({ title, children, icon: Icon, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-purple-50 py-4 last:border-0 group/section">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-xs font-black text-slate-800 uppercase tracking-wider hover:text-purple-600 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-3.5 w-3.5 text-slate-400 group-hover/section:text-purple-500 transition-colors" />}
                    {title}
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {isOpen && <div className="space-y-2 mt-4 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
        </div>
    );
};

const StartupFilters = ({ filters, onFilterChange }) => {
    const handleToggle = (key, value) => {
        const current = filters[key] || [];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        onFilterChange(key, updated);
    };

    return (
        <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                <Rocket className="h-4 w-4 text-purple-600" />
                VENTURE FILTERS
            </h2>

            <FilterSection title="Stage" icon={Target}>
                {[
                    { id: 'Idea Phase', label: 'Idea Phase' },
                    { id: 'Prototype / MVP', label: 'MVP / Prototype' },
                    { id: 'Early Traction', label: 'Early Traction' },
                    { id: 'Scaling', label: 'Scaling' }
                ].map(stage => (
                    <label key={stage.id} className="flex items-center gap-3 cursor-pointer group px-1 py-1 rounded-lg hover:bg-purple-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={(filters.stages || []).includes(stage.id)}
                            onChange={() => handleToggle('stages', stage.id)}
                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <span className="text-xs text-gray-600 group-hover:text-purple-600 transition-colors font-bold uppercase">{stage.label}</span>
                    </label>
                ))}
            </FilterSection>

            <FilterSection title="Sectors" icon={Layout}>
                {[
                    { id: 'SaaS', label: 'SaaS' },
                    { id: 'FinTech', label: 'FinTech' },
                    { id: 'EdTech', label: 'EdTech' },
                    { id: 'HealthTech', label: 'HealthTech' },
                    { id: 'AI/ML', label: 'AI / ML' }
                ].map(sec => (
                    <label key={sec.id} className="flex items-center gap-3 cursor-pointer group px-1 py-1 rounded-lg hover:bg-purple-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={(filters.sectors || []).includes(sec.id)}
                            onChange={() => handleToggle('sectors', sec.id)}
                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <span className="text-xs text-gray-600 group-hover:text-purple-600 transition-colors font-bold uppercase">{sec.label}</span>
                    </label>
                ))}
            </FilterSection>

            <FilterSection title="Needs" icon={Users}>
                {[
                    { id: 'Team', label: 'Co-Founders / Team' },
                    { id: 'Funding', label: 'Seed Funding' },
                    { id: 'Mentorship', label: 'Mentorship' },
                    { id: 'Marketing', label: 'Marketing Help' }
                ].map(need => (
                    <label key={need.id} className="flex items-center gap-3 cursor-pointer group px-1 py-1 rounded-lg hover:bg-purple-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={(filters.needs || []).includes(need.id)}
                            onChange={() => handleToggle('needs', need.id)}
                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <span className="text-xs text-gray-600 group-hover:text-purple-600 transition-colors font-bold uppercase">{need.label}</span>
                    </label>
                ))}
            </FilterSection>
        </div>
    );
};

export default StartupFilters;
