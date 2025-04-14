"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function ClientScript() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Handle sort select change
    const sortSelect = document.getElementById("sort-select") as HTMLSelectElement
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        const target = e.target as HTMLSelectElement
        const params = new URLSearchParams(searchParams.toString())
        params.set("sort", target.value)

        // Keep the current page if it exists
        if (!params.has("page")) {
          params.set("page", "1")
        }

        router.push(`/products?${params.toString()}`)
      })
    }

    // Handle mobile filter toggle with improved animation and behavior
    const filterToggleBtn = document.getElementById("filter-toggle-btn")
    const filterCloseBtn = document.getElementById("filter-close-btn")
    const filterOverlay = document.getElementById("filter-overlay")
    const filterSidebar = document.getElementById("filter-sidebar")

    if (filterToggleBtn && filterCloseBtn && filterOverlay && filterSidebar) {
      // Open filter sidebar
      filterToggleBtn.addEventListener("click", () => {
        // Prevent body scrolling when filter is open
        document.body.style.overflow = "hidden"

        // Show overlay with fade-in
        filterOverlay.classList.remove("hidden")
        filterOverlay.classList.add("opacity-50")

        // Slide in sidebar
        filterSidebar.classList.remove("-translate-x-full")
        filterSidebar.classList.add("translate-x-0")
      })

      // Close filter sidebar (both X button and overlay click)
      const closeFilter = () => {
        // Restore body scrolling
        document.body.style.overflow = ""

        // Fade out overlay
        filterOverlay.classList.remove("opacity-50")
        filterOverlay.classList.add("opacity-0")

        // Slide out sidebar
        filterSidebar.classList.remove("translate-x-0")
        filterSidebar.classList.add("-translate-x-full")

        // Hide overlay after animation completes
        setTimeout(() => {
          filterOverlay.classList.add("hidden")
        }, 300)
      }

      filterCloseBtn.addEventListener("click", closeFilter)
      filterOverlay.addEventListener("click", closeFilter)
    }

    // Clean up on unmount
    return () => {
      document.body.style.overflow = ""
    }
  }, [router, searchParams])

  return null
}
