// HeaderSection.jsx
import { Package } from "lucide-react"

export default function HeaderSection() {
  return (
    <div className="bg-transparent p-4 sm:p-6 rounded-lg shadow-md border border-blue-100">
      <div className="flex items-center gap-4">
        <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Réception de Produit
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Enregistrer la réception de nouveaux produits
          </p>
        </div>
      </div>
    </div>
  )
}
