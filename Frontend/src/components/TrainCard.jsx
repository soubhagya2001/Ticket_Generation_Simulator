import React from 'react';
import { Clock, Navigation, CalendarDays, ChevronRight } from 'lucide-react';
import { cn } from '../utils/utils';

const TrainCard = ({ train, onViewRoute, onGenerateTicket }) => {
  const { train_base } = train;
  
  // Running days representation: "0010011" -> M T W T F S S
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const runningDays = train_base.running_days.split('');

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="bg-blue-50/50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-bold bg-blue-600 text-white px-2 py-0.5 rounded uppercase">
            {train_base.train_no}
          </span>
          <h3 className="font-bold text-blue-900 group-hover:text-blue-700 transition-colors uppercase">
            {train_base.train_name}
          </h3>
        </div>
        <div className="flex space-x-1">
          {days.map((day, idx) => (
            <span
              key={idx}
              className={cn(
                "text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold transition-all",
                runningDays[idx] === '1' 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-gray-100 text-gray-400"
              )}
              title={runningDays[idx] === '1' ? 'Runs on this day' : 'Does not run'}
            >
              {day}
            </span>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left flex-1 min-w-[120px]">
            <p className="text-3xl font-black text-gray-800 tracking-tight">{train_base.from_time}</p>
            <p className="text-sm font-bold text-blue-600 uppercase mt-1">{train_base.from_stn_code}</p>
            <p className="text-xs text-gray-500 font-medium truncate max-w-[150px]">{train_base.from_stn_name}</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="h-px w-12 md:w-20 bg-gray-200"></div>
              <Clock className="h-4 w-4" />
              <div className="h-px w-12 md:w-20 bg-gray-200"></div>
            </div>
            <p className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{train_base.travel_time} hrs</p>
          </div>

          <div className="text-center md:text-right flex-1 min-w-[120px]">
            <p className="text-3xl font-black text-gray-800 tracking-tight">{train_base.to_time}</p>
            <p className="text-sm font-bold text-orange-600 uppercase mt-1">{train_base.to_stn_code}</p>
            <p className="text-xs text-gray-500 font-medium truncate max-w-[150px]">{train_base.to_stn_name}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start border-t border-gray-50 pt-4">
          {train_base.classes && train_base.classes.length > 0 ? (
            train_base.classes.map((cls) => (
              <span 
                key={cls} 
                className="text-[10px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md uppercase"
              >
                {cls}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-gray-400 italic font-medium">Class information not available</span>
          )}
        </div>
      </div>

      <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center space-x-1 text-xs text-gray-500 font-medium">
          <Navigation className="h-3 w-3" />
          <span>Source: {train_base.source_stn_code}</span>
          <span className="mx-1">•</span>
          <span>Dest: {train_base.dstn_stn_code}</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onViewRoute(train_base.train_no)}
            className="flex items-center space-x-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wide group/btn"
          >
            <span>View Route</span>
            <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => onGenerateTicket(train_base)}
            className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm hover:shadow-emerald-200 uppercase tracking-tight flex items-center space-x-1"
          >
            <CalendarDays className="h-4 w-4" />
            <span>Generate Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainCard;
