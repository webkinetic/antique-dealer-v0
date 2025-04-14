import Link from "next/link"
import { OptimizedImage } from "./optimized-image"

interface Product {
  id: number
  name: string
  price: number
  image: string
  categories?: {
    name: string
  }
}

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow">
      <div className="aspect-square relative">
        <OptimizedImage
          src={
            product.image ||
            `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(product.name) || "/placeholder.svg"}`
          }
          alt={product.name}
          className="object-cover w-full h-full"
          priority={priority}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{product.categories?.name || "Uncategorized"}</p>
        <p className="font-bold text-lg mb-4">£{product.price}</p>
        <Link
          href={`/products/${product.id}`}
          className="block text-center bg-[#00563F] hover:bg-[#00563F]/90 text-white px-4 py-2 rounded"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
