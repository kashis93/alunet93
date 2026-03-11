import { useState, useEffect } from "react";
import StartupCard from "./StartupCard";
import StartupDetails from "./StartupDetails";
import PostStartupPage from "./PostStartupPage";
import { subscribeToStartups } from "../../services/dataService";
import StartupFilters from "./StartupFilters";

const Startup = () => {
  const [ideas, setIdeas] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [showPostPage, setShowPostPage] = useState(false);

  /* FILTERS */
  const [filters, setFilters] = useState({
    stages: [],
    sectors: [],
    needs: []
  });

  useEffect(() => {
    const unsubscribe = subscribeToStartups((data) => {
      setIdeas(data);
    });
    return unsubscribe;
  }, []);

  /* DETAILS PAGE */
  if (selectedStartup) {
    return (
      <StartupDetails
        startup={selectedStartup}
        goBack={() => setSelectedStartup(null)}
      />
    );
  }

  /* POST IDEA PAGE */
  if (showPostPage) {
    return (
      <PostStartupPage
        addStartup={(startup) => {
          setShowPostPage(false);
        }}
        goBack={() => setShowPostPage(false)}
      />
    );
  }

  const filtered = ideas.filter(startup => {
    if (filters.stages?.length > 0) {
      if (!filters.stages.includes(startup.stage)) return false;
    }
    if (filters.sectors?.length > 0) {
      if (!filters.sectors.includes(startup.sector)) return false;
    }
    if (filters.needs?.length > 0) {
      // Check if any of the required needs match the startup's needs array
      if (!startup.needs?.some(n => filters.needs.includes(n))) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* HEADER & ACTION BAR */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Startups</h1>
              <div className="h-8 w-px bg-slate-200"></div>
              <p className="text-sm font-bold text-slate-500">{filtered.length} Ventures</p>
            </div>

            <button
              onClick={() => setShowPostPage(true)}
              className="w-full lg:w-auto bg-purple-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 active:scale-95 ml-auto"
            >
              + Launch Startup
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-72 shrink-0">
            <StartupFilters
              filters={filters}
              onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* FEED */}
            <div className="grid md:grid-cols-2 gap-8">
              {filtered.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                  <p className="text-slate-400 text-lg font-bold">No startups found matching these filters...</p>
                </div>
              ) : (
                filtered.map(startup => (
                  <StartupCard
                    key={startup.id}
                    startup={startup}
                    onClick={() => setSelectedStartup(startup)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Startup;
