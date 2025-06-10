import axios from 'axios'
import { data } from 'react-router-dom';
export const AddInventory = async (data) => {
    console.log("data getting in api", data);
    const response = await axios.post('http://localhost:5000/api/dashboard/inventory', data)
    console.log(response)
    return response.data
}

export const getInventory = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/dashboard/inventory');
        return response.data;
    } catch (error) {
        console.error('Fetch Error:', error);
    }
};

export const getInventoryById = async (id) => {
    try {
        const response = await axios.get(`http://localhost:5000/api/dashboard/inventory/${id}`);
        return response.data;
    } catch (error) {
        console.error('Get error:', error);
    }
};

export const updateInventory = async (id, data) => {
    try {
        const response = await axios.put(`http://localhost:5000/api/dashboard/inventory/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Update error:', error.response?.data || error.message);
    }
};

export const deleteInventory = async (id, data) => {
    try {
        const response = await axios.delete(`http://localhost:5000/api/dashboard/inventory/${id}`, data)
        return response.data
    } catch (error) {
        console.log('update error:', error)
    }
};

