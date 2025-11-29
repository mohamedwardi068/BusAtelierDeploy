"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button.tsx"
import { Input } from "../components/ui/input.tsx"
import { Dialog } from "../components/ui/dialog.tsx"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog.tsx"
import { DialogDescription } from "@radix-ui/react-dialog"
import axios from "axios"
// Components
import HeaderSection from "../myCompoonents/HeaderSection"
import ProductForm from "../myCompoonents/ProductForm"
import ProductFilters from "../myCompoonents/ProductFilters"
import ProductList from "../myCompoonents/ProductList.js"
import FinishDialog from "../myCompoonents/FinishDialog"
import { useAuth } from "../hooks/useAuth.js"
import useReceptionApi from "../hooks/useReceptionApi.js"
import useClientsApi from "../hooks/useClientsApi.js"
import useEtriersApi from "../hooks/useEtriersApi.js"
import { toast } from "sonner"


export default function ReceptionPage() {
  const [clients, setClients] = useState([])
  const [etriers, setEtriers] = useState([])
  const [products, setProducts] = useState([])

  const [formData, setFormData] = useState({
    client: null,
    etrier: null,
    observation: "",
    receptionNumber: "",
    etat: "Reçu",
  });

  const [filters, setFilters] = useState({
    clientName: "",
    carModel: "",
    receptionNumber: "",
    etat: "all",
  })

  const [errors, setErrors] = useState({})
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [serialNumber, setSerialNumber] = useState("")

  const navigate = useNavigate()
  const { user } = useAuth()
  const { getAll, create, remove, updateEtat, updateExtra } = useReceptionApi()
  const { getClients } = useClientsApi()
  const { getEtriers } = useEtriersApi()

  const isAdmin = user?.role === "admin"

  // Position mapping English → French
  const positionMap = {
    FrontLeft: "avant gauche",
    FrontRight: "avant droit",
    RearLeft: "arrière gauche",
    RearRight: "arrière droit",
  }
  const openFinishDialogWithSerial = (product) => {
    setSelectedProductId(product.id);
    setSerialNumber(product.extra?.serialNumber || ""); // prefill from returned product
    setIsFinishDialogOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, etriersData, receptionsData] = await Promise.all([
          getClients(),
          getEtriers(),
          getAll(),
        ])

        setClients(clientsData)
        setEtriers(etriersData)
        // Fake API returns data directly, not wrapped in .data
        const dataArray = receptionsData.data || receptionsData;
        const normalized = dataArray.map((p) => ({
          ...p,
          id: p._id,
          isReturned: p.returnApproved || p.isReturned || false, // 👈 mark returned if backend provides a flag
        }))

        setProducts(normalized)
        localStorage.setItem("receptionProducts", JSON.stringify(normalized))


      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()

    const savedProducts = localStorage.getItem("receptionProducts")
    if (savedProducts && !products.length) {
      setProducts(JSON.parse(savedProducts))
    }
  }, [])

  const updateReceptionEtatAndSerial = async (id, serial) => {
    try {
      // Update status
      let updated = await updateEtat(id, "finit");

      // Update serial number if provided
      if (serial) {
        updated = await updateExtra(id, { serialNumber: serial });
      }

      return updated;
    } catch (error) {
      console.error("Error updating etat and serial:", error);
      throw error;
    }
  };


  const handleDeleteProduct = async (id) => {
    if (!id) return;
    try {
      await remove(id); // DELETE request to backend
      setProducts((prev) => prev.filter((p) => p.id !== id)); // Remove from UI state
      localStorage.setItem("receptionProducts", JSON.stringify(products.filter((p) => p.id !== id)));
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.client) {
      newErrors.client = "Le client est obligatoire.";
    }

    if (!formData.etrier) {
      newErrors.etrier = "L'étrier est obligatoire.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const rawPosition = formData.etrier?.position || formData.etrier?.positions?.[0];
    const mappedPosition = positionMap[rawPosition] || rawPosition;

    try {
      const payload = {
        client: formData.client._id,
        etrier: formData.etrier._id,
        user: user.id,
        observation: formData.observation,
        etat: "recus",
        position: mappedPosition,
      };

      const response = await create(payload);
      // Fake API returns data directly, not wrapped in .data
      const savedReception = response.data || response;

      const newProduct = {
        id: savedReception._id,
        client: formData.client,
        etrier: {
          ...formData.etrier,
          position: mappedPosition,
        },
        observation: savedReception.observation,
        receptionNumber: savedReception.receptionNumber,
        etat: savedReception.etat,
        date: savedReception.date,
      };

      setProducts((prev) => [...prev, newProduct]);
      localStorage.setItem("receptionProducts", JSON.stringify([...products, newProduct]));

      toast.success("✅ Produit ajouté avec succès");

      setFormData({
        client: clients[0],
        etrier: {
          ...etriers[0],
          position: positionMap[etriers[0]?.positions?.[0]] || etriers[0]?.positions?.[0],
        },
        observation: "",
        etat: "recus",
      });

      window.location.reload(); // 👈 still there
    } catch (error) {
      setErrors({
        api: error.response?.data?.error || "Failed to add reception",
      });

      toast.error("❌ Échec de l'ajout du produit");
    }
  };

  const markAsInProgress = async (id) => {
    if (!id) {
      console.error("❌ markAsInProgress called with undefined ID")
      return
    }

    try {
      const updatedProduct = await updateEtat(id, "en cours");

      const updated = products.map((p) =>
        p.id === id ? { ...p, etat: updatedProduct.etat } : p
      )

      setProducts(updated)
      localStorage.setItem("receptionProducts", JSON.stringify(updated))
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'état :", error)
    }
    // <== Refresh after update
  }

  const completeMarkAsFinished = async (id, serial) => {
    try {
      const updatedProduct = await updateReceptionEtatAndSerial(id, serial?.trim() || undefined);

      console.log("✅ Product marked as finished:", updatedProduct);

      const updated = products.map((p) =>
        p.id === id
          ? {
            ...p,
            etat: updatedProduct.etat,
            serialNumber: updatedProduct.extra?.serialNumber || serial?.trim() || "",
          }
          : p
      );

      setProducts(updated);
      localStorage.setItem("receptionProducts", JSON.stringify(updated));

      setIsFinishDialogOpen(false);
      setSelectedProductId(null);
      setSerialNumber("");

      const finalSerial = updatedProduct?.extra?.serialNumber || serial?.trim() || "—";
      toast.success(`✅ Produit marqué comme fini (N° série : ${finalSerial})`);
    } catch (error) {
      console.error("❌ Erreur dans completeMarkAsFinished:", error);
      toast.error("❌ Échec lors de la mise à jour du produit");
      alert("Erreur lors de la mise à jour du produit. Veuillez réessayer.");
    }
  };




  const markAsFinished = (id) => {
    setSelectedProductId(id);
    setSerialNumber(""); // empty or undefined to let backend handle it
    setIsFinishDialogOpen(true);
  };

  const openFinishDialog = (productId) => {
    setSelectedProductId(productId);
    setSerialNumber(""); // reset so dialog can recalc
    setIsFinishDialogOpen(true);
  };
  const filteredProducts = products.filter((product) => {
    const clientName = product.client?.name?.toLowerCase() || "";
    const etrierCarModel = product.etrier?.carModel?.toLowerCase() || "";
    const receptionNumber = product.receptionNumber?.toLowerCase() || "";
    const etat = product.etat?.toLowerCase();
    const isReturned = product.isReturned === true;

    // ❌ Hide normal finit products (not returned)
    if (etat === "finit" && !isReturned) return false;

    // ✅ Treat returned products as "en cours" for display purposes
    const displayEtat = isReturned ? "en cours" : etat;

    // ✅ Filters
    const matchesSearch =
      clientName.includes(filters.clientName.toLowerCase()) &&
      etrierCarModel.includes(filters.carModel.toLowerCase()) &&
      receptionNumber.includes(filters.receptionNumber.toLowerCase());

    if (filters.etat === "all") return matchesSearch;
    if (filters.etat === "retour") return matchesSearch && isReturned;

    return matchesSearch && displayEtat === filters.etat;
  });




  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="container mx-auto px-4 py-8 space-y-8 ">
        <HeaderSection />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 ">
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            errors={errors}
            staticClients={clients}
            setClients={setClients}
            staticEtriers={etriers}
            setEtriers={setEtriers}
            className="bg-gray-50 text-gray-800 font-sans shadow-md rounded-lg border border-blue-100"
          />

          <div className="space-y-6">
            <ProductFilters
              filters={filters}
              setFilters={setFilters}
              className="bg-blue-50 shadow-md rounded-lg border border-blue-100 p-4"
            />
            <ProductList
              products={filteredProducts}
              markAsInProgress={markAsInProgress}
              markAsFinished={markAsFinished}
              isAdmin={isAdmin}
              onOpenFinishDialog={openFinishDialog}          // existing
              onOpenFinishDialogWithSerial={openFinishDialogWithSerial} // new
              onDelete={handleDeleteProduct}
            />

            <FinishDialog
              isOpen={isFinishDialogOpen}
              setIsOpen={setIsFinishDialogOpen}
              serialNumber={serialNumber}
              setSerialNumber={setSerialNumber}
              selectedProductId={selectedProductId}
              onConfirm={completeMarkAsFinished}
              products={products}  // the full list for serial calculation
            />


          </div>
        </div>
      </div>
    </div>
  )
}
