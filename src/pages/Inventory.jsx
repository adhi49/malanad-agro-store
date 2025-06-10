// InventoryForm.jsx
import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import InventoryModal from '../components/inventory/InventoryModal';
import { AddInventory, deleteInventory, getInventory, getInventoryById, updateInventory } from '../Api/InventoryApi';
import InventoryList from '../components/inventory/InventoryList';
import OrderPage from './OrderPage';
const initialState = {
    inventoryName: '',
    category: '',
    price: '',
    unit: '',
    sourceCompany: '',
    availableQuantity: '',
    paymentStatus: ''
}

const Inventory = () => {
    const [formData, setFormData] = useState(initialState)
    const [isModalOpen, setModalOpen] = useState(false);
    const [dataList, setInventoryList] = useState([])
    const fetchInventoryList = async () => {
        const result = await getInventory();
        setInventoryList(result?.data || []);
    };

    useEffect(() => {
        fetchInventoryList()
    }, [])
    const toggleModal = () => {
        setModalOpen(prevState => !prevState)
    }

    const saveInventory = async (data) => {
        try {
            const userPayload = {
                inventoryName: formData.inventoryName,
                category: formData.category,
                price: formData.price,
                unit: formData.unit,
                sourceCompany: formData.sourceCompany,
                availableQuantity: formData.availableQuantity,
                paymentStatus: formData.paymentStatus
            };

            let response;

            if (formData.id != null) {
                response = await updateInventory(formData.id, userPayload)
            } else {
                response = await AddInventory(userPayload);
            }
            alert(response.message);
            toggleModal();
            fetchInventoryList(); // Fetch updated list
        } catch (error) {
            console.error("AddInventory Error:", error.response?.data || error.message);
            alert("Failed to save inventory: " + (error.response?.data?.message || "Unknown error"));
        }
    };



    const handleGetInventory = async (id) => {
        const item = await getInventoryById(id);
        if (!item || !item.data) {
            console.warn('Item not found for ID:', id, item);
            return;
        }
        console.log('Item fetched:', item);
        setFormData({ ...item.data, id });
        setModalOpen(true); // Open modal after setting formData
    };
    const handleDeleteInventory = async (id) => {
        if (window.confirm('Are you sure you want to delete this item')) {
            const response = await deleteInventory(id)
            alert(response.message)
            fetchInventoryList()
        }

    }
    return (
        <div style={{ padding: 20 }}>
            <Button variant="contained" onClick={() => setModalOpen(true)}>
                + Add New Purchase Entry
            </Button>
            <InventoryList dataList={dataList} handleGetInventory={handleGetInventory} handleDeleteInventory={handleDeleteInventory} />
            <InventoryModal isOpen={isModalOpen} onClose={toggleModal} saveInventory={saveInventory} formData={formData} setFormData={setFormData} />




        </div>
    );
};

export default Inventory;

