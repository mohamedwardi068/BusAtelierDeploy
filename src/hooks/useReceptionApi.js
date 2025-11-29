import { useCallback } from "react";
import fakeApi from "../data/fakeData";

export default function useReceptionApi() {
  const getAll = useCallback(() => fakeApi.receptions.getAll(), []);
  const getById = useCallback(id => fakeApi.receptions.getById(id), []);
  const create = useCallback(data => fakeApi.receptions.create(data), []);
  const updateEtat = useCallback((id, etat) =>
    fakeApi.receptions.updateEtat(id, etat), []);
  const updateExtra = useCallback((id, data) =>
    fakeApi.receptions.updateExtra(id, data), []);

  const remove = useCallback(id => fakeApi.receptions.delete(id), []);

  return {
    getAll,
    getById,
    create,
    updateEtat,
    updateExtra,
    remove,  // add delete function here
  };
}
