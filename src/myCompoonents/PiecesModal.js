import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table.tsx";
import fakeApi from "../data/fakeData";
import { Input } from "../components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select.tsx";
import BarcodeScanner from "../myCompoonents/BarcodeScanner.js";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] p-6 shadow-xl flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Gestion des pièces</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-grow">{children}</div>
      </div>
    </div>
  );
}

export default function PiecesModal({ isOpen, onClose, selectedProductId }) {
  const [carPieces, setCarPieces] = useState([]);
  const [selectedPieceId, setSelectedPieceId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedPieces, setAddedPieces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [scanning, setScanning] = useState(false);
  const [lastScannedId, setLastScannedId] = useState(null);
  // Fetch pieces on modal open
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fakeApi.pieces.getAll()
      .then((data) => setCarPieces(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  // Fetch reception data and initialize addedPieces, runs only after carPieces loaded
  useEffect(() => {
    if (!isOpen || !selectedProductId || carPieces.length === 0) return;

    setIsLoading(true);
    fakeApi.receptions.getById(selectedProductId)
      .then((reception) => {
        if (reception.extra?.pieces && reception.extra?.pieceCounters) {
          const existingPieces = reception.extra.pieces.map((pieceId) => {
            const pieceDetails = carPieces.find((p) => p._id === pieceId);
            return {
              id: pieceId,
              designation: pieceDetails?.designation || "N/A",
              referenceArticle: pieceDetails?.referenceArticle || "N/A",
              quantity: reception.extra.pieceCounters[pieceId] || 1,
            };
          });
          setAddedPieces(existingPieces);
        } else {
          setAddedPieces([]);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isOpen, selectedProductId, carPieces]);


  const filteredPieces = carPieces.filter(
    (piece) =>
      piece.referenceArticle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      piece.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (filteredPieces.length > 0 && !filteredPieces.some((p) => p._id === selectedPieceId)) {
      setSelectedPieceId(filteredPieces[0]._id);
    }
  }, [filteredPieces, selectedPieceId]);

  function addPieceById(pieceId, qty = 1) {
    if (!pieceId || qty < 1) return;

    const piece = carPieces.find((p) => p._id === pieceId);
    if (!piece) {
      alert("Pièce non trouvée !");
      return;
    }

    setAddedPieces((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === piece._id);
      if (existingIndex !== -1) {
        const newArr = [...prev];
        newArr[existingIndex].quantity += qty;
        return newArr;
      } else {
        return [
          ...prev,
          {
            id: piece._id,
            designation: piece.designation,
            referenceArticle: piece.referenceArticle,
            quantity: qty,
          },
        ];
      }
    });
  }

  useEffect(() => {
    if (lastScannedId) {
      addPieceById(lastScannedId, 1);
      setLastScannedId(null); // reset to allow scanning same code again
    }
  }, [lastScannedId]);

  function addPiece() {
    if (!selectedPieceId || quantity < 1) return;
    addPieceById(selectedPieceId, quantity);
    setQuantity(1);
    setSearchTerm("");
  }

  function removePiece(id) {
    setAddedPieces((prev) => prev.filter((piece) => piece.id !== id));
  }

  async function handleSave() {
    if (!selectedProductId) return alert("Produit non sélectionné");
    if (addedPieces.length === 0) return alert("Aucune pièce ajoutée");

    const pieces = addedPieces.map((p) => p.id);
    const pieceCounters = addedPieces.reduce((acc, curr) => {
      acc[curr.id] = curr.quantity;
      return acc;
    }, {});

    try {
      await fakeApi.receptions.updateExtra(selectedProductId, {
        pieces,
        pieceCounters,
      });
      onClose();
    } catch (err) {
      console.error("Erreur lors de l'envoi des pièces:", err);
      alert("Erreur lors de l'enregistrement des pièces");
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  type="text"
                  placeholder="Rechercher une pièce..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  className="w-20 text-center"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />

                <Button onClick={addPiece} className="flex-grow" disabled={filteredPieces.length === 0}>
                  Ajouter
                </Button>
              </div>
            </div>

            {/* Barcode Scanner */}
            <div className="mt-2">
              <Button onClick={() => setScanning((prev) => !prev)} variant="outline">
                {scanning ? "Arrêter le scan" : "Scanner un code-barres"}
              </Button>

              {scanning && (
                <div className="mt-3">
                  <BarcodeScanner
                    onDetected={(code) => {
                      console.log("Scanned code:", code);

                      const normalizedCode = code.trim().toUpperCase();
                      const found = carPieces.find(
                        (p) =>
                          p.barCode?.toUpperCase() === normalizedCode ||
                          p.referenceArticle?.toUpperCase() === normalizedCode
                      );


                      if (found) {
                        addPieceById(found._id, 1);
                        setSelectedPieceId(found._id);
                        setScanning(false);
                      } else {
                        alert("Aucune pièce trouvée pour ce code-barres.");
                      }
                    }}

                    onClose={() => setScanning(false)}
                  />


                </div>
              )}
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <Select value={selectedPieceId} onValueChange={setSelectedPieceId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une pièce">
                    {selectedPieceId
                      ? `${carPieces.find((p) => p._id === selectedPieceId)?.designation} (${carPieces.find(
                        (p) => p._id === selectedPieceId
                      )?.referenceArticle})`
                      : "Sélectionner une pièce"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {filteredPieces.length === 0 ? (
                    <div className="px-4 py-2 text-gray-500 text-sm">Aucun résultat</div>
                  ) : (
                    filteredPieces.map((piece) => (
                      <SelectItem key={piece._id} value={piece._id}>
                        {piece.designation} ({piece.referenceArticle})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {addedPieces.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="mt-2 text-gray-500">Aucune pièce ajoutée</p>
                <p className="text-sm text-gray-400">Ajoutez des pièces à partir de la liste ou scannez un code-barres</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-medium text-gray-600">Référence</TableHead>
                        <TableHead className="font-medium text-gray-600">Désignation</TableHead>
                        <TableHead className="font-medium text-gray-600">Quantité</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {addedPieces.map((piece) => (
                        <TableRow key={piece.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{piece.referenceArticle}</TableCell>
                          <TableCell>{piece.designation}</TableCell>
                          <TableCell>{piece.quantity}</TableCell>
                          <TableCell>
                            <button
                              onClick={() => removePiece(piece.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              aria-label="Supprimer"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button
              disabled={addedPieces.length === 0}
              onClick={handleSave}
              className="w-full sm:w-auto"
            >
              Enregistrer
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
