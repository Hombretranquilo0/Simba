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
  );
}
