import React, { useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog.tsx"
import { DialogDescription } from "@radix-ui/react-dialog"
import { Button } from "../components/ui/button.tsx"
import { Input } from "../components/ui/input.tsx"

export default function FinishDialog({
  isOpen,
  setIsOpen,
  serialNumber,
  setSerialNumber,
  onConfirm,
  selectedProductId,
  products = [], // Add this
}) {
  const SERIAL_PREFIX = "SBS25ET"

  const { lastSerial, suggestedSerial } = useMemo(() => {
    const serialNumbers = products
      .map((p) =>
        typeof p.serialNumber === "string"
          ? p.serialNumber
          : p.extra?.serialNumber
      )
      .filter((sn) => typeof sn === "string" && sn.toUpperCase().startsWith(SERIAL_PREFIX))

    let maxNum = 0
    serialNumbers.forEach((sn) => {
      const match = sn.match(/^SBS25ET(\d+)$/i)
      // case-insensitive
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNum) maxNum = num
      }
    })

    const last = maxNum > 0 ? `${SERIAL_PREFIX}${String(maxNum).padStart(4, "0")}` : "Aucun"
    const next = `${SERIAL_PREFIX}${String(maxNum + 1).padStart(4, "0")}`

    return { lastSerial: last, suggestedSerial: next }
  }, [products])

  useEffect(() => {
    if (isOpen && !serialNumber) {
      console.log("Auto-setting serial number to:", suggestedSerial)
      setSerialNumber(suggestedSerial)
    }
  }, [isOpen, suggestedSerial, serialNumber])

  const handleConfirm = () => {
    if (selectedProductId) {
      onConfirm(selectedProductId, serialNumber.trim() || undefined)
    }
        setTimeout(() => {
      window.location.reload(); // ✅ Refresh the page after success
    }, 1000); // Short delay to show the message
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleConfirm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="z-[9999] w-[90vw] max-w-md sm:w-full bg-white border border-blue-100 rounded-lg shadow-md">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
            Vérification du numéro de série
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 space-y-1">
            <div>Dernier utilisé : <strong>{lastSerial}</strong></div>
            <div>Suggestion : <strong>{suggestedSerial}</strong></div>
            <div>Vous pouvez saisir un numéro de série manuellement, ou laisser vide pour le générer automatiquement.</div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <label
              htmlFor="serialNumber"
              className="sm:text-right text-sm font-medium text-gray-700"
            >
              Numéro de série
            </label>
            <Input
              id="serialNumber"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              className="col-span-1 sm:col-span-3 text-sm border-gray-300 focus:ring-2 focus:ring-blue-500"
              placeholder={`e.g. ${suggestedSerial}`}
              autoFocus
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium"
          >
            Confirmer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
