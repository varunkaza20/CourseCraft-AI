import { useState, useEffect } from "react"
import axiosInstance from "../utils/axiosInstance"

export function usePrograms() {

  const [programs, setPrograms]           = useState([])
  const [loadingPrograms, setLoading]     = useState(false)
  const [programsError, setProgramsError] = useState(null)

  const fetchPrograms = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get(
        "/api/curriculum/my-programs"
      )
      setPrograms(res.data.programs)
    } catch (err) {
      setProgramsError(
        err.response?.data?.message || "Failed to load programs"
      )
    } finally {
      setLoading(false)
    }
  }

  const generateProgram = async (formData) => {
    const res = await axiosInstance.post(
      "/api/curriculum/generate", formData
    )
    return res.data.program
  }

  const fetchProgramById = async (id) => {
    const res = await axiosInstance.get(
      `/api/curriculum/${id}`
    )
    return res.data.program
  }

  const deleteProgram = async (id) => {
    await axiosInstance.delete(`/api/curriculum/${id}`)
    setPrograms(prev => prev.filter(p => p !== null && p._id !== id))
  }

  useEffect(() => { fetchPrograms() }, [])

  return {
    programs,
    loadingPrograms,
    programsError,
    fetchPrograms,
    generateProgram,
    fetchProgramById,
    deleteProgram
  }
}
