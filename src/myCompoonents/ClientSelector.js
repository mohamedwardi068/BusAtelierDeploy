import { useState, useEffect } from "react";
import { Input } from "../components/ui/input.tsx";
import { Button } from "../components/ui/button.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog.tsx";
import { Label } from "../components/ui/label.tsx";
import { Plus } from "lucide-react";
import fakeApi from "../data/fakeData";

export default function ClientSelector({ formData, setFormData, staticClients, setClients }) {
    const [clientInput, setClientInput] = useState("");
    const [clientSuggestions, setClientSuggestions] = useState([]);
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
    const [newClient, setNewClient] = useState({ name: "", contact: "" });
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (clientInput.trim() === "") {
            setClientSuggestions([]);
            return;
        }
        const filtered = staticClients.filter(client =>
            client.name.toLowerCase().includes(clientInput.toLowerCase())
        );
        setClientSuggestions(filtered);
    }, [clientInput, staticClients]);

    async function handleAddClient() {
        try {
            setLoading(true);
            const savedClient = await fakeApi.clients.create({
                name: newClient.name.trim().toUpperCase(),
                contact: newClient.contact.trim(),
            });

            if (savedClient) {
                setClients((prev) => [...prev, savedClient]);
                setFormData({ ...formData, client: savedClient });
            } else {
                console.warn("No client returned from server");
            }

            setClientInput("");
            setIsClientDialogOpen(false);
            setNewClient({ name: "", contact: "" });
            setShowSuggestions(false);
        } catch (error) {
            console.error("Error adding client:", error);
            alert("Erreur lors de l'ajout du client: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    function handleClientSelect(client) {
        const upperClient = { ...client, name: client.name.toUpperCase() };
        setFormData({ ...formData, client: upperClient });
        setClientInput(upperClient.name);
        setShowSuggestions(false);
    }

    return (
        <div className="space-y-2 relative ">
            <span className="relative cursor-help text-red-600">
                *
                <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2
    whitespace-nowrap rounded bg-red-600 px-1 text-xs text-white opacity-0
    pointer-events-none transition-opacity duration-200
    hover:opacity-100">
                    champs obligatoire
                </span>
            </span>

            <Label htmlFor="client">Client</Label>
            <div className="relative bg-gray-50 text-gray-800 font-sans">
                <Input
                    id="client"
                    value={clientInput}
                    onChange={(e) => {
                        setClientInput(e.target.value.toUpperCase());
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Nom du client"
                    className="bg-gray-50 text-gray-800 font-sans uppercase"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2"
                    onClick={() => setIsClientDialogOpen(true)}
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            {showSuggestions && clientSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-blue-50 border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {clientSuggestions.map(client => (
                        <div
                            key={client._id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleClientSelect(client)}
                        >
                            {client.name.toUpperCase()}
                        </div>
                    ))}
                </div>
            )}

            {staticClients.some(c => c.name.toUpperCase() === clientInput) && (
                <p className="text-sm text-gray-600">
                    Contact: {staticClients.find(c => c.name.toUpperCase() === clientInput)?.contact || "N/A"}
                </p>
            )}

            <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Ajouter un nouveau client</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 ">
                        <div className="space-y-2">
                            <Label>Nom</Label>
                            <Input
                                value={newClient.name}
                                onChange={(e) =>
                                    setNewClient({ ...newClient, name: e.target.value.toUpperCase() })
                                }
                                placeholder="Nom du client"
                                className="bg-transparent uppercase"
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Contact</Label>
                            <Input
                                value={newClient.contact}
                                onChange={(e) => setNewClient({ ...newClient, contact: e.target.value })}
                                placeholder="Contact du client"
                                className="bg-transparent"
                                disabled={loading}
                            />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsClientDialogOpen(false);
                                setNewClient({ name: "", contact: "" });
                                setError("");
                            }}
                            className="bg-red-50 hover:bg-red-200"
                            disabled={loading}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleAddClient}
                            disabled={
                                loading || !newClient.name.trim() || !newClient.contact.trim()
                            }
                            className="bg-green-50 hover:bg-green-200"
                        >
                            {loading ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
