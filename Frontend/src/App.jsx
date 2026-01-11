import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TicketGeneration from './pages/TicketGeneration';
import { Train as TrainIcon } from 'lucide-react';

import { SearchProvider } from './context/SearchContext';

function App() {
  return (
    <SearchProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate-ticket" element={<TicketGeneration />} />
        </Routes>

        <footer className="bg-white border-t py-12 px-4 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <TrainIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-blue-900">
                Ticket<span className="text-orange-600">Generator</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium">© 2026 Indian Railway Ticket Generator. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
    </SearchProvider>
  );
}

export default App;
