import { Truck } from "lucide-react"

export default function DeliveredProductsHeader() {
  return (
    <div className="bg-transparent p-4 sm:p-6 rounded-lg shadow-md border border-blue-100 mb-6">
      <div className="flex items-center gap-4">
        <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Produits Livrés
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Liste des produits récemment livrés
          </p>
        </div>
      </div>
    </div>
  )
}
