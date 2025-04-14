"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, Search, ShoppingCart } from "lucide-react"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/products" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Directions", href: "/directions" },
]

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState("")

  // Set current path for active link styling
  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl md:text-2xl font-bold text-[#00563F] truncate">
              Kevin Marshall's Antique Warehouse
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-gray-700 hover:text-[#00563F] font-medium ${
                  currentPath === item.href ? "text-[#00563F] font-semibold" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search antiques..."
                className="w-64 p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00563F]"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <Link href="/cart" className="p-2 text-gray-700 hover:text-[#00563F] relative" aria-label="Cart">
              <ShoppingCart size={20} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-3 md:hidden">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 text-gray-700" aria-label="Search">
              <Search size={18} />
            </button>
            <Link href="/cart" className="p-2 text-gray-700 relative" aria-label="Cart">
              <ShoppingCart size={18} />
            </Link>
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="p-2 text-gray-700" aria-label="Open menu" onClick={() => setIsMenuOpen(true)}>
                  <Menu size={20} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] sm:w-[350px] p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <span className="text-lg font-semibold">Menu</span>
                    <button className="p-2 text-gray-700" aria-label="Close menu" onClick={() => setIsMenuOpen(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex flex-col space-y-5 p-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`text-gray-700 hover:text-[#00563F] text-lg font-medium ${
                          currentPath === item.href ? "text-[#00563F] font-semibold" : ""
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="mt-4 relative md:hidden">
            <input
              type="text"
              placeholder="Search antiques..."
              className="w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00563F]"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </nav>
    </header>
  )
}
