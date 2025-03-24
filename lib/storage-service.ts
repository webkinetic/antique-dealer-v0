import { getProductsFromDB, saveProductToDB } from "@/lib/db"

function safeLocalStorage(operation: "get" | "set", key: string, value?: string): string | null {
  try {
    if (typeof window === "undefined") {
      return operation === "get" ? null : null
    }

    if (operation === "get") {
      return localStorage.getItem(key)
    } else {
      localStorage.setItem(key, value!)
      return null
    }
  } catch (error) {
    console.error(`localStorage ${operation} error:`, error)
    return operation === "get" ? null : null
  }
}

export async function getProducts() {
  try {
    // Try to get products from the database first
    const dbProducts = await getProductsFromDB()
    if (dbProducts && dbProducts.length > 0) {
      // Update local storage with the database products for offline use
      safeLocalStorage("set", "antique-products", JSON.stringify(dbProducts))
      console.log("Successfully loaded products from database:", dbProducts.length)
      return dbProducts
    }
  } catch (error) {
    console.error("Error getting products from database:", error)
  }

  // Fallback to localStorage if database fails or returns no products
  const storedProducts = safeLocalStorage("get", "antique-products")
  if (!storedProducts) {
    return []
  }

  return JSON.parse(storedProducts)
}

export async function saveProducts(products: any[]) {
  try {
    // Try to save each product to the database
    const results = await Promise.all(
      products.map(async (product) => {
        try {
          const result = await saveProductToDB(product)
          if (!result.success) {
            console.warn("Warning: Failed to save product to database:", product.id)
          }
          return result.success
        } catch (dbError) {
          console.error("Error saving product to database:", dbError)
          return false
        }
      })
    )

    // Update localStorage
    safeLocalStorage("set", "antique-products", JSON.stringify(products))

    if (results.some((success) => !success)) {
      console.warn("Some products may not have been saved to the database. Local storage was updated successfully.")
    } else {
      console.log("All products saved successfully to database")
    }

    return true
  } catch (error) {
    console.error("Error saving products:", error)
    return false
  }
}
