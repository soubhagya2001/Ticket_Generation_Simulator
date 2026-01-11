import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [trains, setTrains] = useState([]);
  const [searchDetails, setSearchDetails] = useState({ from: '', to: '', date: '' });
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateSearch = (data) => {
    if (data.trains !== undefined) setTrains(data.trains);
    if (data.searchDetails !== undefined) setSearchDetails(data.searchDetails);
    if (data.hasSearched !== undefined) setHasSearched(data.hasSearched);
    if (data.loading !== undefined) setLoading(data.loading);
    if (data.error !== undefined) setError(data.error);
  };

  const clearSearch = () => {
    setTrains([]);
    setSearchDetails({ from: '', to: '', date: '' });
    setHasSearched(false);
    setLoading(false);
    setError(null);
  };

  return (
    <SearchContext.Provider value={{ 
      trains, 
      searchDetails, 
      hasSearched, 
      loading, 
      error, 
      updateSearch,
      clearSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
