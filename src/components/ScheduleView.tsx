"use client";

import { useState } from "react";
import Image from "next/image";
import ImageModal from "@/components/ImageModal";

const scheduleImages = [
  { src: "/5.png", alt: "일정 1", label: "일정표 1" },
  { src: "/6.png", alt: "일정 2", label: "일정표 2" },
  { src: "/7.png", alt: "일정 3", label: "일정표 3" },
  { src: "/8.png", alt: "일정 4", label: "일정표 4" }
];

export default function ScheduleView() {
  const [selectedImage, setSelectedImage] = useState<{src: string, alt: string} | null>(null);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[80vh]">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">KB 일정표 보기</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {scheduleImages.map((img, idx) => (
          <div 
            key={idx} 
            className="group cursor-pointer flex flex-col items-center bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            onClick={() => setSelectedImage({ src: img.src, alt: img.alt })}
          >
            <div className="relative w-full aspect-video mb-3 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
              <Image 
                src={img.src} 
                alt={img.alt} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <span className="font-medium text-gray-700">{img.label}</span>
          </div>
        ))}
      </div>

      {selectedImage && (
        <ImageModal 
          src={selectedImage.src} 
          alt={selectedImage.alt} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  );
}
