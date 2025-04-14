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
import { uploadImage } from "@/lib/image-upload"
import { ArrowLeft, Loader2, Pencil, Trash, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function CategoriesPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    slug: "",
    image: "",
  })
  const [editCategory, setEditCategory] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const savedAuth = localStorage.getItem("adminAuth")
      if (savedAuth === "true") {
        setIsAuthenticated(true)
        fetchCategories()
      } else {
        router.push("/admin")
      }
    }

    checkAuth()
  }, [router])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, isEdit = false) => {
    const { name, value } = e.target

    if (isEdit) {
      // For editing existing category
      setEditCategory((prev) => {
        // Auto-generate slug from name if editing name and slug is empty or matches the original name converted to slug
        if (
          name === "name" &&
          (!prev.slug ||
            prev.slug ===
              prev.name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""))
        ) {
          const slug = value
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
          return { ...prev, name: value, slug }
        } else {
          return { ...prev, [name]: value }
        }
      })
    } else {
      // For new category
      if (name === "name" && !newCategory.slug) {
        const slug = value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
        setNewCategory((prev) => ({ ...prev, name: value, slug }))
      } else {
        setNewCategory((prev) => ({ ...prev, [name]: value }))
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const imageUrl = await uploadImage(file)

      if (imageUrl) {
        if (isEdit) {
          setEditCategory((prev) => ({ ...prev, image: imageUrl }))
        } else {
          setNewCategory((prev) => ({ ...prev, image: imageUrl }))
        }
      }
    } catch (error: any) {
      console.error("Error uploading image:", error)
      setError(`Image upload failed: ${error.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      if (!newCategory.name || !newCategory.slug) {
        throw new Error("Name and slug are required")
      }

      // Check if slug already exists
      const { data: existingCategory } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", newCategory.slug)
        .single()

      if (existingCategory) {
        throw new Error("A category with this slug already exists")
      }

      // Insert new category
      const { data, error } = await supabase.from("categories").insert([newCategory]).select()

      if (error) throw error

      setSuccess("Category added successfully!")
      setNewCategory({
        name: "",
        description: "",
        slug: "",
        image: "",
      })
      fetchCategories()
    } catch (error: any) {
      console.error("Error adding category:", error)
      setError(`Failed to add category: ${error.message}`)
    }
  }

  const handleEdit = (category: any) => {
    setEditCategory({ ...category })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      if (!editCategory.name || !editCategory.slug) {
        throw new Error("Name and slug are required")
      }

      // Check if slug already exists and is not the current category
      const { data: existingCategory } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", editCategory.slug)
        .neq("id", editCategory.id)
        .single()

      if (existingCategory) {
        throw new Error("A category with this slug already exists")
      }

      // Update category
      const { error } = await supabase
        .from("categories")
        .update({
          name: editCategory.name,
          description: editCategory.description,
          slug: editCategory.slug,
          image: editCategory.image,
        })
        .eq("id", editCategory.id)

      if (error) throw error

      setSuccess("Category updated successfully!")
      setIsEditing(false)
      setDialogOpen(false)
      fetchCategories()
    } catch (error: any) {
      console.error("Error updating category:", error)
      setError(`Failed to update category: ${error.message}`)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id)

      if (error) throw error

      setSuccess("Category deleted successfully!")
      fetchCategories()
    } catch (error: any) {
      console.error("Error deleting category:", error)
      setError(`Failed to delete category: ${error.message}`)
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
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <Link
          href="/admin"
          className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {error && <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">{error}</div>}
      {success && <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>

            {categories.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Image
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Slug
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={
                                category.image ||
                                `/placeholder.svg?height=40&width=40&text=${encodeURIComponent(category.name)}`
                              }
                              alt={category.name}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{category.slug}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-[#00563F] hover:text-[#00563F]/80 mr-3"
                            onClick={() => handleEdit(category)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(category.id)}>
                            <Trash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No categories available yet.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Category</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input id="name" name="name" value={newCategory.name} onChange={handleChange} required />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" name="slug" value={newCategory.slug} onChange={handleChange} required />
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly version of the name (e.g., "antique-furniture")
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newCategory.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image">Category Image</Label>
                <div className="mt-1 flex items-center">
                  <label className="block w-full">
                    <span className="sr-only">Choose category image</span>
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
                {newCategory.image && (
                  <div className="mt-2">
                    <img
                      src={newCategory.image || "/placeholder.svg"}
                      alt="Category preview"
                      className="h-20 w-20 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full bg-[#00563F] hover:bg-[#00563F]/90">
                Add Category
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Make changes to the category details below.</DialogDescription>
          </DialogHeader>

          {editCategory && (
            <form onSubmit={handleUpdate} className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Category Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editCategory.name}
                  onChange={(e) => handleChange(e, true)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-slug">Slug *</Label>
                <Input
                  id="edit-slug"
                  name="slug"
                  value={editCategory.slug}
                  onChange={(e) => handleChange(e, true)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={editCategory.description || ""}
                  onChange={(e) => handleChange(e, true)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-image">Category Image</Label>
                <div className="mt-1 flex items-center">
                  <label className="block w-full">
                    <span className="sr-only">Choose category image</span>
                    <Input
                      id="edit-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
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
                {editCategory.image && (
                  <div className="mt-2 relative">
                    <img
                      src={editCategory.image || "/placeholder.svg"}
                      alt="Category preview"
                      className="h-20 w-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setEditCategory({ ...editCategory, image: "" })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#00563F]">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
