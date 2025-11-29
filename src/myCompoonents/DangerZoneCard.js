import { AlertTriangle, Trash2 } from "lucide-react"

export default function DangerZoneCard({ onDelete }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-red-800 mb-3 sm:mb-4 flex items-center">
        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
        Zone dangereuse
      </h2>

      <div className="bg-white border border-red-200 rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-medium text-red-900">Supprimer mon compte</h3>
            <p className="text-xs sm:text-sm text-red-700 mt-1">
              Cette action est irréversible et supprimera définitivement toutes vos données.
            </p>
          </div>
          <button
            onClick={onDelete}
            className="bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-200 text-sm sm:text-base"
          >
            <Trash2 className="w-4 h-4 inline mr-2" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
