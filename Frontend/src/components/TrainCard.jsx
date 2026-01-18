import React from 'react';
import { Clock, Navigation, CalendarDays, ChevronRight } from 'lucide-react';
import { cn } from '../utils/utils';
import { DAYS_SHORT } from '../../constants/miscConstant';

const TrainCard = ({ train, onViewRoute, onGenerateTicket, isGrid = false }) => {
  const { train_base } = train;
  
  // Running days representation: "0010011" -> M T W T F S S
  const days = DAYS_SHORT;
  const runningDays = train_base.running_days.split('');

  return (
    <div className={cn(
      "bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col",
      isGrid ? "h-full" : ""
    )}>
      <div className="bg-blue-50/50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center space-x-2 overflow-hidden">
          <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase flex-shrink-0">
            {train_base.train_no}
          </span>
          <h3 className="font-bold text-blue-900 group-hover:text-blue-700 transition-colors uppercase text-xs truncate">
            {train_base.train_name}
          </h3>
        </div>
        <div className="flex space-x-0.5 flex-shrink-0">
          {days.map((day, idx) => (
            <span
              key={idx}
              className={cn(
                "text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold",
                runningDays[idx] === '1' 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-gray-100 text-gray-300"
              )}
            >
              {day}
            </span>
          ))}
        </div>
      </div>

      <div className={cn(isGrid ? "p-4 flex-1" : "p-4 px-6")}>
        <div className={cn("flex justify-between items-center gap-4", isGrid ? "flex-col md:flex-row lg:flex-col xl:flex-row" : "flex-row")}>
          <div className={cn("flex-1 flex flex-col", isGrid ? "items-center md:items-start lg:items-center xl:items-start" : "items-start")}>
            <p className="text-2xl font-black text-gray-800 tracking-tight">{train_base.from_time}</p>
            <p className="text-[10px] font-bold text-blue-600 uppercase mt-0.5">{train_base.from_stn_code}</p>
            <p className="text-[10px] text-gray-500 font-medium truncate max-w-[150px]">{train_base.from_stn_name}</p>
          </div>
 
          <div className="flex flex-col items-center justify-center space-y-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase">{train_base.travel_time} hrs</p>
            <div className="flex items-center space-x-1 text-gray-300">
              <div className="h-[1px] w-8 bg-gray-200"></div>
              <Clock className="h-3 w-3" />
              <div className="h-[1px] w-8 bg-gray-200"></div>
            </div>
          </div>
 
          <div className={cn("flex-1 flex flex-col", isGrid ? "items-center md:items-end lg:items-center xl:items-end" : "items-end")}>
            <p className="text-2xl font-black text-gray-800 tracking-tight">{train_base.to_time}</p>
            <p className="text-[10px] font-bold text-orange-600 uppercase mt-0.5">{train_base.to_stn_code}</p>
            <p className="text-[10px] text-gray-500 font-medium truncate max-w-[150px] text-right">{train_base.to_stn_name}</p>
          </div>
        </div>
 
        <div className={cn("flex flex-wrap gap-1.5 justify-start mt-3 pt-3 border-t border-gray-50", isGrid ? "justify-center" : "")}>
          {(train_base.classes || []).map((cls) => (
            <span 
              key={cls} 
              className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded uppercase"
            >
              {cls}
            </span>
          ))}
          {(!train_base.classes || train_base.classes.length === 0) && (
            <span className="text-[9px] text-gray-400 italic">No Class Info</span>
          )}
        </div>
      </div>

      <div className={cn("bg-gray-50/50 px-4 py-2 border-t border-gray-100 flex justify-between items-center", isGrid ? "flex-col space-y-3" : "")}>
        {!isGrid && (
          <div className="flex items-center space-x-1 text-[10px] text-gray-500 font-medium">
            <Navigation className="h-2.5 w-2.5" />
            <span>{train_base.source_stn_code} ➔ {train_base.dstn_stn_code}</span>
          </div>
        )}
        <div className={cn("flex items-center", isGrid ? "w-full justify-between" : "space-x-3")}>
          <button 
            onClick={() => onViewRoute(train_base.train_no)}
            className="flex items-center space-x-0.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-tight group/btn"
          >
            <span>Route</span>
            <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
          <button 
            onClick={() => onGenerateTicket(train_base)}
            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition-all shadow-sm hover:shadow-emerald-100 uppercase tracking-tight flex items-center space-x-1"
          >
            <CalendarDays className="h-3 w-3" />
            <span>Generate</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainCard;
