"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Database, RefreshCw } from "lucide-react"

export default function DatabaseSetupPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("tables")
  const [status, setStatus] = useState<{ [key: string]: { success: boolean; message: string } }>({})

  useEffect(() => {
    const checkAuth = () => {
      const savedAuth = localStorage.getItem("adminAuth")
      if (savedAuth === "true") {
        setIsAuthenticated(true)
      } else {
        router.push("/admin")
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const createTables = async () => {
    setStatus((prev) => ({ ...prev, tables: { success: false, message: "Creating tables..." } }))

    try {
      // Create or update products table with additional_images column and featured column
      const { error: productsError } = await supabase.rpc("execute_sql", {
        sql_query: `
          ALTER TABLE IF EXISTS products 
          ADD COLUMN IF NOT EXISTS additional_images TEXT[];
          
          ALTER TABLE IF EXISTS products 
          ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
        `,
      })

      if (productsError) throw productsError

      setStatus((prev) => ({
        ...prev,
        tables: { success: true, message: "Tables updated successfully!" },
      }))
    } catch (error: any) {
      console.error("Error creating tables:", error)
      setStatus((prev) => ({
        ...prev,
        tables: { success: false, message: `Error: ${error.message}` },
      }))
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
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-500 mb-4">You need to be logged in to access this page</p>
        <Link href="/admin" className="text-[#00563F] hover:underline">
          Go to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Database Setup</h1>
        <Link
          href="/admin"
          className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex items-center mb-4">
          <Database className="text-[#00563F] mr-2" />
          <h2 className="text-xl font-semibold">Database Management</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Use these tools to set up and manage your database. Make sure to create the necessary tables before adding
          products.
        </p>

        <Tabs defaultValue="tables" onValueChange={setActiveTab}>
          <TabsList className="border-b w-full justify-start mb-6">
            <TabsTrigger
              value="tables"
              className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-[#00563F] data-[state=active]:text-[#00563F]"
            >
              Tables
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-[#00563F] data-[state=active]:text-[#00563F]"
            >
              Sample Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tables" className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Update Product Table</h3>
              <p className="text-sm text-gray-600 mb-4">
                This will add the additional_images column and featured column to the products table.
              </p>
              <Button
                onClick={createTables}
                className="bg-[#00563F] hover:bg-[#00563F]/90"
                disabled={status.tables?.success}
              >
                {status.tables?.success ? "Tables Updated" : "Update Tables"}
              </Button>
              {status.tables && (
                <p className={`mt-2 text-sm ${status.tables.success ? "text-green-600" : "text-red-600"}`}>
                  {status.tables.message}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Manage Data</h3>
              <p className="text-sm text-gray-600 mb-4">
                You can manage your data directly through the Supabase dashboard.
              </p>
              <Link
                href="https://app.supabase.com/project/pfhfdrlwkpdeugvepvnn/editor"
                target="_blank"
                className="inline-block bg-[#00563F] hover:bg-[#00563F]/90 text-white px-4 py-2 rounded"
              >
                Open Supabase Dashboard
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
