"use client"

import { useState, useEffect } from "react"
import { notFound, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ProductPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [allImages, setAllImages] = useState<string[]>([])
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    // Check for success messages in URL
    const quoteSuccess = searchParams.get("quote") === "success"
    const contactSuccess = searchParams.get("contact") === "success"

    if (quoteSuccess) {
      setSuccessMessage("Your quote request has been sent successfully! We will get back to you soon.")
      setShowSuccessAlert(true)
    } else if (contactSuccess) {
      setSuccessMessage("Your message has been sent successfully! We will get back to you soon.")
      setShowSuccessAlert(true)
    }

    // Hide success message after 5 seconds
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [searchParams, showSuccessAlert])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Fetch the product
        const { data: product, error } = await supabase.from("products").select("*").eq("id", params.id).single()

        if (error) {
          console.error("Error fetching product:", error)
          return
        }

        setProduct(product)

        // Prepare all images (main image + additional images)
        const images: string[] = []

        // Add main image if it exists
        if (product.image) {
          images.push(product.image)
        }

        // Add additional images if they exist
        if (product.additional_images && Array.isArray(product.additional_images)) {
          product.additional_images.forEach((img: string) => {
            if (img) images.push(img)
          })
        }

        setAllImages(images)
        console.log("All images:", images)

        // Fetch category if category_id exists
        if (product.category_id) {
          const { data: category } = await supabase
            .from("categories")
            .select("name, slug")
            .eq("id", product.category_id)
            .single()

          if (category) {
            setProduct((prev) => ({ ...prev, categories: category }))
          }
        }

        // Fetch era if era_id exists
        if (product.era_id) {
          const { data: era } = await supabase
            .from("eras")
            .select("name, description")
            .eq("id", product.era_id)
            .single()

          if (era) {
            setProduct((prev) => ({ ...prev, era }))
          }
        }

        // Fetch related products
        if (product.category_id) {
          const { data: related } = await supabase
            .from("products")
            .select("id, name, price, image")
            .eq("category_id", product.category_id)
            .neq("id", params.id)
            .limit(4)

          setRelatedProducts(related || [])
        }
      } catch (error) {
        console.error("Error in fetchProduct:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!product) {
    notFound()
  }

  // Build breadcrumb path
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/products" },
  ]

  if (product.categories) {
    breadcrumbs.push({
      name: product.categories.name,
      href: `/categories/${product.categories.slug}`,
    })
  }

  breadcrumbs.push({ name: product.name, href: `/products/${product.id}` })

  // Handle image navigation
  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  const selectImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Alert */}
      {showSuccessAlert && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Breadcrumbs */}
      <nav className="flex text-sm text-gray-500 mb-8">
        {breadcrumbs.map((breadcrumb, index) => (
          <div key={breadcrumb.href} className="flex items-center">
            {index > 0 && <span className="mx-2">/</span>}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium text-gray-900">{breadcrumb.name}</span>
            ) : (
              <Link href={breadcrumb.href} className="hover:text-[#00563F]">
                {breadcrumb.name}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
            <img
              src={
                allImages[currentImageIndex] ||
                `/placeholder.svg?height=600&width=600&text=${encodeURIComponent(product.name) || "/placeholder.svg"}`
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />

            {allImages.length > 1 && (
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
          {allImages.length > 1 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Product Images</h3>
                <p className="text-sm text-gray-500">
                  {currentImageIndex + 1} of {allImages.length}
                </p>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((img, index) => (
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
                    <img
                      src={img || `/placeholder.svg?height=100&width=100`}
                      alt={`${product.name} - view ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-xl md:text-2xl font-bold text-[#00563F] mb-6">£{product.price}</p>

          {product.description && <p className="text-gray-700 mb-8">{product.description}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
            <div>
              <h3 className="font-semibold mb-1">Category</h3>
              <p className="text-gray-700">{product.categories?.name || "Uncategorized"}</p>
            </div>

            {product.era && (
              <div>
                <h3 className="font-semibold mb-1">Era</h3>
                <p className="text-gray-700">{product.era.name}</p>
              </div>
            )}

            {product.condition && (
              <div>
                <h3 className="font-semibold mb-1">Condition</h3>
                <p className="text-gray-700">{product.condition}</p>
              </div>
            )}

            {product.dimensions && (
              <div>
                <h3 className="font-semibold mb-1">Dimensions</h3>
                <p className="text-gray-700">{product.dimensions}</p>
              </div>
            )}
          </div>

          <div className="space-y-3 md:space-y-4">
            <Link href={`/products/${product.id}/quote`} className="block">
              <Button className="w-full bg-[#00563F] hover:bg-[#00563F]/90 py-2 md:py-3 text-base">
                Request Quote
              </Button>
            </Link>
            <Link href={`/products/${product.id}/contact`} className="block">
              <Button
                variant="outline"
                className="w-full border-[#00563F] text-[#00563F] hover:bg-[#00563F]/10 py-2 md:py-3 text-base"
              >
                Contact About This Item
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Product Information Tabs */}
      <div className="mb-16">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start border-b rounded-none">
            <TabsTrigger
              value="description"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#00563F]"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#00563F]"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="delivery"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#00563F]"
            >
              Delivery
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="pt-6">
            <p className="text-gray-700">
              {product.description ||
                `This beautiful piece showcases the craftsmanship and attention to detail typical of the ${product.era?.name || "period"} era. 
                The rich wood has developed a wonderful patina over time, and the original features add authentic character.`}
            </p>
          </TabsContent>
          <TabsContent value="details" className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.categories?.name && (
                  <div>
                    <h3 className="font-semibold">Category</h3>
                    <p className="text-gray-700">{product.categories.name}</p>
                  </div>
                )}
                {product.era && (
                  <div>
                    <h3 className="font-semibold">Era</h3>
                    <p className="text-gray-700">{product.era.name}</p>
                  </div>
                )}
                {product.condition && (
                  <div>
                    <h3 className="font-semibold">Condition</h3>
                    <p className="text-gray-700">{product.condition}</p>
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <h3 className="font-semibold">Dimensions</h3>
                    <p className="text-gray-700">{product.dimensions}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="delivery" className="pt-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                We offer delivery services throughout the UK. International shipping is also available upon request.
              </p>
              <p className="text-gray-700">
                For a delivery quote, please use the "Request Quote" button above or contact us directly.
              </p>
              <p className="text-gray-700">Local pickup is available from our warehouse in Hull.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="bg-white rounded-lg overflow-hidden shadow">
                <div className="aspect-square relative">
                  <img
                    src={
                      relatedProduct.image ||
                      `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(relatedProduct.name) || "/placeholder.svg"}`
                    }
                    alt={relatedProduct.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{relatedProduct.name}</h3>
                  <p className="font-bold text-lg mb-4">£{relatedProduct.price}</p>
                  <Link
                    href={`/products/${relatedProduct.id}`}
                    className="block text-center bg-[#00563F] hover:bg-[#00563F]/90 text-white px-4 py-2 rounded"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
