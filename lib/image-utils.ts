/**
 * Utility functions for image optimization
 */

// Function to get optimized ImgBB URL based on size
export function getOptimizedImgBBUrl(url: string, size: "thumbnail" | "medium" | "full" = "full"): string {
  if (!url || !url.includes("ibb.co")) {
    return url
  }

  // ImgBB URLs are typically in the format: https://i.ibb.co/abc123/image.jpg
  try {
    // For thumbnail size (150px)
    if (size === "thumbnail") {
      return url.replace(/\/([^/]+)\/([^/]+)$/, "/t/$1/$2")
    }

    // For medium size (320px)
    if (size === "medium") {
      return url.replace(/\/([^/]+)\/([^/]+)$/, "/m/$1/$2")
    }

    // Return original URL for full size
    return url
  } catch (error) {
    console.error("Error optimizing ImgBB URL:", error)
    return url
  }
}

// Function to preload critical images
export function preloadImage(url: string): void {
  if (typeof window !== "undefined" && url) {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "image"
    link.href = url
    document.head.appendChild(link)
  }
}

// Function to check if an image exists and is valid
export async function checkImageExists(url: string): Promise<boolean> {
  if (!url) return false

  try {
    const response = await fetch(url, { method: "HEAD" })
    return response.ok
  } catch (error) {
    return false
  }
}
