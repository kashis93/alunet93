import React, { useState } from 'react';
import FilterGroup from './FilterGroup';
import { filterOptions } from '@/data/opportunitiesData';

const FilterSidebar = ({ isOpen, onClose, filters, onFilterChange, inline = false }) => {
  const getDepartmentItems = () =>
    filterOptions.department.map(dept => ({
      ...dept,
      count: dept.count
    }));

  const getWorkModeItems = () =>
    filterOptions.workMode.map(mode => ({
      ...mode,
      count: mode.count
    }));

  const getExperienceItems = () =>
    filterOptions.experienceLevel.map(exp => ({
      ...exp,
      count: exp.count
    }));

  const getCompanyTypeItems = () =>
    filterOptions.companyType.map(type => ({
      ...type,
      count: type.count
    }));

  const getOpportunityTypeItems = () =>
    filterOptions.opportunityType.map(type => ({
      ...type,
      count: type.count
    }));

  const handleTechDomainToggle = (domainId) => {
    const current = filters.domains || [];
    const updated = current.includes(domainId)
      ? current.filter(d => d !== domainId)
      : [...current, domainId];
    onFilterChange('domains', updated);
  };

  const handleApplyFilters = () => {
    onClose?.();
  };

  const handleClearAll = () => {
    onFilterChange('opportunityTypes', []);
    onFilterChange('departments', []);
    onFilterChange('workModes', []);
    onFilterChange('experienceLevels', []);
    onFilterChange('salaryRange', [0, 1000000]);
    onFilterChange('companyTypes', []);
    onFilterChange('domains', []);
  };

  // render filter groups into a fragment
  const content = (
    <>
      <FilterGroup
        title="Opportunity Type"
        items={getOpportunityTypeItems()}
        selectedItems={filters.opportunityTypes || []}
        onItemToggle={(item) => {
          const current = filters.opportunityTypes || [];
          const updated = current.includes(item)
            ? current.filter(t => t !== item)
            : [...current, item];
          onFilterChange('opportunityTypes', updated);
        }}
      />

      {/* Tech Domains */}
      <div className="border-b border-gray-200 pb-4">
        <h4 className="font-semibold text-gray-900 mb-3">Technology Domains</h4>
        <div className="space-y-2">
          {filterOptions.domain.tech.map((domain) => (
            <label key={domain.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
              <input
                type="checkbox"
                checked={(filters.domains || []).includes(domain.id)}
                onChange={() => handleTechDomainToggle(domain.id)}
                className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
              />
              <span className="flex-1 text-sm text-gray-700">{domain.label}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {domain.count}
              </span>
            </label>
          ))}
        </div>
      </div>

      <FilterGroup
        title="Department"
        items={getDepartmentItems()}
        selectedItems={filters.departments || []}
        onItemToggle={(item) => {
          const current = filters.departments || [];
          const updated = current.includes(item)
            ? current.filter(d => d !== item)
            : [...current, item];
          onFilterChange('departments', updated);
        }}
      />

      <FilterGroup
        title="Work Mode"
        items={getWorkModeItems()}
        selectedItems={filters.workModes || []}
        onItemToggle={(item) => {
          const current = filters.workModes || [];
          const updated = current.includes(item)
            ? current.filter(w => w !== item)
            : [...current, item];
          onFilterChange('workModes', updated);
        }}
      />

      <FilterGroup
        title="Experience Level"
        items={getExperienceItems()}
        selectedItems={filters.experienceLevels || []}
        onItemToggle={(item) => {
          const current = filters.experienceLevels || [];
          const updated = current.includes(item)
            ? current.filter(e => e !== item)
            : [...current, item];
          onFilterChange('experienceLevels', updated);
        }}
      />

      <FilterGroup
        title="Salary Range (₹)"
        isRange={true}
        min={filters.salaryRange?.[0] || 0}
        max={filters.salaryRange?.[1] || 1000000}
        onRangeChange={(min, max) => onFilterChange('salaryRange', [min, max])}
      />

      <FilterGroup
        title="Company Type"
        items={getCompanyTypeItems()}
        selectedItems={filters.companyTypes || []}
        onItemToggle={(item) => {
          const current = filters.companyTypes || [];
          const updated = current.includes(item)
            ? current.filter(c => c !== item)
            : [...current, item];
          onFilterChange('companyTypes', updated);
        }}
      />
    </>
  );

  if (inline) {
    return (
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        {content}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-teal-500 text-white rounded"
          >
            Apply
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 border rounded"
          >
            Clear
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-auto bg-white z-40 transform transition-transform md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-80 md:w-64 border-r border-gray-200 overflow-y-auto flex flex-col`}
      >
        {/* Header (Mobile only) */}
        <div className="sticky top-0 md:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h3 className="font-bold text-gray-900">Filters</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters Content */}
        <div className="flex-1 p-4 space-y-4">
          <FilterGroup
            title="Opportunity Type"
            items={getOpportunityTypeItems()}
            selectedItems={filters.opportunityTypes || []}
            onItemToggle={(item) => {
              const current = filters.opportunityTypes || [];
              const updated = current.includes(item)
                ? current.filter(t => t !== item)
                : [...current, item];
              onFilterChange('opportunityTypes', updated);
            }}
          />

          {/* Tech Domains */}
          <div className="border-b border-gray-200 pb-4">
            <h4 className="font-semibold text-gray-900 mb-3">Technology Domains</h4>
            <div className="space-y-2">
              {filterOptions.domain.tech.map((domain) => (
                <label key={domain.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={(filters.domains || []).includes(domain.id)}
                    onChange={() => handleTechDomainToggle(domain.id)}
                    className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
                  />
                  <span className="flex-1 text-sm text-gray-700">{domain.label}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {domain.count}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <FilterGroup
            title="Department"
            items={getDepartmentItems()}
            selectedItems={filters.departments || []}
            onItemToggle={(item) => {
              const current = filters.departments || [];
              const updated = current.includes(item)
                ? current.filter(d => d !== item)
                : [...current, item];
              onFilterChange('departments', updated);
            }}
          />

          <FilterGroup
            title="Work Mode"
            items={getWorkModeItems()}
            selectedItems={filters.workModes || []}
            onItemToggle={(item) => {
              const current = filters.workModes || [];
              const updated = current.includes(item)
                ? current.filter(w => w !== item)
                : [...current, item];
              onFilterChange('workModes', updated);
            }}
          />

          <FilterGroup
            title="Experience Level"
            items={getExperienceItems()}
            selectedItems={filters.experienceLevels || []}
            onItemToggle={(item) => {
              const current = filters.experienceLevels || [];
              const updated = current.includes(item)
                ? current.filter(e => e !== item)
                : [...current, item];
              onFilterChange('experienceLevels', updated);
            }}
          />

          <FilterGroup
            title="Salary Range (₹)"
            isRange={true}
            min={filters.salaryRange?.[0] || 0}
            max={filters.salaryRange?.[1] || 1000000}
            onRangeChange={(min, max) => onFilterChange('salaryRange', [min, max])}
          />

          <FilterGroup
            title="Company Type"
            items={getCompanyTypeItems()}
            selectedItems={filters.companyTypes || []}
            onItemToggle={(item) => {
              const current = filters.companyTypes || [];
              const updated = current.includes(item)
                ? current.filter(c => c !== item)
                : [...current, item];
              onFilterChange('companyTypes', updated);
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4 space-y-2">
          <button
            onClick={handleApplyFilters}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearAll}
            className="w-full py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-all"
          >
            Clear All
          </button>
        </div>
      </aside>
    </>
  );
};

export default FilterSidebar;
