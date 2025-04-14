"use client"

import { useEffect } from "react"

export default function MobileOptimizations() {
  useEffect(() => {
    // Fix for iOS 100vh issue
    const setVh = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty("--vh", `${vh}px`)
    }

    // Run optimizations
    setVh()

    // Update on resize
    window.addEventListener("resize", setVh)

    return () => {
      window.removeEventListener("resize", setVh)
    }
  }, [])

  return null
}
