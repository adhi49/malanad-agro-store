import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import OrderList from '../components/Order/OrderList';
import OrderForm from '../components/Order/OrderForm';
import { getAllOrders, getOrderById } from '../Api/OrderApi';

const OrderPage = () => {
    const [Orderlist, setOrders] = useState([]);
    const [selectedOrder, setSelectOrder] = useState(null);
    useEffect(() => {
        fetchOrder();
    }, []);
    const fetchOrder = async () => {
        const result = await getAllOrders();
        setOrders(result?.data || []);
    };



    const handleEdit = async (id) => {
        const response = await getOrderById(id);
        if (response?.data) {
            setSelectOrder(response.data);
        }
    };
    return (
        <div>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3 }}>
                <Box sx={{ width: '50%', border: 1, padding: 2 }}>
                    <h2>Place New Order</h2>
                    <OrderForm onOrderPlaced={fetchOrder} editOrder={selectedOrder} />
                </Box>

                <Box sx={{ width: '50%', border: 1, padding: 2 }}>
                    <Typography variant="h6">All Orders</Typography>
                    <OrderList Orderlist={Orderlist} handleEdit={handleEdit} />
                </Box>
            </Box>


        </div>
    );
};

export default OrderPage;
