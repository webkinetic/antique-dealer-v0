import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Filter, Home, ChevronRight, X, SlidersHorizontal, ChevronLeft } from "lucide-react"
import ClientScript from "./client-script"

// Function to fetch all products with filtering options and pagination
async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    // Use server-side Supabase client to avoid caching issues
    const supabase = createServerSupabaseClient()

    // Get pagination parameters
    const page = searchParams.page ? Number.parseInt(searchParams.page as string) : 1
    const pageSize = 12 // 12 products per page
    const offset = (page - 1) * pageSize

    // Start building the query
    let query = supabase.from("products").select("*", { count: "exact" })

    // Apply category filter if provided
    const categoryId = searchParams.category
    if (categoryId && !Array.isArray(categoryId)) {
      query = query.eq("category_id", categoryId)
    }

    // Apply condition filter if provided
    const condition = searchParams.condition
    if (condition && !Array.isArray(condition)) {
      query = query.eq("condition", condition)
    }

    // Apply price range filter if provided
    const minPrice = searchParams.minPrice
    const maxPrice = searchParams.maxPrice

    if (minPrice && !Array.isArray(minPrice)) {
      query = query.gte("price", Number.parseFloat(minPrice))
    }

    if (maxPrice && !Array.isArray(maxPrice)) {
      query = query.lte("price", Number.parseFloat(maxPrice))
    }

    // Apply sorting
    const sort = searchParams.sort
    if (sort && !Array.isArray(sort)) {
      switch (sort) {
        case "price-asc":
          query = query.order("price", { ascending: true })
          break
        case "price-desc":
          query = query.order("price", { ascending: false })
          break
        case "newest":
          query = query.order("created_at", { ascending: false })
          break
        default:
          query = query.order("created_at", { ascending: false })
      }
    } else {
      // Default sorting
      query = query.order("created_at", { ascending: false })
    }

    // Get total count first (without pagination)
    const { count, error: countError } = await query

    if (countError) {
      console.error("Error getting product count:", countError)
      return { products: [], totalCount: 0, totalPages: 0 }
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1)

    // Execute the query
    const { data: productsData, error: productsError } = await query

    if (productsError) {
      console.error("Error fetching products:", productsError)
      return { products: [], totalCount: 0, totalPages: 0 }
    }

    // Fetch all categories separately
    const { data: categoriesData, error: categoriesError } = await supabase.from("categories").select("id, name, slug")

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError)
      return {
        products: productsData || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      } // Return products without category info
    }

    // Create a map of category IDs to category objects
    const categoriesMap = new Map()
    if (categoriesData) {
      categoriesData.forEach((category) => {
        categoriesMap.set(category.id, category)
      })
    }

    // Manually add category info to products
    const productsWithCategories =
      productsData?.map((product) => ({
        ...product,
        categories: categoriesMap.get(product.category_id) || null,
      })) || []

    return {
      products: productsWithCategories,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    }
  } catch (error) {
    console.error("Error in getProducts:", error)
    return { products: [], totalCount: 0, totalPages: 0 }
  }
}

// Function to fetch all categories
async function getCategories() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("categories").select("*").order("name")

    if (error) {
      console.error("Error fetching categories:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getCategories:", error)
    return []
  }
}

export const revalidate = 0 // Disable cache for this route

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { products, totalCount, totalPages } = await getProducts(searchParams)
  const categories = await getCategories()

  // Get current filter values
  const currentCategoryId = searchParams.category as string | undefined
  const currentCondition = searchParams.condition as string | undefined
  const currentMinPrice = searchParams.minPrice ? Number.parseFloat(searchParams.minPrice as string) : 0
  const currentMaxPrice = searchParams.maxPrice ? Number.parseFloat(searchParams.maxPrice as string) : 10000
  const currentSort = (searchParams.sort as string) || "newest"
  const currentPage = searchParams.page ? Number.parseInt(searchParams.page as string) : 1

  // Find the current category name if a category filter is applied
  const currentCategory = categories.find((cat) => cat.id.toString() === currentCategoryId)

  // Count active filters
  const activeFilterCount = [currentCategoryId, currentCondition, currentMinPrice > 0, currentMaxPrice < 10000].filter(
    Boolean,
  ).length

  // Helper function to generate pagination URLs
  const getPaginationUrl = (page: number) => {
    const params = new URLSearchParams()

    if (currentCategoryId) params.set("category", currentCategoryId)
    if (currentCondition) params.set("condition", currentCondition)
    if (currentMinPrice > 0) params.set("minPrice", currentMinPrice.toString())
    if (currentMaxPrice < 10000) params.set("maxPrice", currentMaxPrice.toString())
    if (currentSort) params.set("sort", currentSort)
    params.set("page", page.toString())

    return `/products?${params.toString()}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ClientScript />

      {/* Breadcrumbs */}
      <nav className="flex text-sm text-gray-500 mb-6 w-full">
        <div className="flex items-center">
          <Link href="/" className="hover:text-[#00563F] flex items-center">
            <Home size={14} className="mr-1" />
            Home
          </Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="font-medium text-gray-900">
            {currentCategory ? (
              <>
                <Link href="/products" className="hover:text-[#00563F]">
                  Shop
                </Link>
                <ChevronRight size={14} className="mx-2 inline" />
                {currentCategory.name}
              </>
            ) : (
              "Shop"
            )}
          </span>
        </div>
      </nav>

      <h1 className="text-3xl font-bold mb-4 w-full">
        {currentCategory ? `${currentCategory.name}` : "Our Collection"}
      </h1>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-6 w-full">
        <Button id="filter-toggle-btn" variant="outline" className="w-full flex items-center justify-center">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters{" "}
          {activeFilterCount > 0 && (
            <span className="ml-1 bg-[#00563F] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Mobile Filter Overlay */}
      <div id="filter-overlay" className="fixed inset-0 bg-black bg-opacity-50 z-40 hidden lg:hidden"></div>

      {/* Mobile Filter Sidebar */}
      <div
        id="filter-sidebar"
        className="fixed inset-y-0 left-0 max-w-[85vw] w-full bg-white shadow-xl z-50 transform -translate-x-full transition-transform duration-300 ease-in-out lg:hidden overflow-auto"
      >
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium flex items-center">
              <Filter className="mr-2 h-5 w-5 text-[#00563F]" />
              Filters
            </h2>
            <button id="filter-close-btn" className="text-gray-500 hover:text-gray-700 p-2">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 pb-24">
          {/* Categories Filter */}
          <div className="mb-6 border-b pb-6">
            <h3 className="font-semibold mb-3">Categories</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Link
                  href="/products"
                  className={`text-sm ${!currentCategoryId ? "font-medium text-[#00563F]" : "text-gray-700 hover:text-[#00563F]"}`}
                >
                  All Products
                </Link>
              </div>
              {categories.map((category) => (
                <div key={category.id} className="flex items-center">
                  <Link
                    href={`/products?category=${category.id}${currentSort ? `&sort=${currentSort}` : ""}`}
                    className={`text-sm ${currentCategoryId === category.id.toString() ? "font-medium text-[#00563F]" : "text-gray-700 hover:text-[#00563F]"}`}
                  >
                    {category.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6 border-b pb-6">
            <h3 className="font-semibold mb-3">Price Range</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">£{currentMinPrice}</span>
                <span className="text-sm">£{currentMaxPrice}</span>
              </div>
              <div className="px-2">
                {/* This is just a visual representation since we can't use client components here */}
                <div className="h-2 bg-gray-200 rounded-full relative">
                  <div
                    className="absolute h-2 bg-[#00563F] rounded-full"
                    style={{
                      left: `${(currentMinPrice / 10000) * 100}%`,
                      right: `${100 - (currentMaxPrice / 10000) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/products?${currentCategoryId ? `category=${currentCategoryId}&` : ""}${currentCondition ? `condition=${currentCondition}&` : ""}minPrice=0&maxPrice=100${currentSort ? `&sort=${currentSort}` : ""}`}
                  className="text-xs px-3 py-1 border rounded-full hover:bg-gray-50"
                >
                  Under £100
                </Link>
                <Link
                  href={`/products?${currentCategoryId ? `category=${currentCategoryId}&` : ""}${currentCondition ? `condition=${currentCondition}&` : ""}minPrice=100&maxPrice=500${currentSort ? `&sort=${currentSort}` : ""}`}
                  className="text-xs px-3 py-1 border rounded-full hover:bg-gray-50"
                >
                  £100-£500
                </Link>
                <Link
                  href={`/products?${currentCategoryId ? `category=${currentCategoryId}&` : ""}${currentCondition ? `condition=${currentCondition}&` : ""}minPrice=500&maxPrice=10000${currentSort ? `&sort=${currentSort}` : ""}`}
                  className="text-xs px-3 py-1 border rounded-full hover:bg-gray-50"
                >
                  £500+
                </Link>
              </div>
            </div>
          </div>

          {/* Condition Filter */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Condition</h3>
            <div className="space-y-2">
              {["Excellent", "Good", "Fair", "Needs Restoration"].map((condition) => (
                <div key={condition} className="flex items-center">
                  <Link
                    href={`/products?${currentCategoryId ? `category=${currentCategoryId}&` : ""}${currentMinPrice > 0 ? `minPrice=${currentMinPrice}&` : ""}${currentMaxPrice < 10000 ? `maxPrice=${currentMaxPrice}&` : ""}condition=${condition}${currentSort ? `&sort=${currentSort}` : ""}`}
                    className={`text-sm ${currentCondition === condition ? "font-medium text-[#00563F]" : "text-gray-700 hover:text-[#00563F]"}`}
                  >
                    {condition}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <div className="mt-6">
              <Link
                href="/products"
                className="w-full block text-center py-2 px-4 border border-red-500 text-red-500 rounded hover:bg-red-50"
              >
                Clear All Filters
              </Link>
            </div>
          )}
        </div>

        {/* Add a fixed bottom bar with apply button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <Link
            href="/products"
            className={`w-full block text-center py-3 px-4 bg-[#00563F] text-white rounded-md ${
              activeFilterCount === 0 ? "opacity-50" : ""
            }`}
          >
            {activeFilterCount > 0 ? `Apply Filters (${activeFilterCount})` : "View All Products"}
          </Link>
        </div>
      </div>

      {/* Desktop Filters Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile filter toggle button is already in place above */}

        {/* Desktop Filters Sidebar - hidden on mobile */}
        <div className="hidden lg:block lg:w-1/4">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            {/* Existing filter content remains the same */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Filter className="mr-2 h-5 w-5 text-[#00563F]" />
                Filters
              </h2>
              {activeFilterCount > 0 && (
                <Link href="/products" className="text-sm text-red-600 hover:text-red-800 flex items-center">
                  <X size={14} className="mr-1" />
                  Clear All
                </Link>
              )}
            </div>

            {/* Categories Filter */}
            <div className="mb-6 border-b pb-6">
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Link
                    href="/products"
                    className={`text-sm ${!currentCategoryId ? "font-medium text-[#00563F]" : "text-gray-700 hover:text-[#00563F]"}`}
                  >
                    All Products
                  </Link>
                </div>
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <Link
                      href={`/products?category=${category.id}${currentSort ? `&sort=${currentSort}` : ""}`}
                      className={`text-sm ${currentCategoryId === category.id.toString() ? "font-medium text-[#00563F]" : "text-gray-700 hover:text-[#00563F]"}`}
                    >
                      {category.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6 border-b pb-6">
              <h3 className="font-semibold mb-3">Price Range</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">£{currentMinPrice}</span>
                  <span className="text-sm">£{currentMaxPrice}</span>
                </div>
                <div className="px-2">
                  {/* This is just a visual representation since we can't use client components here */}
                  <div className="h-2 bg-gray-200 rounded-full relative">
                    <div
                      className="absolute h-2 bg-[#00563F] rounded-full"
                      style={{
                        left: `${(currentMinPrice / 10000) * 100}%`,
                        right: `${100 - (currentMaxPrice / 10000) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/products?${currentCategoryId ? `category=${currentCategoryId}&` : ""}${currentCondition ? `condition=${currentCondition}&` : ""}minPrice=0&maxPrice=100${currentSort ? `&sort=${currentSort}` : ""}`}
                    className="text-xs px-3 py-1 border rounded-full hover:bg-gray-50"
                  >
                    Under £100
                  </Link>
                  <Link
                    href={`/products?${currentCategoryId ? `category=${currentCategoryId}&` : ""}${currentCondition ? `condition=${currentCondition}&` : ""}minPrice=100&maxPrice=500${currentSort ? `&sort=${currentSort}` : ""}`}
                    className="text-xs px-3 py-1 border rounded-full hover:bg-gray-50"
                  >
                    £100-£500
                  </Link>
                  <Link
                    href={`/products?${currentCategoryId ? `category=${currentCategoryId}&` : ""}${currentCondition ? `condition=${currentCondition}&` : ""}minPrice=500&maxPrice=10000${currentSort ? `&sort=${currentSort}` : ""}`}
                    className="text-xs px-3 py-1 border rounded-full hover:bg-gray-50"
                  >
                    £500+
                  </Link>
                </div>
              </div>
            </div>

            {/* Condition Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Condition</h3>
              <div className="space-y-2">
                {["Excellent", "Good", "Fair", "Needs Restoration"].map((condition) => (
                  <div key={condition} className="flex items-center">
                    <Link
                      href={`/products?${currentCategoryId ? `category=${currentCategoryId}&` : ""}${currentMinPrice > 0 ? `minPrice=${currentMinPrice}&` : ""}${currentMaxPrice < 10000 ? `maxPrice=${currentMaxPrice}&` : ""}condition=${condition}${currentSort ? `&sort=${currentSort}` : ""}`}
                      className={`text-sm ${currentCondition === condition ? "font-medium text-[#00563F]" : "text-gray-700 hover:text-[#00563F]"}`}
                    >
                      {condition}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid - full width on mobile */}
        <div className="w-full lg:w-3/4">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <p className="text-gray-600 mb-2 sm:mb-0">
                {totalCount} products {currentCategory ? `in ${currentCategory.name}` : ""}
                {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
              </p>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Sort by:</span>
                <select id="sort-select" className="border rounded-md p-1 text-sm" defaultValue={currentSort}>
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="aspect-square relative overflow-hidden group">
                      <img
                        src={
                          product.image ||
                          `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(product.name) || "/placeholder.svg"}`
                        }
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    </div>
                    <CardContent className="p-2 sm:p-4">
                      <div className="mb-1">
                        <span className="text-xs text-gray-500">{product.categories?.name || "Uncategorized"}</span>
                      </div>
                      <h3 className="font-semibold text-sm sm:text-lg mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-[#00563F] font-medium text-sm sm:text-lg mb-1 sm:mb-3">£{product.price}</p>
                      {product.condition && (
                        <p className="text-xs text-gray-600 mb-1 sm:mb-3 hidden xs:block">
                          Condition: {product.condition}
                        </p>
                      )}
                      <div className="mt-2">
                        <Button
                          asChild
                          className="w-full bg-[#00563F] hover:bg-[#00563F]/90 text-xs sm:text-base py-1 sm:py-2"
                        >
                          <Link href={`/products/${product.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">No products match your current filters.</p>
                <Button asChild>
                  <Link href="/products">Clear Filters</Link>
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-1 md:space-x-2">
                <Link
                  href={getPaginationUrl(Math.max(1, currentPage - 1))}
                  className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border ${
                    currentPage === 1
                      ? "text-gray-400 border-gray-200 cursor-not-allowed"
                      : "text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  aria-disabled={currentPage === 1}
                  tabIndex={currentPage === 1 ? -1 : undefined}
                >
                  <ChevronLeft size={16} />
                </Link>

                {/* Page numbers - simplified for mobile */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // On mobile, show fewer pages
                    if (window.innerWidth < 640) {
                      return page === 1 || page === totalPages || page === currentPage
                    }
                    // On desktop, show more pages
                    return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)
                  })
                  .map((page, index, array) => {
                    // Add ellipsis where needed
                    const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1
                    const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1

                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsisBefore && <span className="w-6 md:w-10 text-center text-gray-500">...</span>}

                        <Link
                          href={getPaginationUrl(page)}
                          className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border ${
                            currentPage === page
                              ? "bg-[#00563F] text-white border-[#00563F]"
                              : "text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                          aria-current={currentPage === page ? "page" : undefined}
                        >
                          {page}
                        </Link>

                        {showEllipsisAfter && <span className="w-6 md:w-10 text-center text-gray-500">...</span>}
                      </div>
                    )
                  })}

                <Link
                  href={getPaginationUrl(Math.min(totalPages, currentPage + 1))}
                  className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border ${
                    currentPage === totalPages
                      ? "text-gray-400 border-gray-200 cursor-not-allowed"
                      : "text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  aria-disabled={currentPage === totalPages}
                  tabIndex={currentPage === totalPages ? -1 : undefined}
                >
                  <ChevronRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
