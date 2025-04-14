"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Database, RefreshCw, Search, Plus, Image, Trash, Pencil } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"

export default function AdminDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [productCount, setProductCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)
  const [quoteRequestCount, setQuoteRequestCount] = useState(0)
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("products")
  const [searchTerm, setSearchTerm] = useState("")
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const savedAuth = localStorage.getItem("adminAuth")
      if (savedAuth === "true") {
        setIsAuthenticated(true)
        fetchData()
      } else {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    // Check for deleted=true in URL params
    if (searchParams.get("deleted") === "true") {
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
        variant: "default",
      })

      // Remove the parameter from the URL
      const url = new URL(window.location.href)
      url.searchParams.delete("deleted")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams])

  // Then update the fetchData function to be a useCallback
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch product count
      const { count: productCount, error: productError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })

      if (productError) throw productError
      setProductCount(productCount || 0)

      // Fetch message count - check if table exists first
      try {
        const { count: messageCount, error: messageError } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })

        if (!messageError) {
          setMessageCount(messageCount || 0)
        }
      } catch (error) {
        console.log("Messages table may not exist yet")
      }

      // Fetch quote request count - check if table exists first
      try {
        const { count: quoteCount, error: quoteError } = await supabase
          .from("quote_requests")
          .select("*", { count: "exact", head: true })

        if (!quoteError) {
          setQuoteRequestCount(quoteCount || 0)
        }
      } catch (error) {
        console.log("Quote requests table may not exist yet")
      }

      // Fetch products - without trying to join with categories
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (productsError) throw productsError

      // Fetch categories separately to avoid join issues
      const { data: categoriesData, error: categoriesError } = await supabase.from("categories").select("id, name")

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError)
        // Still set products even if categories fail
        setProducts(productsData || [])
      } else {
        // Create a map of category IDs to category names
        const categoriesMap = new Map()
        if (categoriesData) {
          categoriesData.forEach((category) => {
            categoriesMap.set(category.id, category.name)
          })
        }

        // Manually add category names to products
        const productsWithCategories =
          productsData?.map((product) => ({
            ...product,
            categoryName: categoriesMap.get(product.category_id) || "Uncategorized",
          })) || []

        setProducts(productsWithCategories)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "1579") {
      setIsAuthenticated(true)
      localStorage.setItem("adminAuth", "true")
      fetchData()
    } else {
      setError("Incorrect password")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("adminAuth")
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoryName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("products").delete().eq("id", productToDelete.id)

      if (error) throw error

      // Remove product from state
      setProducts(products.filter((p) => p.id !== productToDelete.id))
      setProductCount((prev) => prev - 1)

      // Show success message
      toast({
        title: "Product deleted",
        description: `${productToDelete.name} has been successfully deleted.`,
        variant: "default",
      })

      // Reset state
      setProductToDelete(null)
    } catch (error: any) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin mr-2">
          <RefreshCw size={24} />
        </div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Login</h1>
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md">
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              placeholder="Enter admin password"
            />
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </div>
          <Button type="submit" className="w-full bg-[#00563F]">
            Login
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="text-sm inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded min-h-[40px]"
          >
            View Website
          </Link>
          <Link
            href="/admin/db-setup"
            className="text-sm inline-block bg-[#00563F] hover:bg-[#00563F]/90 text-white px-3 py-1.5 rounded min-h-[40px]"
          >
            Database Setup
          </Link>
          <Link
            href="/admin/categories"
            className="text-sm inline-block bg-[#00563F] hover:bg-[#00563F]/90 text-white px-3 py-1.5 rounded min-h-[40px]"
          >
            Manage Categories
          </Link>
          <Button onClick={handleLogout} className="text-sm bg-red-500 hover:bg-red-600 min-h-[40px] px-3 py-1.5">
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm mb-1">Total Products</h2>
          <p className="text-3xl font-bold">{productCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm mb-1">Quote Requests</h2>
          <p className="text-3xl font-bold">{quoteRequestCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm mb-1">Messages</h2>
          <p className="text-3xl font-bold">{messageCount}</p>
        </div>
        {/* Website Visits card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm mb-1">Website Visits</h2>
          <p className="text-3xl font-bold">-</p>
          <p className="text-xs text-gray-500 mt-1">Google Analytics tracking enabled</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex items-center mb-4">
          <Database className="text-[#00563F] mr-2" />
          <h2 className="text-xl font-semibold">Database Usage</h2>
        </div>
        <p className="text-gray-600 mb-4">Storage usage for your antique warehouse database</p>

        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span>Storage Usage</span>
            <span>0%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-[#00563F] h-2.5 rounded-full" style={{ width: "0%" }}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Database className="text-[#00563F] mr-2 h-5 w-5" />
              <h3 className="font-semibold">Database Size</h3>
            </div>
            <p className="text-2xl font-bold">0.76 KB</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Image className="text-[#00563F] mr-2 h-5 w-5" />
              <h3 className="font-semibold">Total Images</h3>
            </div>
            <p className="text-2xl font-bold">5</p>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Using ImgBB for image storage helps keep database usage low</p>
        </div>
      </div>

      <div className="mb-8">
        <Tabs defaultValue="products" onValueChange={setActiveTab}>
          <TabsList className="border-b w-full justify-start">
            <TabsTrigger
              value="products"
              className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-[#00563F] data-[state=active]:text-[#00563F]"
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              value="quotes"
              className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-[#00563F] data-[state=active]:text-[#00563F]"
            >
              Quote Requests
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-[#00563F] data-[state=active]:text-[#00563F]"
            >
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="pt-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-64">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
                <Link
                  href="/admin/products/new"
                  className="inline-flex items-center bg-[#00563F] hover:bg-[#00563F]/90 text-white px-4 py-2 rounded"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Product
                </Link>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Product
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Category
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Price
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
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
                      {filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={product.image || "/placeholder.svg?height=40&width=40"}
                                  alt={product.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">
                                  Added on {new Date(product.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.categoryName || "Uncategorized"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">£{product.price}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              In Stock
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/admin/products/edit/${product.id}`}
                              className="text-[#00563F] hover:text-[#00563F]/80 mr-3 inline-flex items-center"
                            >
                              <Pencil size={16} className="mr-1" />
                              Edit
                            </Link>
                            <button
                              className="text-red-600 hover:text-red-900 inline-flex items-center"
                              onClick={() => setProductToDelete(product)}
                            >
                              <Trash size={16} className="mr-1" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? "No products match your search." : "No products available yet."}
                  </p>
                  <Link
                    href="/admin/products/new"
                    className="inline-flex items-center bg-[#00563F] hover:bg-[#00563F]/90 text-white px-4 py-2 rounded"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Product
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="quotes" className="pt-4">
            <div className="bg-white rounded-lg shadow p-6 text-center py-12">
              <p className="text-gray-500 mb-4">Quote requests will appear here.</p>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="pt-4">
            <div className="bg-white rounded-lg shadow p-6 text-center py-12">
              <p className="text-gray-500 mb-4">Messages from customers will appear here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Product Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              {productToDelete?.name && <strong> "{productToDelete.name}"</strong>} from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
