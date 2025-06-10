import axios from 'axios'

export const AddOrders = async (data) => {
    console.log("data getting in api", data);
    const response = await axios.post('http://localhost:5000/api/dashboard/orders', data)
    console.log(response)
    return response.data
}
export const getAllOrders = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/dashboard/orders');
        return response.data;
    } catch (error) {
        console.error('Fetch Error:', error);
    }
};
export const getOrderById = async (id) => {
    try {
        const response = await axios.get(`http://localhost:5000/api/dashboard/orders/${id}`);
        return response.data;
    } catch (error) {
        console.error('Get error:', error);
    }
};
export const updateOrder = async (id, data) => {
    try {
        const response = await axios.put(`http://localhost:5000/api/dashboard/orders/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Update error:', error.response?.data || error.message);
    }
};