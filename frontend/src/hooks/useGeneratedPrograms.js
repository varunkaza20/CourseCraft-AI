import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

export function useGeneratedPrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/programs/my-programs");
      setPrograms(res.data.programs);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load programs");
    } finally { 
      setLoading(false); 
    }
  };

  const generateProgram = async (formData) => {
    const res = await axiosInstance.post("/api/programs/generate", formData);
    return res.data.program;
  };

  const getProgramById = async (id) => {
    const res = await axiosInstance.get(`/api/programs/${id}`);
    return res.data.program;
  };

  const deleteProgram = async (id) => {
    await axiosInstance.delete(`/api/programs/${id}`);
    setPrograms(prev => prev.filter(p => p._id !== id));
  };

  useEffect(() => { 
    fetchPrograms(); 
  }, []);

  return {
    programs, loading, error,
    fetchPrograms, generateProgram,
    getProgramById, deleteProgram
  };
}
