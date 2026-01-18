import React, { useState } from 'react';
import TrainCard from './TrainCard';
import { TrainTrack, LayoutGrid, List } from 'lucide-react';
import { cn } from '../utils/utils';

const TrainList = ({ trains, loading, onViewRoute, onGenerateTicket }) => {
  const [viewMode, setViewMode] = useState('list');

  if (loading) {
    return (
      <div className={cn(
        "grid gap-6",
        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
      )}>
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white rounded-xl h-48 animate-pulse border border-gray-100 shadow-sm flex flex-col">
            <div className="h-10 bg-gray-100/50 border-b border-gray-50 flex items-center px-4">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="flex-1 p-4 flex justify-between items-center">
              <div className="h-10 w-20 bg-gray-200 rounded"></div>
              <div className="h-3 w-20 bg-gray-100 rounded"></div>
              <div className="h-10 w-20 bg-gray-200 rounded"></div>
            </div>
            <div className="h-10 bg-gray-50/50 border-t border-gray-50"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!trains || trains.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrainTrack className="h-10 w-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-700">No trains found</h3>
        <p className="text-gray-500 mt-2">Try searching between different stations or dates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
          Available Trains <span className="text-blue-600 ml-2">({trains.length})</span>
        </h2>
        
        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 shadow-sm">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-1.5 rounded-md transition-all flex items-center space-x-1.5 px-3",
              viewMode === 'list' 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            )}
          >
            <List className="h-4 w-4" />
            <span className="text-[11px] font-black uppercase">List</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-1.5 rounded-md transition-all flex items-center space-x-1.5 px-3",
              viewMode === 'grid' 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="text-[11px] font-black uppercase">Grid</span>
          </button>
        </div>
      </div>

      <div className={cn(
        "grid gap-4 md:gap-6",
        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
      )}>
        {trains.map((train, idx) => (
          <TrainCard 
            key={train.train_base.train_no + idx} 
            train={train} 
            onViewRoute={onViewRoute} 
            onGenerateTicket={onGenerateTicket}
            isGrid={viewMode === 'grid'}
          />
        ))}
      </div>
    </div>
  );
};

export default TrainList;
