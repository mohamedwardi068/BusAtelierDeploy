import { useState } from 'react'
import {
  Settings,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
} from 'lucide-react'
import AccountInfoCard from '../myCompoonents/AccountInfoCard'
import DangerZoneCard from '../myCompoonents/DangerZoneCard'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authcontext'
import { toast } from "sonner";
import fakeApi from '../data/fakeData';

export default function DeleteMyAccountPage() {
  const [showDeleteSection, setShowDeleteSection] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmationText, setConfirmationText] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)
  const { user, logout } = useAuth();

  const navigate = useNavigate() // Assuming you have a navigate function to redirect
  const handleDeleteAccount = () => {
    setShowDeleteSection(true)
  }

  const proceedToConfirmation = () => {
    if (password.length >= 6) {
      setStep(2)
      setShowConfirmation(true)
    }
  }
  const confirmDeletion = async () => {
    if (confirmationText === 'SUPPRIMER MON COMPTE' && password.length >= 6) {
      try {
        await fakeApi.users.delete(user.id);

        toast.success("Votre compte a été supprimé avec succès. Vous allez être déconnecté.",
          {
            duration: 3000,  // Duration in ms
            position: "top-right",
          }
        );
        resetDeletion();
        logout(); // ✅ Cleanly logout & navigate
      } catch (err) {
        console.error("Erreur suppression:", err);
        alert("Une erreur est survenue.");
      }
    }
  };


  const resetDeletion = () => {
    setShowDeleteSection(false)
    setShowConfirmation(false)
    setPassword('')
    setConfirmationText('')
    setStep(1)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
        <div className="flex items-center mb-6 sm:mb-8">
          <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-2 sm:mr-3" />
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">Mon Compte</h1>
        </div>


        {/* ✅ Render only if user is loaded */}
        {user && <AccountInfoCard user={user} />}


        <DangerZoneCard onDelete={handleDeleteAccount} />
      </div>

      {/* Delete Confirmation Modal (inline) */}
      {showDeleteSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            {step === 1 && (
              <>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 mr-2 sm:mr-3" />
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Supprimer mon compte</h2>
                  </div>
                  <button
                    onClick={resetDeletion}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className="text-red-800 text-xs sm:text-sm font-medium">
                    ⚠️ Cette action supprimera définitivement votre compte et toutes vos données. Cette action ne peut pas être annulée.
                  </p>
                </div>

                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Confirmez votre mot de passe pour continuer :
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm sm:text-base"
                      placeholder="Votre mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={proceedToConfirmation}
                    disabled={password.length < 6}
                    className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${password.length >= 6
                      ? 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    Continuer
                  </button>
                  <button
                    onClick={resetDeletion}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 text-sm sm:text-base"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}

            {step === 2 && showConfirmation && (
              <>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 mr-2 sm:mr-3" />
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Confirmation finale</h2>
                  </div>
                  <button
                    onClick={resetDeletion}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className="text-red-800 text-xs sm:text-sm font-medium">
                    🚨 DERNIÈRE ÉTAPE : Cette action est définitive et irréversible.
                  </p>
                </div>

                <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
                  Vous êtes sur le point de supprimer définitivement votre compte<strong>{user?.name}</strong>

                </p>

                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Tapez "SUPPRIMER MON COMPTE" pour confirmer :
                  </label>
                  <input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm sm:text-base"
                    placeholder="SUPPRIMER MON COMPTE"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={confirmDeletion}
                    disabled={confirmationText !== 'SUPPRIMER MON COMPTE'}
                    className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${confirmationText === 'SUPPRIMER MON COMPTE'
                      ? 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    Supprimer définitivement
                  </button>
                  <button
                    onClick={resetDeletion}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 text-sm sm:text-base"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
