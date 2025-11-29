import { PackageCheck } from "lucide-react"

export default function ProduitsFinisHeader() {
  return (
    <div className="bg-transparent p-4 sm:p-6 rounded-lg shadow-md border border-blue-100 mb-5">
      <div className="flex items-center gap-4">
        <PackageCheck className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Produits Finis
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Liste des produits terminés avec références automatiques
          </p>
        </div>
      </div>
    </div>
  )
}
