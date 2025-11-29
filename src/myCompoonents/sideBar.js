import { useState } from "react"
import { UserPlus, UserMinus, Trash2, LogOut, Menu, X, Home, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function Sidebar() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
const { logout } = useAuth();
  const links = [
    { label: "Ajouter un utilisateur", icon: UserPlus, to: "/settings/add-user" },
    { label: "Supprimer un utilisateur", icon: UserMinus, to: "/settings/delete-user" },
    {   label: 'Mon Compte',icon: Settings, to: "/settings/delete-account" },
  ]

 const handleLogout = () => {
    localStorage.removeItem("token")
   logout()
  }
    const handleHome = () => {
    
    navigate("/home")
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-screen w-64 bg-white border-r border-gray-200 shadow-md p-6 flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-blue-600 mb-6">Panneau d'administration</h2>
          <ul className="space-y-4">
            {links.map(({ label, icon: Icon, to }) => (
              <li key={to}>
                <button
                  onClick={() => navigate(to)}
                  className="w-full flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors text-sm font-medium"
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          {/* Home button */}
          <button
            onClick={() =>handleHome()}
            className="w-full flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors text-sm font-medium"
          >
            <Home className="h-5 w-5" />
            Accueil
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition-colors text-sm font-medium"
          >
            <LogOut className="h-5 w-5" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border rounded-md shadow-md"
      >
        <Menu className="h-6 w-6 text-blue-600" />
      </button>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:hidden p-6 flex flex-col justify-between`}
      >
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-blue-600">Panneau d'administration</h2>
            <button onClick={() => setOpen(false)}>
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          <ul className="space-y-4">
            {links.map(({ label, icon: Icon, to }) => (
              <li key={to}>
                <button
                  onClick={() => {
                    navigate(to)
                    setOpen(false)
                  }}
                  className="w-full flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors text-sm font-medium"
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          {/* Home button */}
          <button
            onClick={() => {
             handleHome()
              setOpen(false)
            }}
            className="w-full flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors text-sm font-medium"
          >
            <Home className="h-5 w-5" />
            Accueil
          </button>

          {/* Logout button */}
          <button
            onClick={() => {
              handleLogout()
              setOpen(false)
            }}
            className="w-full flex items-center gap-3 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition-colors text-sm font-medium"
          >
            <LogOut className="h-5 w-5" />
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  )
}
