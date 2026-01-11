import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, X, Search, ArrowRightLeft, Loader2 } from 'lucide-react';
import moment from 'moment';
import { cn } from '../utils/utils';
import { useSearch } from '../context/SearchContext';

const SearchForm = ({ onSearch, isLoading }) => {
  const { searchDetails } = useSearch();
  const [from, setFrom] = useState(searchDetails.from || '');
  const [to, setTo] = useState(searchDetails.to || '');
  // Convert DD-MM-YYYY back to YYYY-MM-DD for the input type="date"
  const initialDate = searchDetails.date ? moment(searchDetails.date, 'DD-MM-YYYY').format('YYYY-MM-DD') : '';
  const [date, setDate] = useState(initialDate);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!from || !to) return;
    
    // Format date if exists
    const formattedDate = date ? moment(date).format('DD-MM-YYYY') : null;
    onSearch({ from: from.toUpperCase(), to: to.toUpperCase(), date: formattedDate });
  };

  const swapStations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const isSearchDisabled = !from || !to || isLoading;

  return (
    <div className="w-full max-w-5xl mx-auto -mt-10 bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 backdrop-blur-sm bg-opacity-95">
      <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1 w-full relative">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
            From Station <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800 placeholder-gray-400 font-medium uppercase"
              placeholder="Source Station Code (e.g. ST)"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
            {from && (
              <button
                type="button"
                onClick={() => setFrom('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                title="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-center pb-2">
          <button
            type="button"
            onClick={swapStations}
            className="p-2 bg-blue-50 rounded-full text-blue-600 hover:bg-blue-100 hover:rotate-180 transition-all duration-300 shadow-sm"
            title="Swap Stations"
          >
            <ArrowRightLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 w-full relative">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
            To Station <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-orange-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800 placeholder-gray-400 font-medium uppercase"
              placeholder="Dest Station Code (e.g. ANND)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
            {to && (
              <button
                type="button"
                onClick={() => setTo('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                title="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 w-full relative">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">Journey Date (Optional)</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-emerald-500" />
            </div>
            <input
              type="date"
              className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={moment().format('YYYY-MM-DD')}
            />
            {date && (
              <button
                type="button"
                onClick={() => setDate('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                title="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSearchDisabled}
          className={cn(
            "w-full lg:w-auto font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2",
            isSearchDisabled 
              ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none" 
              : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-blue-200 hover:scale-105 active:scale-95"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
          <span>{isLoading ? 'Searching...' : 'Search Trains'}</span>
        </button>
      </form>
    </div>
  );
};

export default SearchForm;
