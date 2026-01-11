import React from 'react';
import { Train } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Train className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-blue-900">
              Ticket<span className="text-orange-600">Generator</span>
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {/* <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Home</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">PNR Status</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Live Train</a>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-sm">
              Login
            </button> */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
