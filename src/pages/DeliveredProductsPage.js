import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.tsx";
import { Input } from "../components/ui/input.tsx";
import { Button } from "../components/ui/button.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.tsx";
import { Search, Calendar, Hash, ChevronLeft, ChevronRight, RotateCcw, RotateCw } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog.tsx"
import DeliveredProductsHeader from "../myCompoonents/DeliveredProductsHeader.js";
const DeliveredProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [returnProductId, setReturnProductId] = useState(null);
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);
  const [returnReason, setReturnReason] = useState(""); // Optional, if reason is needed
  const [isAdmin, setIsAdmin] = useState(false); // Assume you have logic to detect admin
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // Filters
  const [searchFilters, setSearchFilters] = useState({
    reference: "",
    client: "",
    user: "",
    dateRecuFrom: "",
    dateRecuTo: "",
    dateFinitFrom: "",
    dateFinitTo: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const handleCompleteReturn = async () => {
    if (!returnProductId) return;

    setIsProcessingReturn(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      // For non-admins: First submit the request
      if (!isAdmin) {
        if (!returnReason.trim()) {
          alert("Please enter a return reason");
          return;
        }
        await axios.post(
          `http://localhost:5000/api/receptions/${returnProductId}/request-return`,
          { reason: returnReason },
          config
        );
      }

      // For admins or after request is submitted: Approve and complete
      await axios.patch(
        `http://localhost:5000/api/receptions/${returnProductId}/approve-return`,
        {},
        config
      );

      await axios.post(
        `http://localhost:5000/api/receptions/${returnProductId}/complete-return`,
        {},
        config
      );

      alert("Return process completed successfully");
      // ❌ Removed fetchData(); ✅ We'll refresh the UI manually
      // Optionally remove product from local state:
      setProducts((prev) => prev.filter((p) => p.id !== returnProductId));
      setFilteredProducts((prev) => prev.filter((p) => p.id !== returnProductId));
    } catch (error) {
      console.error("Return process failed:", error);
      alert(`Return process failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsProcessingReturn(false);
      setIsReturnModalOpen(false);
      setReturnProductId(null);
      setReturnReason("");
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/receptions");
        const finishedProducts = response.data
          .filter((r) => ["finit", "returner"].includes(r.etat.toLowerCase()))
          .map((r) => ({
            id: r._id,
            reference: getSerialNumber(r.extra),
            client: r.client?.name || "-",
            user: r.user?.name || "-",
            dateRecu: formatDate(r.date),
            dateFinit: formatDate(r.updatedAt || Date.now()),
            delivered: r.delivered || false,
            etat: r.etat,
            isReturned: r.isReturned || false, // <-- add this line
            returnStatus: r.returnStatus || undefined, // optional, if you want
          }))
          .filter((p) => p.delivered === true);



        setProducts(finishedProducts);
        setFilteredProducts(finishedProducts);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Erreur de chargement des produits");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getSerialNumber = (extra) => {
    if (!extra) return "";
    return typeof extra.serialNumber === "string"
      ? extra.serialNumber
      : extra.serialNumber?.serialNumber || "";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  // Filtering logic
  useEffect(() => {
    let data = [...products];
    const { reference, client, user, dateRecuFrom, dateRecuTo, dateFinitFrom, dateFinitTo } = searchFilters;

    if (reference)
      data = data.filter((p) => p.reference.toLowerCase().includes(reference.toLowerCase()));
    if (client)
      data = data.filter((p) => p.client.toLowerCase().includes(client.toLowerCase()));
    if (user)
      data = data.filter((p) => p.user.toLowerCase().includes(user.toLowerCase()));

    if (dateRecuFrom)
      data = data.filter((p) => new Date(p.dateRecu.split("/").reverse().join("-")) >= new Date(dateRecuFrom));
    if (dateRecuTo)
      data = data.filter((p) => new Date(p.dateRecu.split("/").reverse().join("-")) <= new Date(dateRecuTo));
    if (dateFinitFrom)
      data = data.filter((p) => new Date(p.dateFinit.split("/").reverse().join("-")) >= new Date(dateFinitFrom));
    if (dateFinitTo)
      data = data.filter((p) => new Date(p.dateFinit.split("/").reverse().join("-")) <= new Date(dateFinitTo));

    setFilteredProducts(data);
    setCurrentPage(1);
  }, [searchFilters, products]);

  // Pagination logic
  const totalPages = useMemo(() => Math.ceil(filteredProducts.length / productsPerPage), [filteredProducts.length]);
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(startIndex, startIndex + productsPerPage);
  }, [currentPage, filteredProducts]);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Loading and error states
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <DeliveredProductsHeader/>
        {/* Filters */}
        <Card className="mb-6 border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg font-semibold text-gray-700">Filtres de recherche</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Text Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {["reference", "client", "user"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1 text-gray-600 capitalize">{field}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={`Rechercher par ${field}`}
                      value={searchFilters[field]}
                      onChange={(e) => setSearchFilters({ ...searchFilters, [field]: e.target.value })}
                      className="pl-9 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Date Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: "dateRecuFrom", label: "Date Reçu - De" },
                { key: "dateRecuTo", label: "Date Reçu - À" },
                { key: "dateFinitFrom", label: "Date Finit - De" },
                { key: "dateFinitTo", label: "Date Finit - À" },
              ].map((item) => (
                <div key={item.key}>
                  <label className="block text-sm font-medium mb-1 text-gray-600">{item.label}</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                      value={searchFilters[item.key]}
                      onChange={(e) => setSearchFilters({ ...searchFilters, [item.key]: e.target.value })}
                      className="pl-9 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="mb-6 border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-gray-700">Liste des Produits Livrés</CardTitle>
              <div className="text-sm text-gray-500">
                {filteredProducts.length} {filteredProducts.length === 1 ? "produit" : "produits"} trouvés
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-gray-600 font-medium">Référence</TableHead>
                    <TableHead className="text-gray-600 font-medium">Client</TableHead>
                    <TableHead className="text-gray-600 font-medium">Utilisateur</TableHead>
                    <TableHead className="text-gray-600 font-medium">Date Reçu</TableHead>
                    <TableHead className="text-gray-600 font-medium">Date Finit</TableHead>
                    <TableHead className="text-gray-600 font-medium text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.length > 0 ? (
                    currentProducts.map((p) => (
                      // In your TableRow component, add conditional styling:
                      <TableRow
                        key={p.id}
                        className={`hover:bg-gray-50 transition ${p.isReturned ? "bg-red-50" : ""}`}
                      >
                        <TableCell className="font-medium text-blue-600">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-blue-500" />
                            {p.reference}
                          </div>
                        </TableCell>
                        <TableCell>{p.client}</TableCell>
                        <TableCell>{p.user}</TableCell>
                        <TableCell>{p.dateRecu}</TableCell>
                        <TableCell>{p.dateFinit}</TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => {
                              if (!p.isReturned) {
                                setReturnProductId(p.id);
                                setIsReturnModalOpen(true);
                              }
                            }}
                            disabled={p.isReturned}
                            className={`p-2 rounded-full transition ${p.isReturned
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-blue-600 hover:bg-gray-200"
                              }`}
                            title={p.isReturned ? "Produit déjà retourné" : "Retourner le produit"}
                          >
                            <RotateCcw className="h-5 w-5" />
                          </button>
                        </TableCell>
                      </TableRow>

                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Aucun produit trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

            </div>

            {/* Pagination */}
            {filteredProducts.length > productsPerPage && (
              <div className="mt-6 flex justify-center items-center gap-4">
                <Button onClick={prevPage} disabled={currentPage === 1} variant="outline" size="sm" className="gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Précédent</span>
                </Button>

                <div className="text-sm text-gray-600 px-4 py-1 bg-gray-100 rounded-md">
                  Page {currentPage} sur {totalPages}
                </div>

                <Button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  <span>Suivant</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
        <DialogContent className="bg-white rounded-lg max-w-sm">
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-red-100 mb-4">
                <RotateCw className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-lg font-semibold text-gray-800">
                {isAdmin ? "Traiter le retour" : "Demander un retour"}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                {isAdmin
                  ? "Cela approuvera et complétera le retour immédiatement."
                  : "Veuillez indiquer la raison du retour."}
              </DialogDescription>
            </div>
          </DialogHeader>

          {!isAdmin && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raison du retour
              </label>
              <Input
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Entrez la raison du retour"
                className="w-full"
              />
            </div>
          )}

          <div className="flex justify-center gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsReturnModalOpen(false)}
              className="border-gray-300 hover:bg-gray-50 px-6"
              disabled={isProcessingReturn}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCompleteReturn}
              className="bg-red-600 hover:bg-red-700 shadow-sm px-6"
              disabled={isProcessingReturn || (!isAdmin && !returnReason.trim())}
            >
              {isProcessingReturn ? (
                <>
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                isAdmin ? "Finaliser le retour" : "Soumettre la demande"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveredProductsPage;
