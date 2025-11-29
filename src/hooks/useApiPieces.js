import { useState, useEffect } from 'react';
import fakeApi from '../data/fakeData';

export default function useApiPieces() {
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all pieces from fake API
  const fetchPieces = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fakeApi.pieces.getAll();
      setPieces(data);
    } catch (err) {
      setError(err.message || 'Error fetching pieces');
    } finally {
      setLoading(false);
    }
  };

  // Add a new piece to fake API
  const addPiece = async (newPiece) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fakeApi.pieces.create(newPiece);
      // Update pieces list with newly added piece
      setPieces((prev) => [...prev, data]);
      return data;
    } catch (err) {
      setError(err.message || 'Error adding piece');
      throw err; // Re-throw to let UI handle it if needed
    } finally {
      setLoading(false);
    }
  };

  // Fetch pieces once on mount
  useEffect(() => {
    fetchPieces();
  }, []);

  return { pieces, loading, error, fetchPieces, addPiece };
}
