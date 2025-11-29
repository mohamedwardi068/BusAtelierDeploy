import { Outlet } from "react-router-dom"
import Sidebar from "../myCompoonents/sideBar.js"

export default function SettingsLayout() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 mt-16 md:mt-0">
        <Outlet />
      </main>
    </div>
  )
}
