import React, { useRef, useState } from 'react';

export default function ProductGallery({ images = [], alt = '' }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const scrollRef = useRef(null);

  const imageList = images.length ? images : ['/placeholder-product.jpg'];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    setSelectedImage(index);
  };

  const scrollToImage = (idx) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    container.scrollTo({ left: idx * container.clientWidth, behavior: 'smooth' });
    setSelectedImage(idx);
  };

  return (
    <div>
      {/* Swipeable image carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="aspect-square bg-[#E5E5E5] mb-4 flex overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {imageList.map((img, idx) => (
          <div
            key={idx}
            className="w-full h-full shrink-0 snap-center flex items-center justify-center"
          >
            <img
              src={img}
              alt={alt}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-product.jpg';
              }}
            />
          </div>
        ))}
      </div>

      {/* Dot indicators - mobile */}
      {imageList.length > 1 && (
        <div className="flex justify-center gap-1.5 mb-4 md:hidden">
          {imageList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToImage(idx)}
              aria-label={`Go to image ${idx + 1}`}
              className={`w-2 h-2 rounded-full transition-colors ${
                selectedImage === idx ? 'bg-[#E31E24]' : 'bg-[#E5E5E5]'
              }`}
            />
          ))}
        </div>
      )}

      {/* Thumbnails - desktop */}
      {imageList.length > 1 && (
        <div className="hidden md:flex gap-2 overflow-x-auto">
          {imageList.map((img, idx) => (
            <button
              key={idx}
              onClick={() => scrollToImage(idx)}
              className={`w-20 h-20 shrink-0 border-2 overflow-hidden bg-[#E5E5E5] ${
                selectedImage === idx ? 'border-[#E31E24]' : 'border-transparent'
              }`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-product.jpg';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
