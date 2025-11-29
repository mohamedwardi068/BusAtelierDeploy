// components/ProductTable.tsx
"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.tsx"
import { Input } from "../components/ui/input.tsx"
import { Pencil, Search } from "lucide-react"
import { useState } from "react"

export default function ProductTable({ products, onRowClick, onEditClick }) {
  const [searchFilters, setSearchFilters] = useState({
    reference: "",
    client: "",
    user: "",
  })

  const filtered = products.filter(p =>
    p.reference.toLowerCase().includes(searchFilters.reference.toLowerCase()) &&
    p.client.toLowerCase().includes(searchFilters.client.toLowerCase()) &&
    p.user.toLowerCase().includes(searchFilters.user.toLowerCase())
  )

  return (
    <div className="bg-white rounded-lg border border-blue-100 shadow-md p-4">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Produits Finis</h2>
      <Table>
        <TableHeader>
          <TableRow>
            {["Référence", "Client", "Date Reçu", "Date Finit", "Utilisateur"].map((label, i) => (
              <TableHead key={i}>{label}</TableHead>
            ))}
          </TableRow>
          <TableRow>
            {["reference", "client", "", "", "user"].map((key, i) => (
              <TableHead key={i}>
                {key && (
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      className="pl-8 w-full bg-blue-50 border border-gray-300 rounded-md"
                      placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                      value={searchFilters[key]}
                      onChange={(e) =>
                        setSearchFilters({ ...searchFilters, [key]: e.target.value })
                      }
                    />
                  </div>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((p) => (
            <TableRow key={p.id} onClick={() => onRowClick(p)} className="cursor-pointer hover:bg-blue-100 transition">
              <TableCell className="font-mono text-blue-600 font-semibold">
                <div className="flex justify-between items-center">
                  {p.reference}
                  <button
                    className="text-gray-400 hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditClick(p.id)
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
              <TableCell>{p.client}</TableCell>
              <TableCell>{p.dateRecu}</TableCell>
              <TableCell>{p.dateFinit}</TableCell>
              <TableCell>{p.user}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
