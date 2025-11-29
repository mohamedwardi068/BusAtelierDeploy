import { useState, useEffect } from "react"
import fakeApi from "../data/fakeData"

export const useFinishedProducts = () => {
  const [products, setProducts] = useState([])
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    const fetch = async () => {
      try {
        const [receptionsData, piecesData] = await Promise.all([
          fakeApi.receptions.getAll(),
          fakeApi.pieces.getAll(),
        ])

        const finished = receptionsData
          .filter(r => r.etat.toLowerCase() === "finit")
          .map(r => ({
            id: r._id,
            reference: r.extra?.serialNumber || "",
            client: r.client?.name || "-",
            user: r.user?.name || "-",
            dateRecu: new Date(r.date).toLocaleDateString("fr-FR"),
            dateFinit: new Date().toLocaleDateString("fr-FR"),
            delivered: r.delivered || "no", // track delivered status here
            originalData: r,
          }))

        setProducts(finished)
        setPieces(piecesData)
      } catch (err) {
        console.error("Erreur de chargement :", err)
      }
    }

    fetch()
  }, [])

  // New function to mark delivered
  const markAsDelivered = async (id) => {
    try {
      const res = await fakeApi.receptions.markDelivered(id)
      // Update local state for that product
      setProducts(products.map(p =>
        p.id === id ? { ...p, delivered: 'yes', originalData: res } : p
      ))
    } catch (error) {
      console.error("Failed to mark delivered:", error)
      throw error
    }
  }

  return { products, setProducts, pieces, markAsDelivered }
}
