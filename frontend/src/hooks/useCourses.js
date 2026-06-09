import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

export function useCourses() {
  const [courses, setCourses]        = useState([]);
  const [loadingCourses, setLoading] = useState(false);
  const [coursesError, setError]     = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/courses/my-courses");
      setCourses(res.data.courses);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const generateCourse = async (formData) => {
    const res = await axiosInstance.post("/api/courses/generate", formData);
    return res.data.course;
  };

  const getCourseById = async (id) => {
    const res = await axiosInstance.get(`/api/courses/${id}`);
    return res.data.course;
  };

  const deleteCourse = async (id) => {
    await axiosInstance.delete(`/api/courses/${id}`);
    setCourses(prev => prev.filter(c => c._id !== id));
  };

  useEffect(() => { fetchCourses(); }, []);

  return {
    courses, loadingCourses, coursesError,
    fetchCourses, generateCourse, getCourseById, deleteCourse
  };
}
