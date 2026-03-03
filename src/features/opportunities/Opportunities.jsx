import React, { useState, useMemo } from 'react';
import { opportunitiesData } from '@/data/opportunitiesData';
import FilterSidebar from './FilterSidebar';
import SearchBar from './SearchBar';
import SortDropdown from './SortDropdown';
import ViewToggle from './ViewToggle';
import OpportunityCard from './OpportunityCard';
import RecommendationSection from './RecommendationSection';

// initial form template for posting
const emptyForm = {
  title: '',
  company: '',
  type: 'Job',
  location: '',
  workMode: 'Remote',
  salary: '',
  deadline: '',
  skills: '',
  applicationLink: ''
};

const Opportunities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [view, setView] = useState('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [addedOpportunities, setAddedOpportunities] = useState([]);
  const [appliedOpportunities, setAppliedOpportunities] = useState({});
  const [savedOpportunities, setSavedOpportunities] = useState({});

  const [filters, setFilters] = useState({
    opportunityTypes: [],
    departments: [],
    workModes: [],
    experienceLevels: [],
    salaryRange: [0, 1000000],
    companyTypes: [],
    domains: []
  });

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Filter and search logic (includes added posts)
  const filteredAndSearchedData = useMemo(() => {
    const allData = [...addedOpportunities, ...opportunitiesData];
    return allData.filter(opp => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        opp.title.toLowerCase().includes(searchLower) ||
        opp.company.toLowerCase().includes(searchLower) ||
        opp.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
        opp.postedBy.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Opportunity type filter
      if (filters.opportunityTypes.length > 0) {
        const typeMap = {
          'job': 'Job',
          'internship': 'Internship',
          'freelance': 'Freelance',
          'project': 'Project',
          'startup': 'Startup Role'
        };
        if (!filters.opportunityTypes.some(type => typeMap[type] === opp.type)) {
          return false;
        }
      }

      // Department filter
      if (filters.departments.length > 0 && !filters.departments.includes(opp.department.toLowerCase())) {
        return false;
      }

      // Work mode filter
      if (filters.workModes.length > 0) {
        const workModeMap = {
          'remote': 'Remote',
          'hybrid': 'Hybrid',
          'onsite': 'On-site'
        };
        if (!filters.workModes.some(mode => workModeMap[mode] === opp.workMode)) {
          return false;
        }
      }

      // Salary range filter
      const salary = opp.salary || opp.stipend || '₹0';
      const salaryNumber = parseInt(salary.replace(/[₹,\s]/g, '').split('-')[0]) || 0;
      if (salaryNumber < filters.salaryRange[0] || salaryNumber > filters.salaryRange[1]) {
        return false;
      }

      return true;
    });
  }, [searchTerm, filters]);

  // Sort logic
  const sortedData = useMemo(() => {
    const sorted = [...filteredAndSearchedData];

    switch (sortBy) {
      case 'deadline':
        sorted.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        break;
      case 'applied':
        sorted.sort((a, b) => b.applicants - a.applicants);
        break;
      case 'recommended':
        sorted.sort((a, b) => {
          if (a.badge === 'Recommended' && b.badge !== 'Recommended') return -1;
          if (a.badge !== 'Recommended' && b.badge === 'Recommended') return 1;
          return 0;
        });
        break;
      case 'latest':
      default:
        sorted.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    }

    return sorted;
  }, [filteredAndSearchedData, sortBy]);

  const handleApply = (opportunityId) => {
    setAppliedOpportunities(prev => ({
      ...prev,
      [opportunityId]: !prev[opportunityId]
    }));
  };

  const handleSave = (opportunityId, isSaved) => {
    setSavedOpportunities(prev => ({
      ...prev,
      [opportunityId]: isSaved
    }));
  };

  const handleViewDetails = (opportunityId) => {
    console.log('View details for opportunity:', opportunityId);
  };

  // Post opportunity handlers
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    // construct new opportunity
    const newOpp = {
      id: Date.now().toString(),
      title: formData.title,
      company: formData.company,
      type: formData.type,
      location: formData.location,
      workMode: formData.workMode,
      salary: formData.salary,
      deadline: formData.deadline,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      postedBy: 'You',
      applicants: 0,
      applicationLink: formData.applicationLink,
      postedDate: new Date().toISOString().split('T')[0],
      badge: ''
    };
    setAddedOpportunities(prev => [newOpp, ...prev]);
    setFormData(emptyForm);
    setShowPostForm(false);
  };

  // Get opportunities with applied status
  const opportunitiesWithStatus = sortedData.map(opp => ({
    ...opp,
    applied: appliedOpportunities[opp.id] || false,
    saved: savedOpportunities[opp.id] || false
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Post Opportunity Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-30">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Post Opportunity</h2>
            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  required
                  placeholder="Company"
                  value={formData.company}
                  onChange={(e) => handleFormChange('company', e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
                <div className="flex gap-2">
                  <select
                    value={formData.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    className="flex-1 border px-3 py-2 rounded"
                  >
                    <option>Job</option>
                    <option>Internship</option>
                    <option>Freelance</option>
                    <option>Project</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Location"
                    value={formData.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                    className="flex-1 border px-3 py-2 rounded"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={formData.workMode}
                    onChange={(e) => handleFormChange('workMode', e.target.value)}
                    className="flex-1 border px-3 py-2 rounded"
                  >
                    <option>Remote</option>
                    <option>On-site</option>
                    <option>Hybrid</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Salary/Stipend"
                    value={formData.salary}
                    onChange={(e) => handleFormChange('salary', e.target.value)}
                    className="flex-1 border px-3 py-2 rounded"
                  />
                </div>
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={(e) => handleFormChange('deadline', e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Skills (comma separated)"
                  value={formData.skills}
                  onChange={(e) => handleFormChange('skills', e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
                <input
                  type="url"
                  placeholder="Application Link"
                  value={formData.applicationLink}
                  onChange={(e) => handleFormChange('applicationLink', e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowPostForm(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Title and Count */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Opportunities</h1>
              <p className="text-gray-600 mt-1">Jobs and internships shared by alumni</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-teal-600">{opportunitiesWithStatus.length}</p>
              <p className="text-sm text-gray-600">Opportunities Found</p>
              <button
                onClick={() => setShowPostForm(true)}
                className="mt-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all text-sm">
                + Post Opportunity
              </button>
            </div>
          </div>

          {/* Search bar row */}
          <div className="mb-4">
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-3">
            <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
            <ViewToggle view={view} onViewChange={setView} />
            <button
              onClick={() => setIsFilterOpen(prev => !prev)}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm font-medium text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707l-6.414-6.414A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
          </div>

          {/* Inline filters section */}
          {isFilterOpen && (
            <div className="mt-4">
              <FilterSidebar
                inline={true}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Feed */}
        <main className="flex-1 min-w-0">
          {/* Recommendation Section */}
          {opportunitiesWithStatus.length > 0 && (
            <RecommendationSection
              opportunities={opportunitiesWithStatus}
              onApply={handleApply}
              onViewDetails={handleViewDetails}
            />
          )}

          {/* Opportunities Feed */}
          {opportunitiesWithStatus.length > 0 ? (
            <div
              className={`grid gap-6 ${
                view === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {opportunitiesWithStatus.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onApply={handleApply}
                  onSave={handleSave}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-32 h-32 mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No opportunities found</h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                Try adjusting your filters or search terms to find opportunities that match your interests.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({
                      opportunityTypes: [],
                      departments: [],
                      workModes: [],
                      experienceLevels: [],
                      salaryRange: [0, 1000000],
                      companyTypes: [],
                      domains: []
                    });
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Opportunities;
