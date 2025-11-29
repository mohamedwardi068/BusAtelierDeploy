import { User, Mail, Calendar, Shield } from "lucide-react"

export default function AccountInfoCard({ user }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-semibold text-blue-800 mb-3 sm:mb-4 flex items-center">
        <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
        Informations du compte
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
          <p className="text-sm sm:text-base text-gray-900 font-medium">{user.name}</p>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
            Rôle
          </label>
          <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {user.role || "Utilisateur"}
          </span>
        </div>
      </div>
    </div>
  )
}

