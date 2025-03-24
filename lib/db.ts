import { neon } from "@neondatabase/serverless"

export const sql = (() => {
  try {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      console.error("DATABASE_URL environment variable is not set")
      return new Proxy(
        {},
        {
          get: () => () => {
            throw new Error(
              "No database connection string was provided to `neon()`. " +
                "Please set the DATABASE_URL environment variable in your Vercel project settings."
            )
          },
        },
      ) as any
    }
    return neon(connectionString)
  } catch (error) {
    console.error("Error initializing database connection:", error)
    return new Proxy(
      {},
      {
        get: () => () => {
          throw error
        },
      },
    ) as any
  }
})()

export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`
    return { success: true, result }
  } catch (error) {
    console.error("Database connection error:", error)
    return { success: false, error }
  }
}

export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        dimensions TEXT,
        condition TEXT,
        era TEXT,
        details TEXT,
        is_available BOOLEAN DEFAULT TRUE,
        is_sold BOOLEAN DEFAULT FALSE,
        added TEXT NOT NULL,
        image TEXT,
        images TEXT[]
      )
    `
    return { success: true }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { success: false, error }
  }
}

export async function getProductsFromDB() {
  try {
    return await sql`SELECT * FROM products WHERE is_available = true ORDER BY added DESC`
  } catch (error) {
    console.error("Error getting products from database:", error)
    return []
  }
}

export async function saveProductToDB(product: any) {
  try {
    const result = await sql`
      INSERT INTO products (
        id, name, price, category, description, dimensions, condition, era, 
        details, is_available, is_sold, added, image, images
      ) VALUES (
        ${product.id}, ${product.name}, ${product.price}, ${product.category},
        ${product.description}, ${product.dimensions}, ${product.condition},
        ${product.era}, ${product.details}, ${product.is_available},
        ${product.is_sold}, ${product.added}, ${product.image},
        ${product.images}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        category = EXCLUDED.category,
        description = EXCLUDED.description,
        dimensions = EXCLUDED.dimensions,
        condition = EXCLUDED.condition,
        era = EXCLUDED.era,
        details = EXCLUDED.details,
        is_available = EXCLUDED.is_available,
        is_sold = EXCLUDED.is_sold,
        image = EXCLUDED.image,
        images = EXCLUDED.images
    `
    return { success: true, result }
  } catch (error) {
    console.error("Error saving product to database:", error)
    return { success: false, error }
  }
}
