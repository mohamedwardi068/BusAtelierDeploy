"use client"

import {
  Package,
  CheckCircle,
  BarChart3,
  Settings,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card.tsx"

export default function HomePage() {
  const navigate = useNavigate()
  // Changed default to false so that non-admin users won't see the settings button
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        if (payload.role === "admin") {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } catch (err) {
        console.error("Invalid token", err)
        setIsAdmin(false)
      }
    }
  }, [])

  const CardLink = ({ title, description, icon, bg, border, onClick }) => (
    <div
      onClick={onClick}
      className={`transform hover:scale-105 transition-transform duration-200 block cursor-pointer`}
    >
      <Card className={`h-full hover:shadow-md bg-blue-50 border border-blue-100 ${border}`}>
        <CardHeader className="text-center pb-4">
          <div className={`mx-auto mb-4 p-3 ${bg} rounded-full w-fit`}>
            {icon}
          </div>
          <CardTitle className="text-xl text-blue-800">{title}</CardTitle>
          <CardDescription className="text-gray-600">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-center text-gray-500">Cliquez pour gérer</p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto ">
          <CardLink
            title="Réception"
            description="Enregistrer les produits reçus"
            icon={<Package className="h-8 w-8 text-blue-600" />}
            bg="bg-blue-100"
            border="hover:border-blue-400 bg-gray-50 text-gray-800 font-sans"
            onClick={() => navigate("/reception")}
          />
          <CardLink
            title="Produits Finis"
            description="Consulter les produits terminés"
            icon={<CheckCircle className="h-8 w-8 text-green-600" />}
            bg="bg-green-100"
            border="hover:border-green-400 bg-gray-50 text-gray-800 font-sans"
            onClick={() => navigate("/produit-fini")}
          />
          <CardLink
            title="Récapitulatif"
            description="Rapports mensuels et synthèse"
            icon={<BarChart3 className="h-8 w-8 text-purple-600" />}
            bg="bg-purple-100"
            border="hover:border-purple-400 bg-gray-50 text-gray-800 font-sans"
            onClick={() => navigate("/recapitulatif")}
          />
        </div>
      </div>

      {isAdmin && (
        <>
          {/* Desktop Settings Shortcut */}
          <button
            onClick={() => navigate("/settings")}
            className="hidden md:flex fixed bottom-4 left-4 p-3 bg-blue-50 border border-blue-100 shadow-md rounded-full hover:bg-blue-100 transition-colors z-40"
            title="Paramètres"
          >
            <Settings className="h-5 w-5 text-blue-600" />
          </button>

          {/* Mobile Shortcut */}
          <div className="md:hidden fixed top-3 right-7 mr-5 z-50 flex gap-2">
            <button
              onClick={() => navigate("/settings")}
              className="p-2 bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 transition-colors"
              title="Paramètres"
            >
              <Settings className="h-6 w-6 text-blue-600" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
