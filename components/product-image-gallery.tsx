"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { OptimizedImage } from "./optimized-image"

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const selectImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  if (images.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
        <OptimizedImage
          src={`/placeholder.svg?height=600&width=600&text=${encodeURIComponent(productName)}`}
          alt={productName}
          className="w-full h-full object-cover"
          priority={true}
        />
      </div>
    )
  }

  return (
    <>
      <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
        <OptimizedImage
          src={images[currentImageIndex]}
          alt={`${productName} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
          priority={currentImageIndex === 0}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={goToPreviousImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1 md:p-2 rounded-full shadow-md"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1 md:p-2 rounded-full shadow-md"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Product Images</h3>
            <p className="text-sm text-gray-500">
              {currentImageIndex + 1} of {images.length}
            </p>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {images.map((img, index) => (
              <button
                key={index}
                type="button"
                className={`cursor-pointer border-2 rounded-md overflow-hidden ${
                  index === currentImageIndex
                    ? "border-[#00563F] ring-2 ring-[#00563F] ring-opacity-50"
                    : "border-transparent hover:border-gray-300"
                }`}
                onClick={() => selectImage(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={index === currentImageIndex ? "true" : "false"}
              >
                <div className="aspect-square relative">
                  <OptimizedImage
                    src={img}
                    alt={`${productName} - thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    width={100}
                    height={100}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
