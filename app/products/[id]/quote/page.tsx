"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function RequestQuotePage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    deliveryAddress: "",
    additionalInfo: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return

      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, price, image")
          .eq("id", params.id)
          .single()

        if (error) throw error
        setProduct(data)
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const formElement = e.target as HTMLFormElement
      const formDataToSend = new FormData(formElement)

      // Add product information to the form data
      formDataToSend.append("product_name", product.name)
      formDataToSend.append("product_id", product.id)
      formDataToSend.append("product_price", product.price)

      const response = await fetch("https://formspree.io/f/xblgyeab", {
        method: "POST",
        body: formDataToSend,
        headers: {
          Accept: "application/json",
        },
      })

      if (response.ok) {
        setSuccess("Your quote request has been sent successfully! We will get back to you soon.")
        // Reset the form
        formElement.reset()
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          deliveryAddress: "",
          additionalInfo: "",
        })

        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/products/${params.id}?quote=success`)
        }, 2000)
      } else {
        const data = await response.json()
        throw new Error(data.error || "Something went wrong. Please try again.")
      }
    } catch (error: any) {
      console.error("Error submitting form:", error)
      setError(`Failed to submit quote request: ${error.message}`)
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

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-500 mb-4">Product not found</p>
        <Link href="/products" className="text-[#00563F] hover:underline">
          Return to Products
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Request a Quote</h1>

      <div className="mb-8">
        <Link href={`/products/${params.id}`} className="inline-flex items-center text-[#00563F] hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Product
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 mr-4">
            <img
              src={product.image || `/placeholder.svg?height=80&width=80&text=${encodeURIComponent(product.name)}`}
              alt={product.name}
              className="w-full h-full object-cover rounded"
            />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{product.name}</h2>
            <p className="text-[#00563F] font-bold">£{product.price}</p>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">{error}</div>}
      {success && <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <input type="hidden" name="product_name" value={product.name} />
        <input type="hidden" name="product_id" value={product.id} />
        <input type="hidden" name="product_price" value={product.price} />
        <input type="hidden" name="_subject" value={`Quote Request for ${product.name}`} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Input
              id="deliveryAddress"
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <Label htmlFor="additionalInfo">Additional Information</Label>
          <Textarea
            id="additionalInfo"
            name="additionalInfo"
            placeholder="Please include any specific requirements or questions about delivery."
            rows={5}
            value={formData.additionalInfo}
            onChange={handleChange}
          />
        </div>

        <Button type="submit" className="w-full bg-[#00563F] hover:bg-[#00563F]/90" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Submitting...
            </>
          ) : (
            "Request Quote"
          )}
        </Button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          By submitting this form, you agree to our Terms & Conditions. Your request will be sent directly to Kevin
          Marshall at kevinmarshall@antiquedealer.co.uk
        </p>
      </form>
    </div>
  )
}
