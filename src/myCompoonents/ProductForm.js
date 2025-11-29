import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.tsx"
import { Button } from "../components/ui/button.tsx"
import { Label } from "../components/ui/label.tsx"
import { Textarea } from "../components/ui/textarea.tsx"
import { Input } from "../components/ui/input.tsx"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select.tsx"

import ClientSelector from "./ClientSelector"
import EtrierSelector from "./EtrierSelector"

const POSITIONS = [
  { label: "Avant Gauche", value: "FrontLeft" },
  { label: "Avant Droit", value: "FrontRight" },
  { label: "Arrière Gauche", value: "RearLeft" },
  { label: "Arrière Droit", value: "RearRight" },
]
export default function ProductForm({
  formData,
  setFormData,
  handleSubmit,
  errors,
  staticClients,
  setClients,
  staticEtriers,
  setEtriers,
  className = "",
}) {
  const onClientChange = (client) => {
    setFormData((prev) => ({
      ...prev,
      client: client.toUpperCase(), // Always uppercase
    }));
  };

  const onEtrierChange = (etrier) => {
    setFormData((prev) => ({
      ...prev,
      etrier: {
        ...etrier,
        name: etrier?.name?.toUpperCase() || "", // Ensure uppercase for etrier name
      },
    }));
  };

  return (
    <Card className={`shadow-md rounded-lg border border-gray-200 ${className}`}>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Nouveau Produit
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selector - REQUIRED */}
          <ClientSelector
            formData={formData}
            setFormData={setFormData}
            staticClients={staticClients}
            setClients={setClients}
          />
          {errors.client && <p className="text-red-500 text-sm">{errors.client}</p>}
          {/* Etrier Selector - REQUIRED */}

          <EtrierSelector
            formData={formData}
            setFormData={setFormData}
            staticEtriers={staticEtriers}
            setEtriers={setEtriers}
          />
          {errors.etrier && <p className="text-red-500 text-sm">{errors.etrier}</p>}

          {/* Position Select */}
          {formData.etrier && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Position</Label>
              <Select
                value={formData.etrier?.position || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    etrier: {
                      ...prev.etrier,
                      position: value,
                    },
                  }))
                }
              >
                <SelectTrigger className="border border-gray-300 rounded-md">
                  <SelectValue
                    placeholder="Sélectionner une position"
                    value={
                      POSITIONS.find((pos) => pos.value === formData.etrier?.position)?.label || ""
                    }
                  />
                </SelectTrigger>
                <SelectContent className="border border-gray-200 rounded-md shadow-lg">
                  {(formData.etrier.positions?.length > 0
                    ? formData.etrier.positions.map((pos) => ({
                      label: POSITIONS.find((p) => p.value === pos)?.label || pos,
                      value: pos,
                    }))
                    : POSITIONS
                  ).map(({ label, value }) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="hover:bg-gray-100 cursor-pointer bg-gray-50 text-gray-800 font-sans"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Observation (Optional) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Observation</Label>
            <Textarea
              value={formData.observation || ""}
              onChange={(e) =>
                setFormData({ ...formData, observation: e.target.value })
              }
              rows={3}
              className="border border-gray-300 rounded-md"
            />
            {errors.observation && (
              <p className="text-sm text-red-500">{errors.observation}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Date de réception</Label>
            <Input
              value={new Date().toLocaleDateString("fr-FR")}
              disabled
              className="border border-gray-300 rounded-md"
            />
          </div>

          {/* État */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">État</Label>
            <Input
              type="text"
              value="Reçu"
              readOnly
              className="w-full border border-gray-300 rounded-md cursor-not-allowed"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md px-4 py-2"
          >
            Enregistrer le produit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}