import { Routes, Route } from "react-router-dom"

import Navbar from "./myCompoonents/NavBar"
import Login from "./myCompoonents/Login"

import HomePage from "./pages/home"
import ReceptionPage from "./pages/ReceptionPage.js"

import ProduitFiniPage from "./pages/produitFinis.js"
import { Toaster } from "sonner"


import SettingsLayout from "./pages/settings"

import DeleteUserPage from "./pages/DeleteUserPage.js"
import DeleteMyAccountPage from "./pages/DeleteMyAccountPage.js"
import "./index.css"
import AddUserForm from "./pages/AddUserPage.js"
import RecapitulatifPage from "./pages/RecapitulatifPage.js"
import DeliveredProductsPage from "./pages/DeliveredProductsPage.js"
export default function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />

        {/* All main routes with navbar */}
        <Route path="/home" element={<><Navbar /><HomePage /></>} />
        <Route path="/reception" element={<><Navbar /><ReceptionPage /></>} />
        <Route path="/produit-fini" element={<><Navbar /><ProduitFiniPage /></>} />
        <Route path="/recapitulatif" element={<><Navbar /><RecapitulatifPage /></>} />
        <Route path="/delivered-products" element={<><Navbar /><DeliveredProductsPage /></>} />
        {/* Settings layout */}
        <Route path="/settings" element={<SettingsLayout />}>
          {/* This one loads by default when visiting /settings */}
          <Route index element={<AddUserForm />} />
          <Route path="add-user" element={<AddUserForm />} />
          <Route path="delete-user" element={<DeleteUserPage />} />
          <Route path="delete-account" element={<DeleteMyAccountPage />} />
        </Route>
      </Routes></>
  )
}
