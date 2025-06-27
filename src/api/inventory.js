import axiosInstance from "./axiosInstance";

export const addInventory = async (data) => {
  const response = await axiosInstance.post("/dashboard/inventory", data);
  return response.data;
};

export const getInventory = async (page, size) => {
  try {
    const response = await axiosInstance.get(`/dashboard/inventory?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error("Fetch Error:", error);
  }
};

export const getInventoryById = async (id) => {
  try {
    const response = await axiosInstance.get(`/dashboard/inventory/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get error:", error);
  }
};

export const updateInventory = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/dashboard/inventory/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update error:", error.response?.data || error.message);
  }
};

export const deleteInventory = async (id, data) => {
  return await axiosInstance.delete(`/dashboard/inventory/${id}`, data);
};
