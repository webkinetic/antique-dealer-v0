"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"

interface Category {
  id: number
  name: string
  slug: string
}

interface ProductFiltersProps {
  categories: Category[]
  initialCategoryId?: string
  initialCondition?: string
  initialMinPrice?: number
  initialMaxPrice?: number
  initialSort?: string
}

export default function ProductFilters({
  categories,
  initialCategoryId,
  initialCondition,
  initialMinPrice = 0,
  initialMaxPrice = 10000,
  initialSort = "newest",
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [categoryId, setCategoryId] = useState<string | undefined>(initialCategoryId)
  const [condition, setCondition] = useState<string | undefined>(initialCondition)
  const [priceRange, setPriceRange] = useState<[number, number]>([initialMinPrice || 0, initialMaxPrice || 10000])
  const [sort, setSort] = useState(initialSort || "newest")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams()

    if (categoryId) {
      params.set("category", categoryId)
    }

    if (condition) {
      params.set("condition", condition)
    }

    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString())
    }

    if (priceRange[1] < 10000) {
      params.set("maxPrice", priceRange[1].toString())
    }

    if (sort) {
      params.set("sort", sort)
    }

    router.push(`/products?${params.toString()}`)
  }

  // Clear all filters
  const clearFilters = () => {
    setCategoryId(undefined)
    setCondition(undefined)
    setPriceRange([0, 10000])
    setSort("newest")
    router.push("/products")
  }

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    setSort(newSort)

    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", newSort)

    if (categoryId) {
      params.set("category", categoryId)
    }

    if (condition) {
      params.set("condition", condition)
    }

    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString())
    }

    if (priceRange[1] < 10000) {
      params.set("maxPrice", priceRange[1].toString())
    }

    router.push(`/products?${params.toString()}`)
  }

  return (
    <>
      {/* Mobile filter button */}
      <div className="lg:hidden mb-4">
        <Button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          variant="outline"
          className="w-full flex items-center justify-center"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Mobile filters */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity lg:hidden ${mobileFiltersOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className={`fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl transform transition-transform ${mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-500">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-4 overflow-y-auto h-full pb-20">
            {/* Filter content - same as desktop */}
            {/* ... */}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={clearFilters} className="flex-1">
                Clear
              </Button>
              <Button
                onClick={() => {
                  applyFilters()
                  setMobileFiltersOpen(false)
                }}
                className="flex-1 bg-[#00563F]"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop filters */}
      <div className="hidden lg:block">
        {/* Filter content */}
        {/* ... */}
      </div>
    </>
  )
}
