"use client";

import { useState } from "react";
import Image from "next/image";

type RoomGalleryProps = {
  images: string[];
  roomName: string;
  fallbackSrc: string;
};

export default function RoomGallery({ images, roomName, fallbackSrc }: RoomGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const safeImages = images.length ? images : [fallbackSrc];

  return (
    <div>
      <div className="relative h-96 lux-frame overflow-hidden mb-4">
        <Image
          src={safeImages[selectedImage] || fallbackSrc}
          alt={roomName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className="object-cover"
          unoptimized
        />
      </div>

      {safeImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {safeImages.map((img, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`relative h-20 lux-frame overflow-hidden transition-all ${
                selectedImage === idx
                  ? "ring-2 ring-amber-600"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              <Image
                src={img || fallbackSrc}
                alt={`${roomName} ${idx + 1}`}
                fill
                sizes="(max-width: 1024px) 25vw, 10vw"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
