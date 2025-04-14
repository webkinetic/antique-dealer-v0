import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Filter } from "lucide-react"

// Add this line at the top of the page component
export const revalidate = 0 // Disable cache for this route

// Function to fetch category by slug
async function getCategory(slug: string) {
  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).single()

  if (error) {
    console.error("Error fetching category:", error)
    return null
  }

  return data
}

// Update the getProductsByCategory function
async function getProductsByCategory(categoryId: number) {
  // Use server-side Supabase client
  const { createServerSupabaseClient } = await import("@/lib/supabase")
  const supabase = createServerSupabaseClient()

  // Fetch products without joining with categories or eras
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return products || []
}

// Function to fetch all categories
async function getCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data || []
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug)

  if (!category) {
    notFound()
  }

  const products = await getProductsByCategory(category.id)
  const categories = await getCategories()

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
      {category.description && <p className="text-gray-600 mb-8">{category.description}</p>}

      {/* Filters and Categories */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Mobile filter toggle */}
        <div className="md:hidden mb-6">
          <Button variant="outline" className="w-full flex items-center justify-center">
            <Filter className="mr-2 h-4 w-4" />
            Filter Products
          </Button>
        </div>

        {/* Sidebar filters - hidden on mobile by default */}
        <div className="hidden md:block md:w-1/4">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-700 hover:text-primary">
                  All Products
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className={cat.id === category.id ? "text-primary font-medium" : "text-gray-700 hover:text-primary"}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>

              <div className="space-y-6">
                {/* Condition Filter */}
                <div>
                  <h3 className="font-medium mb-2">Condition</h3>
                  <div className="space-y-2">
                    {["Excellent", "Good", "Fair", "Needs Restoration"].map((condition) => (
                      <div key={condition} className="flex items-center">
                        <input type="checkbox" id={`condition-${condition}`} className="mr-2" />
                        <label htmlFor={`condition-${condition}`}>{condition}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-medium mb-2">Price Range</h3>
                  <div className="space-y-2">
                    <input type="range" min="0" max="10000" className="w-full" />
                    <div className="flex justify-between">
                      <span>$0</span>
                      <span>$10,000+</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-6">Apply Filters</Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="md:w-3/4">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
            <p className="text-gray-600 text-sm">
              {products.length} products in {category.name}
            </p>
            <select className="border rounded-md p-2 text-sm">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
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
                  <CardContent className="p-2 sm:p-4">
                    <h3 className="font-semibold text-sm sm:text-lg mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-primary font-medium text-sm sm:text-lg">£{product.price}</p>
                    <div className="mt-2 sm:mt-4">
                      <Button asChild className="w-full text-xs sm:text-base py-1 sm:py-2">
                        <Link href={`/products/${product.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No products available in this category yet.</p>
              <Button asChild>
                <Link href="/products">View All Products</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
