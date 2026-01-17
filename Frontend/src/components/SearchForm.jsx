import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, X, Search, ArrowRightLeft, Loader2 } from 'lucide-react';
import moment from 'moment';
import { cn } from '../utils/utils';
import { useSearch } from '../context/SearchContext';
import stationsData from '../utils/stations.json';

const SearchForm = ({ onSearch, isLoading }) => {
  const { searchDetails } = useSearch();
  const [from, setFrom] = useState(searchDetails.from || '');
  const [to, setTo] = useState(searchDetails.to || '');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  
  const fromRef = useRef(null);
  const toRef = useRef(null);

  // Convert DD-MM-YYYY back to YYYY-MM-DD for the input type="date"
  const initialDate = searchDetails.date ? moment(searchDetails.date, 'DD-MM-YYYY').format('YYYY-MM-DD') : '';
  const [date, setDate] = useState(initialDate);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromSuggestions(false);
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStations = (query) => {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    const matches = [];
    
    // Convert stationsData to entries for searching
    const entries = Object.entries(stationsData);
    
    for (const [code, name] of entries) {
      if (code.toLowerCase().includes(lowerQuery) || name.toLowerCase().includes(lowerQuery)) {
        matches.push({ code, name });
      }
      if (matches.length >= 8) break; // Limit suggestions
    }
    return matches;
  };

  const handleFromChange = (e) => {
    const val = e.target.value;
    setFrom(val);
    const suggestions = getStations(val);
    setFromSuggestions(suggestions);
    setShowFromSuggestions(true);
  };

  const handleToChange = (e) => {
    const val = e.target.value;
    setTo(val);
    const suggestions = getStations(val);
    setToSuggestions(suggestions);
    setShowToSuggestions(true);
  };

  const selectStation = (station, type) => {
    const formatted = `${station.name} (${station.code})`;
    if (type === 'from') {
      setFrom(formatted);
      setShowFromSuggestions(false);
    } else {
      setTo(formatted);
      setShowToSuggestions(false);
    }
  };

  const extractCode = (str) => {
    const match = str.match(/\(([^)]+)\)$/);
    return match ? match[1] : str.trim().toUpperCase();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!from || !to) return;
    
    const fromCode = extractCode(from);
    const toCode = extractCode(to);
    
    // Format date if exists
    const formattedDate = date ? moment(date).format('DD-MM-YYYY') : null;
    onSearch({ from: fromCode, to: toCode, date: formattedDate });
  };

  const swapStations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const isSearchDisabled = !from || !to || isLoading;

  const renderSuggestions = (suggestions, type) => {
    if (suggestions.length === 0) return null;
    return (
      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {suggestions.map((station) => (
          <button
            key={station.code}
            type="button"
            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group"
            onClick={() => selectStation(station, type)}
          >
            <div>
              <span className="font-bold text-gray-800 group-hover:text-blue-700">{station.name}</span>
              <p className="text-xs text-gray-400 font-medium tracking-wider uppercase">{station.code}</p>
            </div>
            <MapPin className="h-4 w-4 text-gray-300 group-hover:text-blue-400" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto -mt-10 bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 backdrop-blur-sm bg-opacity-95">
      <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1 w-full relative" ref={fromRef}>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
            From Station <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800 placeholder-gray-400 font-medium"
              placeholder="Search station (e.g. Surat or ST)"
              value={from}
              onChange={handleFromChange}
              onFocus={() => from.length >= 2 && setShowFromSuggestions(true)}
              required
              autoComplete="off"
            />
            {from && (
              <button
                type="button"
                onClick={() => { setFrom(''); setFromSuggestions([]); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                title="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {showFromSuggestions && renderSuggestions(fromSuggestions, 'from')}
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

        <div className="flex-1 w-full relative" ref={toRef}>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
            To Station <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-orange-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800 placeholder-gray-400 font-medium"
              placeholder="Search destination (e.g. Anand or ANND)"
              value={to}
              onChange={handleToChange}
              onFocus={() => to.length >= 2 && setShowToSuggestions(true)}
              required
              autoComplete="off"
            />
            {to && (
              <button
                type="button"
                onClick={() => { setTo(''); setToSuggestions([]); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                title="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {showToSuggestions && renderSuggestions(toSuggestions, 'to')}
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
