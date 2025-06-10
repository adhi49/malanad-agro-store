import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button
} from '@mui/material';
import { useState } from 'react';

const OrderList = ({ Orderlist, handleEdit }) => {

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN');
    };


    return (
        <TableContainer component={Paper} sx={{ marginTop: 3 }}>
            <Typography variant="h6" sx={{ padding: 2 }}>Orders List</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Order Type</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Orderlist.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.inventoryname}</TableCell>
                            <TableCell>₹{order.price}</TableCell>
                            <TableCell>{order.ordertype}</TableCell>
                            <TableCell>{order.quantity}</TableCell>
                            <TableCell>₹{order.price * order.quantity}</TableCell>
                            <TableCell>{order.customername}</TableCell>
                            <TableCell>{formatDate(order.created_at)}</TableCell>
                            <TableCell>{order.paymentstatus}</TableCell>
                            <TableCell>{order.orderstatus}</TableCell>
                            <TableCell>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleEdit(order.id)}
                                >
                                    Edit
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default OrderList;
