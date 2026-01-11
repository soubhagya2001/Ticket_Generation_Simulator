import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
import TrainList from '../components/TrainList';
import TrainRouteModal from '../components/TrainRouteModal';
import { getTrainsBetweenStations, getTrainsBetweenStationsOnDate, getTrainRoute } from '../services/trainService';
import { AlertCircle, Train as TrainIcon } from 'lucide-react';
import { useSearch } from '../context/SearchContext';

const Home = () => {
  const navigate = useNavigate();
  const { trains, hasSearched, loading, error, searchDetails, updateSearch } = useSearch();
  
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [selectedTrainNo, setSelectedTrainNo] = useState(null);

  const handleSearch = async ({ from, to, date }) => {
    updateSearch({ loading: true, error: null, hasSearched: true, searchDetails: { from, to, date } });
    try {
      let data;
      if (date) {
        data = await getTrainsBetweenStationsOnDate(from, to, date);
      } else {
        data = await getTrainsBetweenStations(from, to);
      }
      
      if (data.success) {
        updateSearch({ trains: data.data || [], loading: false });
      } else {
        updateSearch({ error: data.message || 'Failed to fetch trains', loading: false });
      }
    } catch (err) {
      updateSearch({ 
        error: 'An error occurred while fetching trains. Please make sure the backend server is running.', 
        loading: false 
      });
      console.error(err);
    }
  };

  const handleViewRoute = async (trainNo) => {
    setSelectedTrainNo(trainNo);
    setRouteModalOpen(true);
    setRouteData(null);
    try {
      const data = await getTrainRoute(trainNo);
      if (data.success) {
        setRouteData(data.data);
      } else {
        updateSearch({ error: data.message || 'Failed to fetch route' });
      }
    } catch (err) {
      console.error(err);
      updateSearch({ error: 'Failed to fetch train route.' });
    }
  };

  const handleGenerateTicket = (train) => {
    navigate('/generate-ticket', { state: { train, searchDate: searchDetails.date } });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800 pt-16 pb-28 px-4 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-500/5 rounded-full -ml-36 -mb-36 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
            Indian Railway <span className="text-orange-500">Fast Search</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-medium max-w-2xl mx-auto opacity-90">
            Book your tickets faster with our intelligent train search and route discovery system.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-16 pb-20 flex-1 z-20">
        <SearchForm onSearch={handleSearch} isLoading={loading} />

        <div className="mt-12 space-y-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl flex items-start space-x-4 shadow-sm animate-in slide-in-from-top-4 duration-300">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-bold uppercase tracking-wide text-sm">Action Required</h3>
                <p className="text-red-700 mt-1 font-medium">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-3 text-xs font-bold text-red-600 hover:text-red-800 uppercase"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {hasSearched && (
            <TrainList 
              trains={trains} 
              loading={loading} 
              onViewRoute={handleViewRoute} 
              onGenerateTicket={handleGenerateTicket}
            />
          )}

          {!hasSearched && !loading && (
            <div className="flex flex-col items-center justify-center py-16 opacity-40">
              <TrainIcon className="h-24 w-24 text-blue-900 mb-6" />
              <p className="text-xl font-bold text-blue-900 uppercase tracking-[0.2em]">Enter details to start searching</p>
            </div>
          )}
        </div>
      </main>

      <TrainRouteModal 
        isOpen={routeModalOpen} 
        onClose={() => setRouteModalOpen(false)} 
        routeData={routeData} 
        trainNo={selectedTrainNo}
      />
    </div>
  );
};

export default Home;
