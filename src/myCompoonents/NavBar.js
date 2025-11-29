import {
  Home,
  PackageCheck,
  ListChecks,
  BarChart3,
  Menu,
  X,
  LogOut,
 
  Truck,
  Wrench,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { label: "Accueil", icon: Home, to: "/home" },
  { label: "Réception", icon: PackageCheck, to: "/reception" },
  { label: "Produits Finis", icon: ListChecks, to: "/produit-fini" },
  { label: "Récapitulatif", icon: BarChart3, to: "/recapitulatif" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  // Admin state from token payload
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setIsAdmin(payload.role === "admin");
      } catch (error) {
        console.error("Invalid token:", error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout();
  };

  // Add admin-only nav item dynamically
  const filteredNavItems = isAdmin
    ? [...navItems, { label: "Produits Livrés", icon: Truck, to: "/delivered-products" }]
    : navItems;

  return (
    <nav className="bg-gray-50 text-gray-800 font-sans sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <div className="bg-blue-600 p-2 rounded-lg">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-blue-700 leading-tight">
              ATELIER <span className="text-orange-500">MÉCANIQUE</span>
            </h1>
            <p className="text-xs text-gray-500 -mt-1">Gestion & Suivi</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-6 items-center">
          {filteredNavItems.map(({ label, icon: Icon, to }) => (
            <li key={to}>
              <button
                onClick={() => navigate(to)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === to
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-blue-600"
                  }`}
                type="button"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </li>
        </ul>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-md text-blue-600 hover:bg-blue-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
          <ul className="flex flex-col px-4 py-2 space-y-1">
            {filteredNavItems.map(({ label, icon: Icon, to }) => (
              <li key={to}>
                <button
                  onClick={() => {
                    navigate(to);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === to
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-blue-600"
                    }`}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                type="button"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
