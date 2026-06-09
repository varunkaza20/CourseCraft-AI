import { useState, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";

export const useOutcomes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateCOs = useCallback(async (syllabusText) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post("/api/outcomes/generate-cos", { syllabusText });
      return response.data.courseOutcomes;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to generate Course Outcomes");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateMatrix = useCallback(async (courseOutcomes, programOutcomes) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post("/api/outcomes/generate-matrix", {
        courseOutcomes,
        programOutcomes,
      });
      return response.data.copoMatrix;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to generate Matrix");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveMapping = useCallback(async (mappingData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post("/api/outcomes/save", mappingData);
      return response.data.mapping;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save mapping");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMappingById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/outcomes/${id}`);
      return response.data.mapping;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch mapping");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    generateCOs,
    generateMatrix,
    saveMapping,
    getMappingById,
  };
};
