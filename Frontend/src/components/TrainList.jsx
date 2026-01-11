import React from 'react';
import TrainCard from './TrainCard';
import { TrainTrack } from 'lucide-react';

const TrainList = ({ trains, loading, onViewRoute, onGenerateTicket }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white rounded-xl h-52 animate-pulse border border-gray-100 shadow-sm flex flex-col">
            <div className="h-12 bg-gray-100/50 border-b border-gray-50 flex items-center px-6">
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="flex-1 p-6 flex justify-between items-center">
              <div className="h-12 w-24 bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-100 rounded"></div>
              <div className="h-12 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="h-12 bg-gray-50/50 border-t border-gray-50"></div>
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
      </div>
      <div className="grid grid-cols-1 gap-6">
        {trains.map((train, idx) => (
          <TrainCard 
            key={train.train_base.train_no + idx} 
            train={train} 
            onViewRoute={onViewRoute} 
            onGenerateTicket={onGenerateTicket}
          />
        ))}
      </div>
    </div>
  );
};

export default TrainList;
