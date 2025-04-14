"use client"

import { useRef, useEffect } from "react"
import Link from "next/link"

interface Category {
  id: number
  name: string
  slug: string
  image?: string
}

interface CategorySliderProps {
  categories: Category[]
}

export function CategorySlider({ categories }: CategorySliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const scrollbar = scrollbarRef.current
    if (!container || !scrollbar) return

    // Handle arrow buttons
    const prevBtn = document.getElementById("category-prev")
    const nextBtn = document.getElementById("category-next")

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        container.scrollBy({ left: -300, behavior: "smooth" })
      })
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        container.scrollBy({ left: 300, behavior: "smooth" })
      })
    }

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
      if (prevBtn) prevBtn.removeEventListener("click", () => {})
      if (nextBtn) nextBtn.removeEventListener("click", () => {})
      container.removeEventListener("scroll", updateThumbPosition)
      scrollbar.innerHTML = "" // Clean up
    }
  }, [])

  return (
    <>
      <div
        ref={containerRef}
        className="overflow-x-auto -mx-4 px-4 pb-4 scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="flex space-x-4 md:space-x-6 min-w-max">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.id}`} className="group w-[140px] md:w-56">
                <div className="overflow-hidden rounded-lg aspect-square mb-3 md:mb-4">
                  <img
                    src={
                      category.image ||
                      `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(category.name) || "/placeholder.svg"}`
                    }
                    alt={category.name}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-center font-medium text-sm md:text-lg">{category.name}</h3>
              </Link>
            ))
          ) : (
            <>
              {["Furniture", "Art", "Decorative Arts", "Collectibles", "Vintage Items"].map((name) => (
                <Link
                  key={name}
                  href={`/categories/${name.toLowerCase().replace(" ", "-")}`}
                  className="group w-40 md:w-56"
                >
                  <div className="overflow-hidden rounded-lg aspect-square mb-3 md:mb-4">
                    <img
                      src={`/placeholder.svg?height=300&width=300&text=${encodeURIComponent(name)}`}
                      alt={name}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-center font-medium text-sm md:text-lg">{name}</h3>
                </Link>
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
