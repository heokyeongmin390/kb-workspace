"use client";

import { useState, useEffect } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay,
  addDays,
  min,
  max,
  startOfDay
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Memo } from "@/types";
import { kbSchedule } from "@/lib/kbSchedule";

interface CalendarProps {
  selectedStartDate: Date;
  selectedEndDate: Date;
  onSelectDateRange: (start: Date, end: Date) => void;
  refreshKey?: number;
  showKB?: boolean;
}

export default function Calendar({ 
  selectedStartDate, 
  selectedEndDate, 
  onSelectDateRange, 
  refreshKey = 0,
  showKB = false
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [allMemos, setAllMemos] = useState<Memo[]>([]);
  const [dragAnchor, setDragAnchor] = useState<Date | null>(null);

  useEffect(() => {
    const storageKey = showKB ? "all-memos-kb" : "all-memos-normal";
    const saved = localStorage.getItem(storageKey);
    let parsed: Memo[] = [];
    if (saved) {
      parsed = JSON.parse(saved);
    }
    
    if (showKB) {
      setAllMemos([...parsed, ...kbSchedule]);
    } else {
      setAllMemos(parsed);
    }
  }, [refreshKey, showKB]);

  useEffect(() => {
    const handleGlobalMouseUp = () => setDragAnchor(null);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleMouseDown = (day: Date) => {
    const d = startOfDay(day);
    setDragAnchor(d);
    onSelectDateRange(d, d);
  };

  const handleMouseEnter = (day: Date) => {
    if (dragAnchor) {
      const d = startOfDay(day);
      onSelectDateRange(dragAnchor, d);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6 px-2">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 select-none">
          {format(currentMonth, "yyyy년 MM월")}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [
      { name: "일", color: "text-red-500" }, 
      { name: "월", color: "text-gray-600" }, 
      { name: "화", color: "text-gray-600" }, 
      { name: "수", color: "text-gray-600" }, 
      { name: "목", color: "text-gray-600" }, 
      { name: "금", color: "text-gray-600" }, 
      { name: "토", color: "text-blue-500" }
    ];
    return (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day, idx) => (
          <div key={idx} className={`text-center font-bold text-sm py-2 select-none ${day.color}`}>
            {day.name}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const selStart = startOfDay(min([selectedStartDate, selectedEndDate]));
    const selEnd = startOfDay(max([selectedStartDate, selectedEndDate]));

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formattedDate = format(day, "d");
        const dateKey = format(day, "yyyy-MM-dd");
        
        let textColor = "text-gray-700";
        if (i === 0) textColor = "text-red-500";
        else if (i === 6) textColor = "text-blue-500";
        
        if (!isSameMonth(day, monthStart)) {
          textColor = "text-gray-300";
        }

        const dayStart = startOfDay(day);
        const isToday = isSameDay(day, new Date());
        const isSelected = dayStart >= selStart && dayStart <= selEnd;
        const isSelectionStart = dayStart.getTime() === selStart.getTime();
        const isSelectionEnd = dayStart.getTime() === selEnd.getTime();

        const dayMemos = allMemos.filter(m => m.startDate <= dateKey && m.endDate >= dateKey);
        const hasHiddenMemos = dayMemos.length > 0 && dayMemos.every(m => !m.showOnCalendar);

        days.push(
          <div
            key={day.toString()}
            onMouseDown={() => handleMouseDown(cloneDay)}
            onMouseEnter={() => handleMouseEnter(cloneDay)}
            className={`
              flex flex-col relative min-h-[100px] sm:min-h-[120px] transition-colors border-b border-r border-gray-100 select-none outline-none focus:outline-none
              ${i === 0 ? 'border-l' : ''}
              ${isSelected ? "bg-blue-50/50 z-10" : "hover:bg-gray-50"}
            `}
          >
            <div className="flex justify-between items-start p-2 pb-0">
              <span className={`text-sm font-semibold flex items-center justify-center ${isSelected && (isSelectionStart || isSelectionEnd) ? 'bg-blue-500 text-white w-7 h-7 rounded-full' : isToday ? 'bg-blue-100 text-blue-800 w-7 h-7 rounded-full ring-2 ring-blue-500 ring-inset' : textColor + ' w-7 h-7'}`}>
                {formattedDate}
              </span>
              
              {hasHiddenMemos && (
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 mr-1" title="메모 있음"></div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-[2px] mt-1 scrollbar-hide flex flex-col">
              {dayMemos.filter(m => m.showOnCalendar).map(memo => {
                const isMemoStart = memo.startDate === dateKey;
                const isMemoEnd = memo.endDate === dateKey;
                const isSunday = i === 0;
                const isSaturday = i === 6;
                
                return (
                  <div 
                    key={memo.id} 
                    className={`text-xs py-1 truncate font-medium ${memo.color} relative z-20 shadow-sm`}
                    style={{
                      marginLeft: isMemoStart ? '4px' : '0px',
                      marginRight: isMemoEnd ? '4px' : '0px',
                      paddingLeft: isMemoStart ? '8px' : '4px',
                      paddingRight: isMemoEnd ? '8px' : '4px',
                      borderTopLeftRadius: (isMemoStart || isSunday) ? '4px' : '0px',
                      borderBottomLeftRadius: (isMemoStart || isSunday) ? '4px' : '0px',
                      borderTopRightRadius: (isMemoEnd || isSaturday) ? '4px' : '0px',
                      borderBottomRightRadius: (isMemoEnd || isSaturday) ? '4px' : '0px',
                    }}
                    title={memo.text}
                  >
                    {isMemoStart || isSunday || dayStart.getDate() === 1 ? memo.text : '\u00A0'}
                  </div>
                );
              })}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 border-t border-gray-100" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border border-gray-100 rounded-xl overflow-hidden bg-white mt-2 shadow-sm">{rows}</div>;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col min-h-[600px] select-none">
      {renderHeader()}
      <div className="flex-1 flex flex-col">
        {renderDays()}
        {renderCells()}
      </div>
    </div>
  );
}
