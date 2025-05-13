import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { CategorySlider } from "@/components/category-slider"
import { FeaturedProducts } from "@/components/featured-products"

// Update the getFeaturedProducts function in app/page.tsx
async function getFeaturedProducts() {
  try {
    // Create a server-side Supabase client
    const { createServerSupabaseClient } = await import("@/lib/supabase")
    const supabase = createServerSupabaseClient()

    // Try to fetch featured products first
    try {
      const { data: featuredData, error: featuredError } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true)
        .limit(8) // Increased to 8 for scrollable desktop view

      // If successful, process the featured products
      if (!featuredError && featuredData && featuredData.length > 0) {
        // Fetch all categories separately
        const { data: categoriesData } = await supabase.from("categories").select("id, name, slug")

        // Create a map of category IDs to category objects
        const categoriesMap = new Map()
        if (categoriesData) {
          categoriesData.forEach((category) => {
            categoriesMap.set(category.id, category)
          })
        }

        // Manually add category info to products
        const productsWithCategories = featuredData.map((product) => ({
          ...product,
          categories: categoriesMap.get(product.category_id) || null,
        }))

        return productsWithCategories
      }
    } catch (featuredError) {
      console.error("Error fetching featured products:", featuredError)
      // Continue to fallback if featured column doesn't exist
    }

    // Fallback: If featured column doesn't exist or no featured products,
    // just get the most recent products
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8) // Increased to 8 for scrollable desktop view

    if (productsError) {
      console.error("Error fetching recent products:", productsError)
      return []
    }

    // Fetch all categories separately
    const { data: categoriesData } = await supabase.from("categories").select("id, name, slug")

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

    return productsWithCategories
  } catch (error) {
    console.error("Error in getFeaturedProducts:", error)
    return []
  }
}

// Add this line at the top of the page component
export const revalidate = 0 // Disable cache for this route

// Update the getCategories function in app/page.tsx
async function getCategories() {
  try {
    // Use server-side Supabase client to avoid caching issues
    const { createServerSupabaseClient } = await import("@/lib/supabase")
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("categories").select("*").order("name")

    if (error) {
      console.error("Error fetching categories:", error)
      return []
    }

    console.log("Fetched categories:", data?.length)
    return data || []
  } catch (error) {
    console.error("Error in getCategories:", error)
    return []
  }
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts()
  const categories = await getCategories()

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Hero Section with Contribution Box */}
      <section className="relative bg-gray-100 w-full">
        <div className="w-full">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test%20fred-RRd1aWRayjP1k3mAvfEQ4LH1W8LDAy.jpeg"
            alt="Antique Contribution Box"
            width={1920}
            height={800}
            className="w-full h-[300px] md:h-[500px] object-cover"
            priority
          />
        </div>
      </section>

      {/* Text and Buttons below Hero */}
      <section className="py-8 md:py-12 bg-white w-full">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-4xl font-serif italic text-[#00563F]/90 mb-4 md:mb-6 leading-relaxed">
              Discover unique antiques and vintage treasures at Hull's premier antique destination.
            </h1>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-4 md:mt-8">
              <Link
                href="/products"
                className="bg-[#00563F] hover:bg-[#00563F]/90 text-white px-4 md:px-8 py-2 md:py-3 rounded text-sm md:text-base"
              >
                Browse Collection
              </Link>
              <Link
                href="/contact"
                className="bg-white text-[#00563F] hover:bg-gray-100 px-4 md:px-8 py-2 md:py-3 rounded border border-[#00563F] text-sm md:text-base"
              >
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Categories */}
      <section className="py-8 md:py-16 w-full">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Browse Categories</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" className="rounded-full" id="category-prev">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" id="category-next">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <CategorySlider categories={categories} />
        </div>
      </section>

      {/* Featured Antiques */}
      <section className="py-8 md:py-16 bg-gray-50 w-full">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Antiques</h2>
            <Link href="/products" className="text-[#00563F] hover:underline text-sm md:text-base">
              View All
            </Link>
          </div>

          {/* Mobile Featured Products Slider */}
          <div className="block md:hidden">
            <div className="overflow-x-auto pb-4 -mx-4 px-4" id="featured-container">
              <div className="flex space-x-4 min-w-max">
                {featuredProducts.length > 0 ? (
                  featuredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow w-[260px]">
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
                        <h3 className="font-semibold text-base mb-1 line-clamp-1">{product.name}</h3>
                        <p className="text-gray-600 text-xs mb-1">{product.categories?.name || "Uncategorized"}</p>
                        <p className="font-bold text-base mb-3">£{product.price}</p>
                        <Link
                          href={`/products/${product.id}`}
                          className="block text-center bg-[#00563F] hover:bg-[#00563F]/90 text-white px-3 py-2 rounded text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white rounded-lg overflow-hidden shadow w-64">
                        <div className="aspect-square relative">
                          <img
                            src={`/placeholder.svg?height=300&width=300&text=Antique Item ${i}`}
                            alt={`Antique Item ${i}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-base mb-1">Antique Item {i}</h3>
                          <p className="font-bold text-base mb-2">£250</p>
                          <Link
                            href="/products"
                            className="block text-center bg-[#00563F] hover:bg-[#00563F]/90 text-white px-3 py-1.5 rounded text-sm"
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
          </div>

          {/* Desktop Featured Products Slider (instead of grid) */}
          <div className="hidden md:block">
            <FeaturedProducts products={featuredProducts} />
          </div>
        </div>
      </section>

      {/* About Kevin Marshall */}
      <section className="py-8 md:py-16 w-full">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <div className="w-full md:w-1/2">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2025-03-13.jpg-ngSI5HukaWBzkq2QOxqGjqhmruCQMY.jpeg"
                alt="Kevin Marshall's Antique Warehouse Storefront"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">About Kevin Marshall</h2>
              <p className="text-gray-700 mb-3 md:mb-4 text-sm md:text-base">
                With over 40 years of experience in the antiques trade, Kevin Marshall has established himself as one of
                Hull's most respected antique dealers.
              </p>
              <p className="text-gray-700 mb-4 md:mb-6 text-sm md:text-base">
                Each piece in our collection is personally sourced and selected by Kevin, ensuring authenticity,
                quality, and historical significance.
              </p>
              <Link
                href="/about"
                className="inline-block bg-[#00563F] hover:bg-[#00563F]/90 text-white px-4 md:px-6 py-1.5 md:py-2 rounded text-sm md:text-base"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-8 md:py-16 bg-[#00563F] text-white w-full">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-6">Looking for Something Special?</h2>
          <p className="text-base md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
            Contact us today to discuss your specific requirements or to request a quote for delivery.
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            <Link
              href="/contact"
              className="inline-block bg-white text-[#00563F] hover:bg-gray-100 px-4 md:px-8 py-2 md:py-3 rounded text-sm md:text-base"
            >
              Contact Us
            </Link>
            <Link
              href="/directions"
              className="inline-block border border-white text-white hover:bg-white/10 px-4 md:px-8 py-2 md:py-3 rounded text-sm md:text-base"
            >
              Get Directions
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
