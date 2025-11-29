import React, { useState } from "react";
import { Button } from "../components/ui/button.tsx";
import { Card } from "../components/ui/card.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table.tsx";
import PiecesModal from "./PiecesModal";
import FinishDialog from "./FinishDialog";
import fakeApi from "../data/fakeData";

export default function ProductList({
  products,
  markAsInProgress,
  markAsFinished,
  isAdmin,
  completeMarkAsFinished,
  onDelete,
  onOpenFinishDialog,
  onOpenFinishDialogWithSerial,
}) {
  // Modal states
  const [isPiecesModalOpen, setIsPiecesModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRecusConfirmOpen, setIsRecusConfirmOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected item states
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedRecusProductId, setSelectedRecusProductId] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [isReprendreConfirmOpen, setIsReprendreConfirmOpen] = useState(false);
  const [reprendreProductId, setReprendreProductId] = useState(null);

  // Form state
  const [serialNumber, setSerialNumber] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  // Loading and success states
  const [loadingProductId, setLoadingProductId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Open & Close Modals
  const openDeleteModal = (productId) => {
    setDeleteProductId(productId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteProductId(null);
  };

  const openFinishDialogWithSerial = (product) => {
    setSelectedProductId(product.id);
    setSerialNumber(product.extra?.serialNumber || "");
    setIsDialogOpen(true);
  };

  // Sort products by status: recus -> en cours -> finit -> returner
  const getLastStatus = (product) => {
    if (!product.statusHistory || product.statusHistory.length === 0) return null;
    return product.statusHistory[product.statusHistory.length - 1].status.toLowerCase();
  };

  const unfinishedProducts = products.filter(product => {
    const lastStatus = getLastStatus(product);

    // Exclude if last status is "finit"
    if (lastStatus === "finit") return false;

    // Include if currently in a return cycle
    if (product.isReturned) {
      const returnStatuses = product.statusHistory.map(s => s.status.toLowerCase());
      if (returnStatuses.includes("return-approved") || returnStatuses.includes("return-pending")) {
        return true;
      }
    }

    // Otherwise include if not finished
    return lastStatus !== "finit";

  }
  );





  const sortedProducts = [...unfinishedProducts].sort((a, b) => {
    const statusOrder = {
      "recus": 1,
      "en cours": 2,
      // You can omit 'finit' and 'retourné' since they're filtered out
    };

    const aStatus = a.etat?.toLowerCase() || "";
    const bStatus = b.etat?.toLowerCase() || "";

    return (statusOrder[aStatus] || 99) - (statusOrder[bStatus] || 99);
  });


  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleDeleteProduct = async (id) => {
    try {
      await onDelete(id);
      closeDeleteModal();
    } catch (error) {
      console.error(error);
      alert('Failed to delete reception');
    }
  };
  const markReturnedAsInProgress = async (id) => {
    try {
      setLoadingProductId(id);
      await fakeApi.receptions.updateEtat(id, "en cours");

      setSuccessMessage("Produit repris avec succès !");
      setTimeout(() => {
        window.location.reload(); // ✅ Refresh the page after success
      }, 1000); // Short delay to show the message
    } catch (error) {
      console.error("❌ Error marking returned product as en cours:", error);
      alert("Erreur lors de la reprise du produit");
    } finally {
      setLoadingProductId(null);
    }
  };


  // Position mapping
  const positionDisplayMap = {
    FrontLeft: "Avant Gauche",
    FrontRight: "Avant Droit",
    RearLeft: "Arrière Gauche",
    RearRight: "Arrière Droit",
  };

  const normalizePosition = (pos) => {
    if (!pos) return "";
    const map = {
      "avant gauche": "FrontLeft",
      "avant droit": "FrontRight",
      "arrière gauche": "RearLeft",
      "arrière droit": "RearRight",
    };
    return map[pos.toLowerCase()] || pos;
  };

  const openPiecesModal = (productId) => {
    setSelectedProductId(productId);
    setIsPiecesModalOpen(true);
  };

  if (products.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Aucun produit enregistré
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Mobile view: Cards */}
        <div className="sm:hidden space-y-4 p-4">
          {currentProducts.map((product) => {
            const etat = product.etat?.toLowerCase() || "";
            const normalizedPosKey = normalizePosition(product.position);
            const position = positionDisplayMap[normalizedPosKey] || product.position || "N/A";
            const isReturned = product.isReturned;

            return (
              <Card
                key={product.id}
                className={`p-4 space-y-2 shadow ${isReturned ? "bg-red-50" : ""}`}
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-gray-500">Client</div>
                    <div className="font-semibold text-gray-900">
                      {product.client?.name || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Modèle</div>
                    <div className="text-sm text-gray-600">
                      {product.etrier?.carModel || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Position</div>
                    <div className="text-sm text-gray-600">{position}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Utilisateur</div>
                    <div className="text-xs text-gray-500">{product.user?.name || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Date</div>
                    <div className="text-xs text-gray-500">
                      {product.date
                        ? new Date(product.date).toLocaleDateString("fr-FR")
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">État</div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-semibold ${product.etat === "en cours"
                            ? "bg-yellow-100 text-yellow-800"
                            : product.etat === "recus"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {product.etat || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-end gap-2 pt-3">
                  {etat === "recus" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedRecusProductId(product.id);
                        setIsRecusConfirmOpen(true);
                      }}
                      className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                      variant="outline"
                    >
                      En cours
                    </Button>
                  )}

                  {/* Reprendre button for returned products */}
                  {isReturned && etat !== "en cours" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReprendreProductId(product.id);
                        setIsReprendreConfirmOpen(true);
                      }}
                      className="border-blue-500 hover:bg-blue-50 text-blue-700"
                      disabled={loadingProductId === product.id}
                    >
                      {loadingProductId === product.id ? "Chargement..." : "Reprendre"}
                    </Button>
                  )}

                  {etat === "en cours" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-500 hover:bg-blue-50 text-blue-700"
                        onClick={() => openPiecesModal(product.id)}
                      >
                        Ajouter Pièces
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (isAdmin) {
                            if (isReturned) {
                              openFinishDialogWithSerial(product);
                            } else {
                              onOpenFinishDialog(product.id);
                            }
                          } else {
                            markAsFinished(product.id);
                          }
                        }}
                        className="border-green-500 hover:bg-green-50 text-green-700"
                      >
                        Fini
                      </Button>
                    </>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500 hover:bg-red-50 text-red-700"
                    onClick={() => openDeleteModal(product.id)}
                  >
                    Supprimer
                  </Button>
                </div>

                {successMessage && loadingProductId === product.id && (
                  <div className="mt-2 text-sm text-green-600">{successMessage}</div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Desktop view: Table */}
        <Table className="hidden sm:table">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="text-sm font-medium text-gray-700">Client</TableHead>
              <TableHead className="text-sm font-medium text-gray-700">Modèle</TableHead>
              <TableHead className="text-sm font-medium text-gray-700">Position</TableHead>
              <TableHead className="text-sm font-medium text-gray-700">Utilisateur</TableHead>
              <TableHead className="text-sm font-medium text-gray-700">Date</TableHead>
              <TableHead className="text-sm font-medium text-gray-700">État</TableHead>
              <TableHead className="text-sm font-medium text-gray-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentProducts.map((product) => {
              const etat = product.etat?.toLowerCase() || "";
              const normalizedPosKey = normalizePosition(product.position);
              const position = positionDisplayMap[normalizedPosKey] || product.position || "N/A";

              return (
                <TableRow
                  key={product.id}
                  className={`hover:bg-gray-50 ${product.isReturned ? "bg-red-50" : ""} ${etat === "en cours" ? "cursor-pointer" : ""
                    }`}
                >
                  {[
                    product.client?.name || "N/A",
                    product.etrier?.carModel || "N/A",
                    position,
                    product.user?.name || "N/A",
                    product.date
                      ? new Date(product.date).toLocaleDateString("fr-FR")
                      : "N/A",
                  ].map((value, idx) => (
                    <TableCell
                      key={idx}
                      onClick={() => etat === "en cours" && openPiecesModal(product.id)}
                      className="text-sm text-gray-700 py-3"
                    >
                      {value}
                    </TableCell>
                  ))}

                  <TableCell className="py-3">
                    <span
                      className={`whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-semibold ${product.etat === "en cours"
                        ? "bg-yellow-100 text-yellow-800"
                        : product.etat === "recus"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {product.etat || "N/A"}
                    </span>
                  </TableCell>

                  <TableCell className="py-3">
                    <div className="flex justify-end space-x-2">
                      {/* En cours for recus */}
                      {etat === "recus" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecusProductId(product.id);
                            setIsRecusConfirmOpen(true);
                          }}
                          className="border-yellow-500 hover:bg-yellow-50 text-yellow-700"
                        >
                          En cours
                        </Button>
                      )}

                      {/* Reprendre for returned */}
                      {product.isReturned && product.etat?.toLowerCase() !== "en cours" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReprendreProductId(product.id);
                            setIsReprendreConfirmOpen(true);
                          }}
                          className="border-blue-500 hover:bg-blue-50 text-blue-700"
                          disabled={loadingProductId === product.id}
                        >
                          {loadingProductId === product.id ? "Chargement..." : "Reprendre"}
                        </Button>
                      )}

                      {/* Normal Fini button for en cours */}
                      {etat === "en cours" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAdmin) {
                              if (product.isReturned) {
                                onOpenFinishDialogWithSerial(product);
                              } else {
                                onOpenFinishDialog(product.id);
                              }
                            } else {
                              markAsFinished(product.id);
                            }
                          }}
                          className="border-green-500 hover:bg-green-50 text-green-700"
                        >
                          Fini
                        </Button>
                      )}

                      {/* Delete */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(product.id);
                        }}
                        className="border-red-500 hover:bg-red-50 text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {sortedProducts.length > productsPerPage && (
        <div className="flex justify-between items-center px-2">
          <Button
            onClick={prevPage}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Précédent</span>
          </Button>

          <div className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </div>

          <Button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <span className="sr-only sm:not-sr-only">Suivant</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Modals */}
      {isAdmin && (
        <FinishDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          serialNumber={serialNumber}
          setSerialNumber={setSerialNumber}
          selectedProductId={selectedProductId}
          onConfirm={(id, serial) => {
            completeMarkAsFinished(id, serial);
            setIsDialogOpen(false);
            setSelectedProductId(null);
            setSerialNumber("");
          }}
        />
      )}

      <ConfirmationModal
        isOpen={isRecusConfirmOpen}
        onClose={() => setIsRecusConfirmOpen(false)}
        title="Confirmer l'action"
        message="Voulez-vous vraiment passer ce produit de recus à en cours ?"
        confirmText="Confirmer"
        onConfirm={() => {
          if (selectedRecusProductId) {
            markAsInProgress(selectedRecusProductId);
          }
          setIsRecusConfirmOpen(false);
          setSelectedRecusProductId(null);
        }}
        confirmColor="bg-yellow-500 hover:bg-yellow-600"
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Confirmer la suppression"
        message="Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible."
        confirmText="Supprimer"
        onConfirm={() => handleDeleteProduct(deleteProductId)}
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      <ConfirmationModal
        isOpen={isReprendreConfirmOpen}
        onClose={() => {
          setIsReprendreConfirmOpen(false);
          setReprendreProductId(null);
        }}
        title="Confirmer la reprise"
        message="Voulez-vous vraiment reprendre ce produit et le passer en état 'en cours' ?"
        confirmText="Reprendre"
        confirmColor="bg-blue-600 hover:bg-blue-700"
        onConfirm={async () => {
          if (!reprendreProductId) return;

          setLoadingProductId(reprendreProductId);
          try {
            await markReturnedAsInProgress(reprendreProductId);
            setSuccessMessage("Produit repris avec succès !");
            setTimeout(() => setSuccessMessage(""), 2000);
          } catch (error) {
            console.error("Erreur lors de la reprise :", error);
          } finally {
            setLoadingProductId(null);
            setIsReprendreConfirmOpen(false);
            setReprendreProductId(null);
          }
        }}
      />

      <PiecesModal
        isOpen={isPiecesModalOpen}
        onClose={() => setIsPiecesModalOpen(false)}
        selectedProductId={selectedProductId}
      />
    </div>
  );
}

// Reusable Confirmation Modal Component
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

// Icon components
function ChevronLeft(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
      />
    </svg>
  );
}