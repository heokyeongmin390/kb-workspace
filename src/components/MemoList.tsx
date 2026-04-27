"use client";

import { useState, useEffect } from "react";
import { format, min, max, startOfDay } from "date-fns";
import { Plus, Trash2, Edit2, X, Check, Calendar as CalendarIcon, CalendarOff } from "lucide-react";
import { Memo } from "@/types";
import { kbSchedule } from "@/lib/kbSchedule";
import { fetchMemosFromServer, saveMemosToServer } from "@/app/actions";

interface MemoListProps {
  selectedStartDate: Date;
  selectedEndDate: Date;
  onMemosChanged: () => void;
  showKB?: boolean;
}

const COLORS = [
  { name: "빨강", value: "bg-red-500" },
  { name: "파랑", value: "bg-blue-500" },
  { name: "초록", value: "bg-green-500" },
  { name: "노랑", value: "bg-yellow-500" },
  { name: "보라", value: "bg-purple-500" },
  { name: "회색", value: "bg-gray-500" },
];

export default function MemoList({ selectedStartDate, selectedEndDate, onMemosChanged, showKB = false }: MemoListProps) {
  const [allMemos, setAllMemos] = useState<Memo[]>([]);
  const [newMemo, setNewMemo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [showOnCalendar, setShowOnCalendar] = useState(true);

  const start = startOfDay(min([selectedStartDate, selectedEndDate]));
  const end = startOfDay(max([selectedStartDate, selectedEndDate]));
  
  const startStr = format(start, "yyyy-MM-dd");
  const endStr = format(end, "yyyy-MM-dd");

  const isSingleDay = start.getTime() === end.getTime();
  const title = isSingleDay 
    ? `${format(start, "M월 d일")} 메모` 
    : `${format(start, "M월 d일")} ~ ${format(end, "M월 d일")} 메모`;

  useEffect(() => {
    const loadMemos = async () => {
      const { memos: serverMemos, configured } = await fetchMemosFromServer(showKB);
      let parsed: Memo[] = [];
      if (configured) {
        parsed = serverMemos;
      } else {
        const storageKey = showKB ? "all-memos-kb" : "all-memos-normal";
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          parsed = JSON.parse(saved);
        }
      }
      
      if (showKB) {
        setAllMemos([...parsed, ...kbSchedule]);
      } else {
        setAllMemos(parsed);
      }
    };
    loadMemos();
  }, [showKB]);

  const saveMemos = async (newMemos: Memo[]) => {
    // filter out kb- prefixed memos before saving to local storage
    const userMemos = newMemos.filter(m => !m.id.startsWith("kb-"));
    setAllMemos(newMemos);
    
    const { configured } = await saveMemosToServer(userMemos, showKB);
    if (!configured) {
      const storageKey = showKB ? "all-memos-kb" : "all-memos-normal";
      localStorage.setItem(storageKey, JSON.stringify(userMemos));
    }
    onMemosChanged();
  };

  const addMemo = () => {
    if (!newMemo.trim()) return;
    const memo: Memo = { 
      id: Date.now().toString(), 
      text: newMemo,
      color: selectedColor,
      showOnCalendar: showOnCalendar,
      startDate: startStr,
      endDate: endStr
    };
    saveMemos([...allMemos, memo]);
    setNewMemo("");
  };

  const deleteMemo = (id: string) => {
    saveMemos(allMemos.filter(m => m.id !== id));
  };

  const startEdit = (memo: Memo) => {
    setEditingId(memo.id);
    setEditText(memo.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    saveMemos(allMemos.map(m => m.id === id ? { ...m, text: editText } : m));
    setEditingId(null);
    setEditText("");
  };

  const toggleShowOnCalendar = (id: string) => {
    saveMemos(allMemos.map(m => m.id === id ? { ...m, showOnCalendar: !m.showOnCalendar } : m));
  };

  const currentMemos = allMemos.filter(memo => {
    return memo.startDate <= endStr && memo.endDate >= startStr;
  });

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border h-full flex flex-col min-h-[600px] transition-colors ${showKB ? 'border-yellow-300' : 'border-gray-100'}`}>
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 flex items-center">
        {title}
      </h2>

      <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-3">
        {currentMemos.length === 0 ? (
          <p className="text-gray-400 text-sm text-center mt-10">메모가 없습니다.</p>
        ) : (
          currentMemos.map((memo) => (
            <div key={memo.id} className="group bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
              {editingId === memo.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 border rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(memo.id)}
                  />
                  <button onClick={() => saveEdit(memo.id)} className="text-green-500 hover:text-green-600 p-2">
                    <Check className="w-5 h-5" />
                  </button>
                  <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 p-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${memo.color}`}></div>
                    <div className="flex flex-col">
                      <span className="text-gray-700 whitespace-pre-wrap leading-relaxed">{memo.text}</span>
                      {memo.startDate !== memo.endDate && (
                        <span className="text-[10px] text-gray-400 mt-1">
                          {memo.startDate.slice(5).replace('-','/')} ~ {memo.endDate.slice(5).replace('-','/')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button 
                      onClick={() => toggleShowOnCalendar(memo.id)} 
                      className={`p-1.5 rounded hover:bg-gray-200 ${memo.showOnCalendar ? 'text-blue-600' : 'text-gray-400'}`}
                      title="달력에 표시 전환"
                    >
                      {memo.showOnCalendar ? <CalendarIcon className="w-4 h-4" /> : <CalendarOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => startEdit(memo)} className="text-blue-500 hover:text-blue-700 p-1.5 rounded hover:bg-blue-50">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteMemo(memo.id)} className="text-red-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
        <input
          type="text"
          value={newMemo}
          onChange={(e) => setNewMemo(e.target.value)}
          placeholder="새 메모 추가..."
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          onKeyDown={(e) => e.key === 'Enter' && addMemo()}
        />
        
        <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-6 h-6 rounded-full transition-transform ${color.value} ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'}`}
                  title={color.name}
                />
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900">
              <input 
                type="checkbox" 
                checked={showOnCalendar}
                onChange={(e) => setShowOnCalendar(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              달력에 표시
            </label>
          </div>

          <button
            onClick={addMemo}
            className={`text-white px-5 py-2 rounded-lg transition-colors flex items-center justify-center shadow-sm font-medium gap-2 flex-shrink-0 ${showKB ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-900' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            <Plus className="w-5 h-5" />
            <span>추가</span>
          </button>
        </div>
      </div>
    </div>
  );
}
