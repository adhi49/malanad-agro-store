import axiosInstance from './axiosInstance';

export const addOrder = async (data) => {
    const response = await axiosInstance.post('/dashboard/orders', data)
    console.log(response)
    return response.data
}
export const getAllOrders = async () => {
    try {
        const response = await axiosInstance.get('/dashboard/orders');
        return response.data;
    } catch (error) {
        console.error('Fetch Error:', error);
    }
};
export const getOrderById = async (id) => {
    try {
        const response = await axiosInstance.get(`/dashboard/orders/${id}`);
        return response.data;
    } catch (error) {
        console.error('Get error:', error);
    }
};
export const updateOrder = async (id, data) => {
    try {
        const response = await axiosInstance.put(`/dashboard/orders/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Update error:', error.response?.data || error.message);
    }
};