"use client"

import { useState, useEffect } from 'react'
import fakeApi from '../data/fakeData'

import {
  Trash2,
  Search,
  User,
  AlertTriangle,
  X,
  UserMinus,
} from 'lucide-react'
import { toast } from "sonner";
const DeletePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')

  const [users, setUsers] = useState([])
  // Simple function to decode JWT payload
  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch (e) {
      return null
    }
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const payload = parseJwt(token)
        const myUserId = payload?.id || payload?._id  // adapt based on your JWT structure

        const res = await fakeApi.users.getAll()

        // Exclude current logged-in user by id
        const filteredUsers = res.filter(user => user._id !== myUserId)
        setUsers(filteredUsers)
      } catch (err) {
        console.error("Erreur lors de la récupération des utilisateurs:", err)
      }
    }

    fetchUsers()
  }, [])


  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteUser = (user) => {
    setSelectedUser(user)
    setShowConfirmation(true)
    setConfirmationText('')
  }

  const confirmDeletion = async () => {
    if (confirmationText !== 'SUPPRIMER') return

    try {
      await fakeApi.users.delete(selectedUser._id)

      setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id))
      setShowConfirmation(false)
      setSelectedUser(null)
      setConfirmationText('')
      toast.success("✅ Utilisateur supprimé définitivement.", {
        duration: 3000,  // Duration in ms
        position: "top-right",
      }

      )
    } catch (err) {
      console.error("❌ Erreur lors de la suppression:", err)
      alert(err.message || "Erreur lors de la suppression")
    }
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center mb-8 gap-4">
          <UserMinus className="w-8 h-8 text-red-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">
            Supprimer définitivement
          </h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start sm:items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-1 sm:mt-0" />
            <p className="text-red-800 font-medium text-sm sm:text-base">
              Attention : La suppression définitive est irréversible. Toutes les
              données seront perdues.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <Search className="w-4 h-4 inline mr-2" />
            Rechercher un utilisateur
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            placeholder="Nom..."
          />
        </div>

        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-red-50 border border-red-100 rounded-lg p-4 sm:p-6 hover:bg-red-100 transition-colors duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.name}
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Aucun utilisateur trouvé pour "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">
                  Suppression définitive
                </h2>
              </div>
              <button
                onClick={() => setShowConfirmation(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm font-medium">
                ⚠️ Cette action est irréversible et supprimera définitivement
                toutes les données de l'utilisateur.
              </p>
            </div>

            <p className="text-gray-600 mb-4">
              Vous êtes sur le point de supprimer définitivement{' '}
              <strong>
                {selectedUser?.name}
              </strong>
              .
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tapez "SUPPRIMER" pour confirmer :
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                placeholder="SUPPRIMER"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={confirmDeletion}
                disabled={confirmationText !== 'SUPPRIMER'}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${confirmationText === 'SUPPRIMER'
                  ? 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Supprimer définitivement
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeletePage
