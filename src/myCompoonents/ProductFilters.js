import { Input } from "../components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select.tsx";

export default function ProductFilters({ filters, setFilters }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-transparent p-4 rounded-lg shadow-md border border-blue-100">
      {/* Client Filter */}
      <Input
        placeholder="Client"
        value={filters.clientName}
        onChange={(e) => setFilters({ ...filters, clientName: e.target.value })}
        className="text-sm bg-transparent border-gray-300 focus:ring-2 focus:ring-blue-500"
      />

      {/* Car Model Filter */}
      <Input
        placeholder="Modèle voiture"
        value={filters.carModel}
        onChange={(e) => setFilters({ ...filters, carModel: e.target.value })}
        className="text-sm bg-transparent border-gray-300 focus:ring-2 focus:ring-blue-500"
      />

      {/* Reception Number Filter */}
      <Input
        placeholder="Numéro réception"
        value={filters.receptionNumber}
        onChange={(e) =>
          setFilters({ ...filters, receptionNumber: e.target.value })
        }
        className="text-sm bg-transparent border-gray-300 focus:ring-2 focus:ring-blue-500"
      />

      {/* État Filter */}
      <Select
        value={filters.etat}
        onValueChange={(value) => setFilters({ ...filters, etat: value })}
      >
        <SelectTrigger className="text-sm border-gray-300 focus:ring-2 focus:ring-blue-500">
          <SelectValue placeholder="État" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-sm bg-gray-50 hover:bg-blue-100">
            Tous
          </SelectItem>
          <SelectItem value="recus" className="text-sm bg-gray-50 hover:bg-blue-100">
            Reçu
          </SelectItem>
          <SelectItem value="en cours" className="text-sm bg-gray-50 hover:bg-blue-100">
            En cours
          </SelectItem>
          <SelectItem value="fini" className="text-sm bg-gray-50 hover:bg-blue-100">
            Fini
          </SelectItem>
          <SelectItem value="retour" className="text-sm bg-gray-50 hover:bg-blue-100">
            Retour
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
