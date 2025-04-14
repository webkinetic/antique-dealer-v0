"use client"

import { useRef, useEffect } from "react"
import Link from "next/link"

interface Product {
  id: number
  name: string
  price: number
  image: string
  categories?: {
    name: string
  }
}

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const scrollbar = scrollbarRef.current
    if (!container || !scrollbar) return

    // Create scrollbar elements
    const track = document.createElement("div")
    track.className = "h-2 bg-gray-300 rounded-full w-full mt-4"
    track.style.position = "relative"

    const thumb = document.createElement("div")
    thumb.className = "h-full bg-gray-500 rounded-full cursor-pointer"
    thumb.style.position = "absolute"
    thumb.style.top = "0"
    thumb.style.width = "40%"
    thumb.style.left = "0"

    track.appendChild(thumb)
    scrollbar.appendChild(track)

    // Update thumb position when scrolling
    const updateThumbPosition = () => {
      const scrollRatio = container.scrollLeft / (container.scrollWidth - container.clientWidth)
      const maxThumbLeft = track.clientWidth - thumb.offsetWidth
      thumb.style.left = `${scrollRatio * maxThumbLeft}px`
    }

    container.addEventListener("scroll", updateThumbPosition)

    // Initial position
    updateThumbPosition()

    // Make thumb draggable
    let isDragging = false
    let startX = 0
    let startLeft = 0

    thumb.addEventListener("mousedown", (e) => {
      isDragging = true
      startX = e.clientX
      startLeft = Number.parseInt(thumb.style.left || "0", 10)
      e.preventDefault()
    })

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return

      const deltaX = e.clientX - startX
      const newLeft = Math.max(0, Math.min(startLeft + deltaX, track.clientWidth - thumb.offsetWidth))

      thumb.style.left = `${newLeft}px`

      // Update scroll position
      const scrollRatio = newLeft / (track.clientWidth - thumb.offsetWidth)
      container.scrollLeft = scrollRatio * (container.scrollWidth - container.clientWidth)
    })

    document.addEventListener("mouseup", () => {
      isDragging = false
    })

    return () => {
      container.removeEventListener("scroll", updateThumbPosition)
      scrollbar.innerHTML = "" // Clean up
    }
  }, [])

  return (
    <>
      <div
        ref={containerRef}
        className="overflow-x-auto pb-4 scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="flex space-x-6 min-w-max">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow w-[280px]">
                <div className="aspect-square relative">
                  <img
                    src={
                      product.image ||
                      `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(product.name) || "/placeholder.svg"}`
                    }
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.categories?.name || "Uncategorized"}</p>
                  <p className="font-bold text-lg mb-4">£{product.price}</p>
                  <Link
                    href={`/products/${product.id}`}
                    className="block text-center bg-[#00563F] hover:bg-[#00563F]/90 text-white px-4 py-2 rounded"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow w-[280px]">
                  <div className="aspect-square relative">
                    <img
                      src={`/placeholder.svg?height=300&width=300&text=Antique Item ${i}`}
                      alt={`Antique Item ${i}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">Antique Item {i}</h3>
                    <p className="font-bold text-lg mb-4">£250</p>
                    <Link
                      href="/products"
                      className="block text-center bg-[#00563F] hover:bg-[#00563F]/90 text-white px-4 py-2 rounded"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Simple scrollbar container */}
      <div ref={scrollbarRef} className="w-full"></div>
    </>
  )
}
