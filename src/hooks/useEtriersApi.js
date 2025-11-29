import fakeApi from "../data/fakeData";

export default function useEtriersApi() {
  const getEtriers = async () => {
    return await fakeApi.etriers.getAll();
  }

  return { getEtriers }
}
