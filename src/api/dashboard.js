import axios from "axios";

const API_BASE = "/api/dashboard";

// 1. Total profit (last 30 days)
export const fetchTotalProfit = async () => {
    const response = await axios.get(`${API_BASE}/total-profit`);
    return response.data.totalProfit;
};

// 2. Total available inventories (no time filter)
export const fetchAvailableInventories = async () => {
    const response = await axios.get(`${API_BASE}/available-inventories`);
    return response.data.totalAvailable;
};

// 3. Total sold items (last 30 days)
export const fetchTotalSoldItems = async () => {
    const response = await axios.get(`${API_BASE}/total-sold`);
    return response.data.totalSold;
};

// 4. Total rented items (last 30 days)
export const fetchTotalRentedItems = async () => {
    const response = await axios.get(`${API_BASE}/total-rented`);
    return response.data.totalRented;
};

// 5. Total pending rent items (no time filter)
export const fetchPendingRentItems = async () => {
    const response = await axios.get(`${API_BASE}/pending-rents`);
    return response.data.pendingRents;
};
