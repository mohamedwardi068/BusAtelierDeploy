import React, { useState } from "react";
import { UserPlus, User, Lock } from "lucide-react";
import fakeApi from "../data/fakeData";
import { useAuth } from "../hooks/useAuth";

const AddUserForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    role: "user", // optional
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fakeApi.users.create(formData);

      console.log("✅ Utilisateur ajouté:", res);
      alert("Utilisateur ajouté avec succès !");
      setFormData({ name: "", password: "", role: "user" }); // reset
    } catch (err) {
      console.error("❌ Erreur lors de l'ajout:", err.message);
      alert(err.message || "Erreur lors de l'ajout");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <UserPlus className="w-6 h-6 text-blue-600 mr-2" />
        <h1 className="text-2xl font-bold text-blue-800">Ajouter un utilisateur</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            <User className="w-4 h-4 inline mr-1" />
            Nom d'utilisateur
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-blue-100 rounded-md focus:ring-2 focus:ring-blue-400"
            placeholder="Nom"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            <Lock className="w-4 h-4 inline mr-1" />
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-blue-100 rounded-md focus:ring-2 focus:ring-blue-400"
            placeholder="Mot de passe"
          />
        </div>

        {/* Role (optional) */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Rôle
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-blue-100 rounded-md focus:ring-2 focus:ring-blue-400"
          >
            <option value="user">Utilisateur</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-all"
        >
          <UserPlus className="w-4 h-4 inline mr-2" />
          Ajouter l'utilisateur
        </button>
      </form>
    </div>
  );
};

export default AddUserForm;
