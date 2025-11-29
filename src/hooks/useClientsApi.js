// hooks/useClientsApi.js
import fakeApi from "../data/fakeData";

export default function useClientsApi() {
  const getClients = async () => {
    return await fakeApi.clients.getAll();
  };

  return { getClients };
}
