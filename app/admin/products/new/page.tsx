"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { uploadImage } from "@/lib/image-upload"
import { ArrowLeft, Loader2, X } from "lucide-react"

export default function NewProductPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [eras, setEras] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    images: [] as string[],
    category_id: "",
    era_id: "",
    condition: "",
    dimensions: "",
    featured: false,
  })
  const [error, setError] = useState("")

  useEffect(() => {
    const checkAuth = () => {
      const savedAuth = localStorage.getItem("adminAuth")
      if (savedAuth === "true") {
        setIsAuthenticated(true)
        fetchData()
      } else {
        router.push("/admin")
      }
    }

    checkAuth()
  }, [router])

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name")

      if (categoriesError) throw categoriesError
      setCategories(categoriesData || [])

      // Fetch eras
      try {
        const { data: erasData, error: erasError } = await supabase.from("eras").select("*").order("name")

        if (!erasError && erasData) {
          setEras(erasData)
        }
      } catch (error) {
        console.error("Error fetching eras (table might not exist yet):", error)
        // Continue without eras if the table doesn't exist
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const imageUrl = await uploadImage(file)

      if (imageUrl) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, imageUrl],
        }))
      }
    } catch (error: any) {
      console.error("Error uploading image:", error)
      setError(`Image upload failed: ${error.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Validate required fields
      if (!formData.name || !formData.price || !formData.category_id) {
        throw new Error("Name, price, and category are required")
      }

      // Convert price to number
      const price = Number.parseFloat(formData.price)
      if (isNaN(price)) {
        throw new Error("Price must be a valid number")
      }

      // Use the first image as the main image
      const mainImage = formData.images.length > 0 ? formData.images[0] : null
      const additionalImages = formData.images.length > 1 ? formData.images.slice(1) : []

      // Prepare product data
      const productData: any = {
        name: formData.name,
        description: formData.description,
        price: price,
        image: mainImage,
        additional_images: additionalImages,
        category_id: formData.category_id,
        condition: formData.condition,
        dimensions: formData.dimensions,
        featured: formData.featured,
      }

      // Only add era_id if it's selected and not empty
      if (formData.era_id) {
        productData.era_id = formData.era_id
      }

      // Insert product
      const { data, error } = await supabase.from("products").insert([productData]).select()

      if (error) throw error

      // Redirect to admin dashboard
      router.push("/admin")
    } catch (error: any) {
      console.error("Error adding product:", error)
      setError(`Failed to add product: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin mr-2">
          <Loader2 size={24} />
        </div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <Link
          href="/admin"
          className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {error && <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div>
                <Label htmlFor="price">Price (£) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleSelectChange("category_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {eras.length > 0 && (
                <div>
                  <Label htmlFor="era">Era</Label>
                  <Select value={formData.era_id} onValueChange={(value) => handleSelectChange("era_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an era" />
                    </SelectTrigger>
                    <SelectContent>
                      {eras.map((era) => (
                        <SelectItem key={era.id} value={era.id.toString()}>
                          {era.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select value={formData.condition} onValueChange={(value) => handleSelectChange("condition", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Excellent", "Good", "Fair", "Needs Restoration"].map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  name="dimensions"
                  placeholder="e.g. H: 80cm, W: 120cm, D: 45cm"
                  value={formData.dimensions}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleCheckboxChange("featured", checked as boolean)}
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Feature this product on homepage
                </Label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="image">Product Images</Label>
                <div className="mt-1 flex items-center">
                  <label className="block">
                    <span className="sr-only">Choose product image</span>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded file:border-0
                        file:text-sm file:font-semibold
                        file:bg-[#00563F] file:text-white
                        hover:file:bg-[#00563F]/90"
                    />
                  </label>
                </div>
                {uploadingImage && (
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Uploading image...
                  </div>
                )}

                {/* Image Gallery */}
                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">
                      {formData.images.length === 1 ? "1 image uploaded" : `${formData.images.length} images uploaded`}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <X size={16} />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-1 left-1 bg-[#00563F] text-white text-xs px-2 py-1 rounded">
                              Main Image
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-[#00563F] hover:bg-[#00563F]/90" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
