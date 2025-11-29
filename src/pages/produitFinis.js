"use client"

import axios from "axios"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.tsx"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table.tsx"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog.tsx"
import { Input } from "../components/ui/input.tsx"
import { Button } from "../components/ui/button.tsx"
import { RotateCw, CheckCircle, Calendar, Hash, Pencil, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "../context/authcontext.js"
import ProduitsFinisHeader from "../myCompoonents/ProduitsFinisHeader.js"
import { toast } from "sonner";
import { Trash2, Loader2 } from 'lucide-react';
import fakeApi from "../data/fakeData";
export default function ProduitFiniPage() {
  const [finishedProducts, setFinishedProducts] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [newReference, setNewReference] = useState("")
  const [searchFilters, setSearchFilters] = useState({
    reference: "",
    client: "",
    user: "",
    dateRecuFrom: "",
    dateRecuTo: "",
    dateFinitFrom: "",
    dateFinitTo: "",
  })
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [pieces, setPieces] = useState([])
  const [isExtrasDialogOpen, setIsExtrasDialogOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [isFactureDialogOpen, setIsFactureDialogOpen] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [returnProductId, setReturnProductId] = useState(null)
  const [returnReason, setReturnReason] = useState("")
  const [isProcessingReturn, setIsProcessingReturn] = useState(false)
  const [deletingIds, setDeletingIds] = useState([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 5

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);

  const openDeleteModal = (id) => {
    setDeleteProductId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteProductId(null);
  };

  const fetchData = async () => {
    console.log("Fetching data in ProduitFiniPage...");
    try {
      const [receptionsData, piecesData] = await Promise.all([
        fakeApi.receptions.getAll(),
        fakeApi.pieces.getAll(),
      ])
      console.log("Raw receptions data:", receptionsData);

      const finished = receptionsData
        .filter(r => {
          const isFinished = r.etat?.toLowerCase() === "finit";
          const isReturned = r.isReturned;
          console.log(`Reception ${r._id}: etat=${r.etat}, isReturned=${isReturned} -> keep=${isFinished || isReturned}`);
          return isFinished || isReturned;
        })
        .map(r => ({
          id: r._id,
          reference: typeof r.extra?.serialNumber === "string"
            ? r.extra.serialNumber
            : r.extra?.serialNumber?.serialNumber || "",
          client: r.client?.name || "-",
          user: r.user?.name || "-",
          dateRecu: new Date(r.date).toLocaleDateString("fr-FR"),
          dateFinit: new Date(r.updatedAt || Date.now()).toLocaleDateString("fr-FR"),
          etat: r.etat,
          delivered: r.delivered ? "yes" : "no",
          isReturned: r.isReturned,
          returnStatus: r.returnStatus || "-",
          originalData: r,
        }))

      console.log("Finished products after filter/map:", finished);

      setFinishedProducts(finished)
      setPieces(piecesData)
    } catch (err) {
      console.error("Erreur lors du chargement des données :", err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Sort products by status: finit first, then returner
  const sortedProducts = [...finishedProducts].sort((a, b) => {
    const orderA = a.isReturned ? 2 : 1;
    const orderB = b.isReturned ? 2 : 1;
    return orderA - orderB;
  })

  // Filter products based on search criteria AND delivered status
  const filteredProducts = sortedProducts.filter(p => {
    if (p.delivered && p.delivered.toLowerCase() !== "no") {
      console.log(`Filtering out ${p.id} because delivered=${p.delivered}`);
      return false;
    }

    const matchReference = (p.reference || "").toString().toLowerCase().includes(searchFilters.reference.toLowerCase());
    const matchClient = (p.client || "").toString().toLowerCase().includes(searchFilters.client.toLowerCase());
    const matchUser = (p.user || "").toString().toLowerCase().includes(searchFilters.user.toLowerCase());

    const dateRecu = new Date(p.originalData.date);
    const dateFinit = new Date(p.dateFinit);

    const matchDateRecuFrom = searchFilters.dateRecuFrom ? dateRecu >= new Date(searchFilters.dateRecuFrom) : true;
    const matchDateRecuTo = searchFilters.dateRecuTo ? dateRecu <= new Date(searchFilters.dateRecuTo) : true;
    const matchDateFinitFrom = searchFilters.dateFinitFrom ? dateFinit >= new Date(searchFilters.dateFinitFrom) : true;
    const matchDateFinitTo = searchFilters.dateFinitTo ? dateFinit <= new Date(searchFilters.dateFinitTo) : true;

    return (
      matchReference &&
      matchClient &&
      matchUser &&
      matchDateRecuFrom &&
      matchDateRecuTo &&
      matchDateFinitFrom &&
      matchDateFinitTo
    );
  });

  // Pagination calculations
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }
  const handleDeleteProduct = async (id) => {
    const toastId = toast.loading("Suppression en cours...");

    try {
      await fakeApi.receptions.delete(id);
      setFinishedProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Produit fini supprimé avec succès !", { id: toastId });
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Une erreur est survenue lors de la suppression", { id: toastId });
    }
  };
  const handleSaveReference = async () => {
    if (!editingProductId || !newReference) return
    try {
      await fakeApi.receptions.updateExtra(editingProductId, {
        serialNumber: newReference,
      })
      setFinishedProducts(prev =>
        prev.map(p => (p.id === editingProductId ? { ...p, reference: newReference } : p))
      )
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du numéro de série")
      console.error(err)
    }
    setIsDialogOpen(false)
    setEditingProductId(null)
    setNewReference("")
  }

  const handleMarkDelivered = async (id) => {
    try {
      await fakeApi.receptions.markDelivered(id);

      toast.success("Produit marqué comme livré avec succès.");
      setFinishedProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut livré.");
      console.error(error);
    }
  };
  const handleReturnClick = (id) => {
    setReturnProductId(id)
    setIsReturnModalOpen(true)
    if (!isAdmin) {
      setReturnReason("")
    }
  }

  function displayEtat(etat) {
    if (!etat) return "N/A";
    return etat.toLowerCase() === "finit" ? "fini" : etat;
  }

  const submitReturnRequest = async () => {
    if (!returnReason.trim()) {
      toast.error("Veuillez entrer une raison pour le retour");
      return;
    }

    setIsProcessingReturn(true);
    try {
      await fakeApi.receptions.requestReturn(returnProductId, returnReason);

      toast.success("Demande de retour envoyée avec succès");
      fetchData();
    } catch (err) {
      console.error("Return request failed:", err);
      toast.error("Échec de la demande de retour");
    } finally {
      setIsProcessingReturn(false);
      setIsReturnModalOpen(false);
      setReturnProductId(null);
      setReturnReason("");
    }
  };

  const approveReturn = async () => {
    setIsProcessingReturn(true);
    try {
      await fakeApi.receptions.approveReturn(returnProductId);

      toast.success("Retour approuvé avec succès");
      fetchData();
    } catch (error) {
      console.error("Return approval failed:", error);
      toast.error("Échec de l'approbation du retour");
    } finally {
      setIsProcessingReturn(false);
      setIsReturnModalOpen(false);
      setReturnProductId(null);
    }
  };

  const handleCompleteReturn = async () => {
    if (!returnProductId) return;

    setIsProcessingReturn(true);
    try {
      // For non-admins: First submit the request
      if (!isAdmin) {
        if (!returnReason.trim()) {
          toast.error("Please enter a return reason");
          return;
        }
        await fakeApi.receptions.requestReturn(returnProductId, returnReason);
      }

      // For admins or after request is submitted: Approve and complete
      await fakeApi.receptions.approveReturn(returnProductId);

      toast.success("Return process completed successfully");
      fetchData();
    } catch (error) {
      console.error("Return process failed:", error);
      toast.error(`Return process failed: ${error.message}`);
    } finally {
      setIsProcessingReturn(false);
      setIsReturnModalOpen(false);
      setReturnProductId(null);
      setReturnReason("");
    }
  };
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredProducts.map(p => p.id))
    }
  }

  const toggleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header Card */}
        <ProduitsFinisHeader />
        {/* Filters Section */}
        <Card className="mb-6 border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg font-semibold text-gray-700">Filtres de recherche</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Text Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Référence</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par référence"
                    value={searchFilters.reference}
                    onChange={e => setSearchFilters({ ...searchFilters, reference: e.target.value })}
                    className="pl-9 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Client</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par client"
                    value={searchFilters.client}
                    onChange={e => setSearchFilters({ ...searchFilters, client: e.target.value })}
                    className="pl-9 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Utilisateur</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par utilisateur"
                    value={searchFilters.user}
                    onChange={e => setSearchFilters({ ...searchFilters, user: e.target.value })}
                    className="pl-9 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Date Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Date Reçu - De</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={searchFilters.dateRecuFrom}
                    onChange={e => setSearchFilters({ ...searchFilters, dateRecuFrom: e.target.value })}
                    className="pl-9 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Date Reçu - À</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={searchFilters.dateRecuTo}
                    onChange={e => setSearchFilters({ ...searchFilters, dateRecuTo: e.target.value })}
                    className="pl-9 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Date Finit - De</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={searchFilters.dateFinitFrom}
                    onChange={e => setSearchFilters({ ...searchFilters, dateFinitFrom: e.target.value })}
                    className="pl-9 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Date Finit - À</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={searchFilters.dateFinitTo}
                    onChange={e => setSearchFilters({ ...searchFilters, dateFinitTo: e.target.value })}
                    className="pl-9 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="mb-6 border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-gray-700">Liste des Produits</CardTitle>
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
                    {isAdmin && (
                      <TableHead className="w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </TableHead>
                    )}
                    <TableHead className="text-gray-600 font-medium">Référence</TableHead>
                    <TableHead className="text-gray-600 font-medium">Client</TableHead>
                    <TableHead className="text-gray-600 font-medium">Date Reçu</TableHead>
                    <TableHead className="text-gray-600 font-medium">Date Finit</TableHead>
                    <TableHead className="text-gray-600 font-medium">Utilisateur</TableHead>
                    <TableHead className="text-gray-600 font-medium">État</TableHead>
                    {isAdmin && <TableHead className="text-gray-600 font-medium">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.length > 0 ? (
                    currentProducts.map((p) => (
                      <TableRow
                        key={p.id}
                        onClick={() => {
                          setSelectedProduct(p)
                          setIsExtrasDialogOpen(true)
                        }}
                        className={`cursor-pointer transition ${selectedIds.includes(p.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      >
                        {isAdmin && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(p.id)}
                              onChange={() => toggleSelectOne(p.id)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </TableCell>
                        )}

                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-blue-500" />
                            <span className="text-blue-600 font-mono">{p.reference}</span>
                            <button
                              className="ml-auto text-gray-400 hover:text-blue-600 transition"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingProductId(p.id)
                                setNewReference(p.reference)
                                setIsDialogOpen(true)
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>{p.client}</TableCell>
                        <TableCell className="text-gray-600">{p.dateRecu}</TableCell>
                        <TableCell className="text-gray-600">{p.dateFinit}</TableCell>
                        <TableCell>{p.user}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${p.etat?.toLowerCase() === "finit"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                            }`}>
                            {displayEtat(p.etat)}

                          </span>
                        </TableCell>
                        {isAdmin && (
                          <TableCell onClick={e => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReturnClick(p.id)}
                              disabled={p.isReturned}
                              className={`${p.isReturned
                                ? "bg-red-50 text-red-600 border-red-200 cursor-not-allowed"
                                : "border-gray-300 hover:bg-gray-100"}`}
                            >
                              <RotateCw className="w-4 h-4 mr-2" />
                              {p.isReturned ? "Retourné" : "Retour"}
                            </Button>

                            {/* Delivered button */}
                            {p.etat.toLowerCase() === "finit" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkDelivered(p.id)}
                                className="ml-2 bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Livré
                              </Button>
                            )}

                            {/* Add this Delete button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDeleteModal(p.id)}

                              disabled={deletingIds.includes(p.id)}
                              className="ml-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                            >
                              {deletingIds.includes(p.id) ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 mr-2" />
                              )}
                              Supprimer
                            </Button>
                          </TableCell>
                        )}

                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-gray-500">
                        Aucun produit trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination and Actions */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Pagination Controls */}
              {filteredProducts.length > productsPerPage && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
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

              {/* Generate Invoice Button */}
              {isAdmin && selectedIds.length > 0 && (
                <Button
                  onClick={() => setIsFactureDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Générer Facture ({selectedIds.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Reference Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800">Modifier la Référence</DialogTitle>
            <DialogDescription className="text-gray-600">
              Entrez une nouvelle référence pour le produit fini.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newReference}
              onChange={(e) => setNewReference(e.target.value)}
              placeholder="Nouvelle référence"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-gray-300 hover:bg-gray-50"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveReference}
              className="bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog open={isExtrasDialogOpen} onOpenChange={setIsExtrasDialogOpen}>
        <DialogContent className="bg-white rounded-lg max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Hash className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-800">Détails du Produit</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Référence: {selectedProduct?.reference}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Client</p>
                <p className="text-gray-800">{selectedProduct?.client}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date Finition</p>
                <p className="text-gray-800">{selectedProduct?.dateFinit}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Utilisateur</p>
                <p className="text-gray-800">{selectedProduct?.user}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">État</p>
                <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedProduct?.etat?.toLowerCase() === "finit"
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
                  }`}>
                  {selectedProduct?.etat}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Pièces Utilisées</h3>
              {selectedProduct?.originalData?.extra?.pieceCounters ? (
                <div className="space-y-2">
                  {Object.entries(selectedProduct.originalData.extra.pieceCounters).map(
                    ([pieceId, count]) => {
                      const piece = pieces.find(p => p._id === pieceId)
                      return (
                        <div key={pieceId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-gray-800">{piece?.referenceArticle || "Inconnu"}</span>
                          <span className="text-gray-800">{piece?.designation || "Inconnu"}</span>
                          <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            {count} pièce(s)
                          </span>
                        </div>
                      )
                    }
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">Aucune pièce utilisée.</p>
              )}
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button
              onClick={() => setIsExtrasDialogOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={isFactureDialogOpen} onOpenChange={setIsFactureDialogOpen}>
        <DialogContent className="bg-white rounded-lg max-w-2xl w-full print:p-0">
          <DialogHeader className="print:mb-4">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl font-bold text-gray-800">Facture Produits Finis</DialogTitle>
                <DialogDescription className="text-gray-600">
                  {new Date().toLocaleDateString('fr-FR')}
                </DialogDescription>
              </div>
              <div className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium">
                {selectedIds.length} {selectedIds.length === 1 ? 'produit' : 'produits'}
              </div>
            </div>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto print:max-h-none">
            <div className="space-y-4">
              {finishedProducts
                .filter(p => selectedIds.includes(p.id))
                .map(p => (
                  <div key={p.id} className="border p-4 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-blue-600">{p.reference}</h3>
                        <p className="text-sm text-gray-600">Client: {p.client}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Finit le: {p.dateFinit}
                      </div>
                    </div>

                    {p.originalData?.extra?.pieceCounters ? (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Pièces Utilisées:</h4>
                        <ul className="space-y-2">
                          {Object.entries(p.originalData.extra.pieceCounters).map(([pieceId, count]) => {
                            const piece = pieces.find(pc => pc._id === pieceId)
                            return (
                              <li key={pieceId} className="flex justify-between text-sm">
                                <span className="text-gray-700">{piece?.referenceArticle || "Inconnu"}</span>
                                <span className="text-gray-700">{piece?.designation || "Inconnu"}</span>
                                <span className="font-medium">{count} ×</span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">Aucune pièce utilisée.</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 print:hidden">
            <Button
              variant="outline"
              onClick={() => setIsFactureDialogOpen(false)}
              className="border-gray-300 hover:bg-gray-50"
            >
              Fermer
            </Button>
            <Button
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              Imprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Confirmer la suppression"
        message="Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible."
        confirmText="Supprimer"
        onConfirm={() => handleDeleteProduct(deleteProductId)}
        confirmColor="bg-red-600 hover:bg-red-700"
      />


      {/* Return Confirmation Dialog */}
      <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
        <DialogContent className="bg-white rounded-lg max-w-sm">
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-red-100 mb-4">
                <RotateCw className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-lg font-semibold text-gray-800">
                {isAdmin ? "Process Return" : "Request Return"}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                {isAdmin
                  ? "This will approve and complete the return immediately."
                  : "Please provide the reason for return."}
              </DialogDescription>
            </div>
          </DialogHeader>

          {!isAdmin && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Return Reason
              </label>
              <Input
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Enter return reason"
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
              Cancel
            </Button>
            <Button
              onClick={handleCompleteReturn}
              className="bg-red-600 hover:bg-red-700 shadow-sm px-6"
              disabled={isProcessingReturn || (!isAdmin && !returnReason.trim())}
            >
              {isProcessingReturn ? (
                <>
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                isAdmin ? "Complete Return" : "Submit Request"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
function ConfirmationModal({
  isOpen,
  onClose,
  title,
  message,
  confirmText,
  onConfirm,
  confirmColor,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onConfirm} className={`${confirmColor} text-white`}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
