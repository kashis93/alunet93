import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Filter, LayoutGrid, List, SlidersHorizontal, ArrowUpDown, X, Briefcase, Building2, MapPin, DollarSign, Calendar, ChevronRight } from 'lucide-react';
import { opportunitiesData, filterOptions } from '@/data/opportunitiesData';
import { addOpportunity, subscribeToOpportunities } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Button,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  Card,
  CardContent
} from '@/components/ui';
import OpportunityCard from './OpportunityCard';
import FilterSidebar from './FilterSidebar';
import { cn } from '@/utils';

const emptyForm = {
  title: '',
  company: '',
  type: 'Job',
  location: '',
  workMode: 'Remote',
  salary: '',
  salaryRange: 'Entry',
  deadline: '',
  skills: '',
  applicationLink: '',
  description: '',
  department: 'CSE',
  domain: 'software'
};

const Opportunities = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [view, setView] = useState('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [dbOpportunities, setDbOpportunities] = useState([]);

  const [filters, setFilters] = useState({
    opportunityTypes: [],
    departments: [],
    workModes: [],
    experienceLevels: [],
    salaryRange: 'Any',
    companyTypes: [],
    education: [],
    cities: [],
    industries: [],
    roleCategories: []
  });

  useEffect(() => {
    const unsub = subscribeToOpportunities((data) => {
      setDbOpportunities(data);
    });
    return unsub;
  }, []);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const filteredData = useMemo(() => {
    const allData = [...dbOpportunities, ...opportunitiesData];
    return allData.filter(opp => {
      // Filter by Employment Type
      if (filters.opportunityTypes.length > 0) {
        const typeMap = { 'job': 'Job', 'internship': 'Internship', 'freelance': 'Freelance', 'project': 'Project', 'startup': 'Startup Role' };
        if (!filters.opportunityTypes.some(type => typeMap[type] === opp.type)) return false;
      }

      // Filter by Work Mode
      if (filters.workModes.length > 0) {
        if (!filters.workModes.some(mode => mode.toLowerCase() === opp.workMode?.toLowerCase())) return false;
      }

      // Filter by Department
      if (filters.departments.length > 0) {
        if (!filters.departments.some(dept => dept.toUpperCase() === opp.department?.toUpperCase())) return false;
      }

      // Filter by Salary Range
      if (filters.salaryRange !== 'Any' && opp.salary) {
        const cleanSalary = opp.salary.replace(/,/g, '');
        const match = cleanSalary.match(/\d+/);
        let numericSalary = match ? parseInt(match[0]) : 0;
        if (opp.salary.toLowerCase().includes('lpa')) {
          numericSalary = numericSalary * 100000;
        }

        if (filters.salaryRange === 'Entry' && numericSalary > 500000) return false;
        if (filters.salaryRange === 'Mid' && (numericSalary <= 500000 || numericSalary > 1500000)) return false;
        if (filters.salaryRange === 'High' && numericSalary <= 1500000) return false;
      }

      // Filter by City
      if (filters.cities.length > 0 && opp.location) {
        if (!filters.cities.some(city => opp.location.toLowerCase().includes(city.toLowerCase()))) return false;
      }

      // Filter by Industry
      if (filters.industries.length > 0 && opp.industry) {
        if (!filters.industries.some(ind => ind.toLowerCase() === opp.industry.toLowerCase())) return false;
      }

      // Filter by Company Type
      if (filters.companyTypes.length > 0 && opp.companyType) {
        if (!filters.companyTypes.some(ct => ct.toLowerCase() === opp.companyType.toLowerCase())) return false;
      }

      return true;
    });
  }, [dbOpportunities, filters]);

  const sortedData = useMemo(() => {
    let data = [...filteredData];
    if (sortBy === 'deadline') {
      data.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (sortBy === 'latest') {
      data.sort((a, b) => new Date(b.postedDate || 0) - new Date(a.postedDate || 0));
    }
    return data;
  }, [filteredData, sortBy]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = typeof formData.skills === 'string'
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : formData.skills;

      await addOpportunity({
        ...formData,
        skills: skillsArray,
        postedBy: user.displayName || user.name || 'Alumni',
        authorId: user.uid,
        postedDate: 'Just now',
        applicants: 0,
        logo: null
      });
      toast.success('Opportunity posted successfully!');
      setShowPostForm(false);
      setFormData(emptyForm);
    } catch (error) {
      toast.error('Failed to post opportunity');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header Section - Modern Naukri Style */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Opportunities<span className="text-blue-600">.</span>
              </h1>
              <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
              <p className="text-sm text-gray-500 hidden md:block font-medium">
                {sortedData.length} roles found
              </p>
            </div>

            <Button
              onClick={() => setShowPostForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-6 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 w-full md:w-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Post a Role
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Amazon-style Sidebar Filters */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                  Filter Options
                </h3>
                <button
                  onClick={() => setFilters({ opportunityTypes: [], departments: [], workModes: [], experienceLevels: [], salaryRange: 'Any', companyTypes: [], education: [], cities: [] })}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  Reset
                </button>
              </div>
              <FilterSidebar
                isOpen={true}
                filters={filters}
                onFilterChange={handleFilterChange}
                inline={true}
              />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="lg:hidden flex items-center gap-2 text-gray-600"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setView('grid')}
                    className={cn("p-1.5 rounded-md transition-all", view === 'grid' ? "bg-gray-100 text-blue-600 shadow-sm" : "text-gray-400 hover:bg-gray-50")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={cn("p-1.5 rounded-md transition-all", view === 'list' ? "bg-gray-100 text-blue-600 shadow-sm" : "text-gray-400 hover:bg-gray-50")}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort:
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-blue-600 font-bold cursor-pointer"
                  >
                    <option value="latest">Latest first</option>
                    <option value="deadline">Deadline soon</option>
                  </select>
                </div>
              </div>
            </div>

            {sortedData.length > 0 ? (
              <div className={cn("grid gap-6 transition-all", view === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
                {sortedData.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    onViewDetails={(id) => console.log('View', id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No matching opportunities</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  Try adjusting your keywords or filters to see more results from our alumni network.
                </p>
                <Button
                  onClick={() => setSearchTerm('')}
                  variant="outline"
                  className="rounded-full px-8"
                >
                  Clear search
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
      {/* Post Opportunity Modal - Professional Form */}
      <Dialog open={showPostForm} onOpenChange={setShowPostForm}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-3xl max-h-[90vh] flex flex-col">
          <div className="bg-blue-600 p-8 text-white relative shrink-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Post an Opportunity</DialogTitle>
              <DialogDescription className="text-blue-100 text-sm mt-1">
                Help your juniors and fellow alumni find their next big move by sharing relevant job roles.
              </DialogDescription>
            </DialogHeader>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Building2 className="h-32 w-32" />
            </div>
            <button
              onClick={() => setShowPostForm(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <form onSubmit={handlePostSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Opportunity Title</label>
                  <Input
                    placeholder="e.g. Senior Software Engineer"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="rounded-xl border-slate-200 h-12 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Company Name</label>
                  <Input
                    placeholder="e.g. Google India"
                    required
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="rounded-xl border-slate-200 h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Location</label>
                  <Input
                    placeholder="e.g. Bangalore, KA"
                    required
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="rounded-xl border-slate-200 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Work Mode</label>
                  <select
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-white"
                    value={formData.workMode}
                    onChange={e => setFormData({ ...formData, workMode: e.target.value })}
                  >
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Job Type</label>
                  <select
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-white"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Application Deadline</label>
                  <Input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    className="rounded-xl border-slate-200 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Salary / Stipend Info</label>
                <Input
                  placeholder="e.g. 12LPA - 15LPA or 25k/month"
                  value={formData.salary}
                  onChange={e => setFormData({ ...formData, salary: e.target.value })}
                  className="rounded-xl border-slate-200 h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Application Link / Email</label>
                <Input
                  placeholder="https://company.com/apply or careers@company.com"
                  required
                  value={formData.applicationLink}
                  onChange={e => setFormData({ ...formData, applicationLink: e.target.value })}
                  className="rounded-xl border-slate-200 h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Required Skills (comma separated)</label>
                <Input
                  placeholder="React, Node.js, Python..."
                  value={formData.skills}
                  onChange={e => setFormData({ ...formData, skills: e.target.value })}
                  className="rounded-xl border-slate-200 h-12"
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPostForm(false)}
                  className="flex-1 rounded-xl h-12 font-black uppercase tracking-widest text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20"
                >
                  Publish Role
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Opportunities;
