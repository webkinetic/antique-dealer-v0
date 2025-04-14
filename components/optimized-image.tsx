"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width = 500,
  height = 500,
  className = "",
  priority = false,
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src)
  const [loading, setLoading] = useState<boolean>(!priority)
  const [error, setError] = useState<boolean>(false)

  // Check if it's an ImgBB URL
  const isImgBB = src.includes("ibb.co") || src.includes("i.ibb.co")

  // For ImgBB images, we can use their built-in resizing
  // Example: https://i.ibb.co/abc123/image.jpg becomes https://i.ibb.co/t/abc123/image.jpg for thumbnails
  useEffect(() => {
    if (isImgBB && src.includes("i.ibb.co")) {
      // Create a thumbnail URL for initial loading
      // This uses ImgBB's thumbnail feature by replacing /abc123/ with /t/abc123/
      const thumbnailSrc = src.replace(/\/([^/]+)\/([^/]+)$/, "/t/$1/$2")

      if (!priority) {
        setImgSrc(thumbnailSrc)
      }

      // Preload the full image
      const fullImg = new Image()
      fullImg.src = src
      fullImg.onload = () => {
        setImgSrc(src)
        setLoading(false)
      }
      fullImg.onerror = () => {
        setError(true)
        setLoading(false)
      }
    }
  }, [src, isImgBB, priority])

  // For placeholder images or when there's an error
  if (error || !src) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width: "100%", height: "100%" }}
      >
        <span className="text-gray-400 text-sm">{alt || "Image not available"}</span>
      </div>
    )
  }

  // For ImgBB images, use a div with background-image for better performance
  if (isImgBB) {
    return (
      <div
        className={`${className} ${loading ? "bg-gray-100 animate-pulse" : ""}`}
        style={{
          backgroundImage: `url(${imgSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          height: "100%",
          position: "relative",
        }}
        aria-label={alt}
      />
    )
  }

  // For other images, use Next.js Image component
  return (
    <Image
      src={imgSrc || "/placeholder.svg"}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${loading ? "bg-gray-100 animate-pulse" : ""}`}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      onLoad={() => setLoading(false)}
      onError={() => setError(true)}
    />
  )
}
