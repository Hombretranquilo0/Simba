'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ProductImageGallery({ images, alt }: ProductImageGalleryProps) {
  const uniqueImages = useMemo(
    () => images.filter((image, index, allImages) => image && allImages.indexOf(image) === index),
    [images]
  );
  const [selectedImage, setSelectedImage] = useState(uniqueImages[0] ?? '');

  if (!selectedImage) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-gray-900 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex items-center justify-center group">
        <Image
          src={selectedImage}
          alt={alt}
          fill
          className="object-contain p-12 group-hover:scale-105 transition-transform duration-700"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {uniqueImages.map((image) => {
          const isSelected = image === selectedImage;

          return (
            <button
              key={image}
              type="button"
              onClick={() => setSelectedImage(image)}
              className={`aspect-square bg-white dark:bg-gray-900 rounded-2xl border p-2 overflow-hidden transition-colors ${
                isSelected
                  ? 'border-simba-orange dark:border-green-500'
                  : 'border-gray-100 dark:border-gray-800 hover:border-simba-orange dark:hover:border-green-500'
              }`}
              aria-label={alt}
              aria-pressed={isSelected}
            >
              <Image src={image} alt="" width={100} height={100} className="object-contain w-full h-full" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
