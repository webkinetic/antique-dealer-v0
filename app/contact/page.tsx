"use client"

import type React from "react"

import { useState } from "react"
import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean
    message?: string
  }>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const response = await fetch("https://formspree.io/f/xblgyeab", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })

      if (response.ok) {
        setSubmitStatus({
          success: true,
          message: "Your message has been sent successfully! We will get back to you soon.",
        })
        // Reset the form
        e.currentTarget.reset()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Something went wrong. Please try again.")
      }
    } catch (error: any) {
      setSubmitStatus({
        success: false,
        message: error.message || "Something went wrong. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-12">Contact Us</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Have a question about a specific item or need more information about our services?
          </h2>
          <p className="text-gray-700 mb-8">Fill out the form below and we'll get back to you as soon as possible.</p>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00563F] focus:border-[#00563F]"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00563F] focus:border-[#00563F]"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00563F] focus:border-[#00563F]"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00563F] focus:border-[#00563F]"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00563F] focus:border-[#00563F]"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#00563F] hover:bg-[#00563F]/90 text-white font-medium py-3 px-4 rounded-md transition duration-150 ease-in-out"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>

          {submitStatus.message && (
            <div
              className={`mt-6 p-4 rounded-md ${submitStatus.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
            >
              {submitStatus.message}
            </div>
          )}

          <p className="mt-6 text-sm text-gray-500">
            Your message will be sent directly to Kevin Marshall at kevinmarshall@antiquedealer.co.uk
          </p>
        </div>

        <div className="bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>

          <div className="space-y-6">
            <div className="flex items-start">
              <Phone className="text-[#00563F] mt-1 mr-4" size={20} />
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-gray-700">
                  <a href="tel:07803759820" className="hover:text-[#00563F]">
                    07803 759820
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Mail className="text-[#00563F] mt-1 mr-4" size={20} />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-gray-700">
                  <a href="mailto:kevinmarshall@antiquedealer.co.uk" className="hover:text-[#00563F]">
                    kevinmarshall@antiquedealer.co.uk
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="text-[#00563F] mt-1 mr-4" size={20} />
              <div>
                <h3 className="font-semibold">Address</h3>
                <address className="not-italic text-gray-700">
                  Kevin Marshall's Antique Warehouse
                  <br />
                  17-20A Wilton Street
                  <br />
                  Kingston upon Hull
                  <br />
                  United Kingdom
                </address>
                <Link href="/directions" className="text-[#00563F] hover:underline mt-2 inline-block">
                  Get Directions
                </Link>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="text-[#00563F] mt-1 mr-4" size={20} />
              <div>
                <h3 className="font-semibold">Opening Hours</h3>
                <div className="text-gray-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>10:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="text-[#00563F] mt-1 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Social Media</h3>
                <div className="flex space-x-4 mt-2">
                  <a
                    href="https://www.facebook.com/p/Kevin-Marshalls-Antiques-Warehouse-100028486466229/?locale=en_GB"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00563F] hover:text-[#00563F]/80"
                  >
                    <Facebook size={20} />
                  </a>
                  <a
                    href="https://www.instagram.com/kevin_marshall_antiquedealer/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00563F] hover:text-[#00563F]/80"
                  >
                    <Instagram size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
