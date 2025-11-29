import { useState, useEffect } from "react";
import { Input } from "../components/ui/input.tsx";
import { Button } from "../components/ui/button.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog.tsx";
import { Label } from "../components/ui/label.tsx";
import { Plus } from "lucide-react";
import fakeApi from "../data/fakeData";

export default function EtrierSelector({ formData, setFormData, staticEtriers, setEtriers }) {
  const [etrierInput, setEtrierInput] = useState("");
  const [etrierSuggestions, setEtrierSuggestions] = useState([]);
  const [isEtrierDialogOpen, setIsEtrierDialogOpen] = useState(false);
  const [newEtrier, setNewEtrier] = useState({ carModel: "" });
  const [showEtrierSuggestions, setShowEtrierSuggestions] = useState(false);

  const fixedPositions = ["avant droit", "avant gauche", "arrière droit", "arrière gauche"];

  useEffect(() => {
    if (etrierInput.trim() === "") {
      setEtrierSuggestions([]);
      return;
    }
    const filtered = staticEtriers.filter(etrier =>
      etrier.carModel.toLowerCase().includes(etrierInput.toLowerCase())
    );
    setEtrierSuggestions(filtered);
  }, [etrierInput, staticEtriers]);

  async function handleAddEtrier() {
    try {
      const savedEtrier = await fakeApi.etriers.create({
        carModel: newEtrier.carModel.trim().toUpperCase(),
      });

      if (savedEtrier) {
        setEtriers(prev => [...prev, savedEtrier]);
        setFormData({
          ...formData,
          etrier: {
            ...savedEtrier,
            position: fixedPositions[0],
          },
        });
      } else {
        console.warn("No étrier returned from server");
      }

      setEtrierInput("");
      setIsEtrierDialogOpen(false);
      setNewEtrier({ carModel: "" });
      setShowEtrierSuggestions(false);

    } catch (error) {
      console.error("Error adding étrier:", error);
      alert("Erreur lors de l'ajout de l'étrier: " + error.message);
    }
  }

  function handleEtrierSelect(etrier) {
    const upperEtrier = { ...etrier, carModel: etrier.carModel.toUpperCase() };
    setFormData({
      ...formData,
      etrier: {
        ...upperEtrier,
        position: etrier?.positions?.[0] || "",
      },
    });
    setEtrierInput(upperEtrier.carModel);
    setShowEtrierSuggestions(false);
  }

  return (
    <div className="space-y-2 relative">
      <span className="relative cursor-help text-red-600">
        *
        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2
    whitespace-nowrap rounded bg-red-600 px-1 text-xs text-white opacity-0
    pointer-events-none transition-opacity duration-200
    hover:opacity-100">
          champs obligatoire
        </span>
      </span>

      <Label htmlFor="etrier">Étrier</Label>
      <div className="relative">
        <Input
          id="etrier"
          value={etrierInput}
          onChange={(e) => {
            setEtrierInput(e.target.value.toUpperCase());
            setShowEtrierSuggestions(true);
          }}
          onFocus={() => setShowEtrierSuggestions(true)}
          placeholder="Modèle d'étrier"
          className="bg-gray-50 text-gray-800 font-sans uppercase"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2"
          onClick={() => setIsEtrierDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {showEtrierSuggestions && etrierSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {etrierSuggestions.map(etrier => (
            <div
              key={etrier._id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleEtrierSelect(etrier)}
            >
              {etrier.carModel.toUpperCase()}
            </div>
          ))}
        </div>
      )}

      <Dialog open={isEtrierDialogOpen} onOpenChange={setIsEtrierDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel étrier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                value={newEtrier.carModel}
                onChange={(e) => setNewEtrier({ ...newEtrier, carModel: e.target.value.toUpperCase() })}
                placeholder="Nom du modèle (car model)"
                className="bg-transparent uppercase"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEtrierDialogOpen(false);
                setNewEtrier({ carModel: "" });
              }}
              className="bg-red-50 hover:bg-red-200"
            >
              Annuler
            </Button>
            <Button
              onClick={handleAddEtrier}
              disabled={!newEtrier.carModel.trim()}
              className="bg-red-50 hover:bg-red-200"
            >
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
