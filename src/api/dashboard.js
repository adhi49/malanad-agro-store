import axiosInstance from "./axiosInstance";

// 1. Total profit (last 30 days)
export const fetchTotalProfit = async () => {
  const response = await axiosInstance.get(`/dashboard/total-profit`);
  return response.data.totalProfit;
};

// 2. Total available inventories (no time filter)
export const fetchAvailableInventories = async () => {
  const response = await axiosInstance.get(`/dashboard/available-inventories`);
  return response.data.totalAvailable;
};

// 3. Total sold items (last 30 days)
export const fetchTotalSoldItems = async () => {
  const response = await axiosInstance.get(`/dashboard/total-sold`);
  return response.data.totalSold;
};

// 4. Total rented items (last 30 days)
export const fetchTotalRentedItems = async () => {
  const response = await axiosInstance.get(`/dashboard/total-rented`);
  return response.data.totalRented;
};

// 5. Total pending rent items (no time filter)
export const fetchPendingRentItems = async () => {
  const response = await axiosInstance.get(`/dashboard/pending-rents`);
  return response.data.pendingRents;
};

// 6. Total pending selled items (no time filter)
export const fetchPendingSales = async () => {
  const response = await axiosInstance.get(`/dashboard/total-pending-sales`);
  return response.data.pendingSales;
};
