"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";
import MemoList from "@/components/MemoList";
import { Memo } from "@/types";

export default function Home() {
  const [selectedStartDate, setSelectedStartDate] = useState<Date>(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState<Date>(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [showKB, setShowKB] = useState(false);

  const handleMemosChanged = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-2">
        <h2 className="text-xl font-bold text-gray-800">일정 관리</h2>
        <button
          onClick={() => setShowKB(!showKB)}
          className={`px-6 py-2 rounded-full font-bold transition-all ${
            showKB 
              ? "bg-yellow-400 text-yellow-900 shadow-md ring-2 ring-yellow-400 ring-offset-2" 
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {showKB ? "KB 모드 켜짐" : "KB"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-auto min-h-[80vh] flex-1">
        <div className="flex-[5] h-full">
          <Calendar 
            selectedStartDate={selectedStartDate} 
            selectedEndDate={selectedEndDate}
            onSelectDateRange={(start, end) => {
              setSelectedStartDate(start);
              setSelectedEndDate(end);
            }} 
            refreshKey={refreshKey} 
            showKB={showKB}
          />
        </div>
        <div className="flex-[2] min-w-[360px] h-full">
          <MemoList 
            selectedStartDate={selectedStartDate}
            selectedEndDate={selectedEndDate} 
            onMemosChanged={handleMemosChanged} 
            showKB={showKB}
          />
        </div>
      </div>
    </div>
  );
}
