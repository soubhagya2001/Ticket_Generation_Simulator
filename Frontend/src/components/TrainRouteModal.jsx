import React from 'react';
import { X, MapPin, ArrowDown } from 'lucide-react';

const TrainRouteModal = ({ isOpen, onClose, routeData, trainNo }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b bg-blue-600 text-white">
          <div>
            <h2 className="text-xl font-bold uppercase">Train Route</h2>
            <p className="text-blue-100 text-sm font-medium">Train No: {trainNo}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {!routeData ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Fetching route details...</p>
            </div>
          ) : (
            <div className="space-y-0 relative">
              {/* Vertical line connecting stations */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-blue-200 z-0"></div>
              
              {routeData.map((station, idx) => (
                <div key={idx} className="relative z-10 flex items-start space-x-6 pb-8 last:pb-0 group">
                  <div className="mt-1.5 flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                      idx === 0 ? 'bg-blue-600 border-blue-200' : 
                      idx === routeData.length - 1 ? 'bg-orange-600 border-orange-200' : 
                      'bg-white border-blue-100 group-hover:border-blue-400'
                    }`}>
                      <MapPin className={`h-5 w-5 ${
                        idx === 0 || idx === routeData.length - 1 ? 'text-white' : 'text-blue-600'
                      }`} />
                    </div>
                  </div>

                  <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 group-hover:shadow-md group-hover:border-blue-200 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-gray-800 uppercase tracking-tight">{station.source_stn_name}</h4>
                        <p className="text-xs font-bold text-blue-600 tracking-wider">CODE: {station.source_stn_code}</p>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <p className="text-gray-400 text-[10px] font-bold uppercase">Arrive</p>
                          <p className="font-bold text-gray-700">{station.arrive}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400 text-[10px] font-bold uppercase">Depart</p>
                          <p className="font-bold text-gray-700">{station.depart}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400 text-[10px] font-bold uppercase">Distance</p>
                          <p className="font-bold text-gray-700">{station.distance} km</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-white flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-all uppercase text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainRouteModal;
