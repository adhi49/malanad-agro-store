import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import OrderField from './OrderField';
import axios from 'axios';
import { getInventory } from '../../api/inventory';
import { addOrder, fetchUsedQtyForInventory, updateOrder } from '../../api/order';

const OrderState = {
    Item: '',
    inventoryId: null,
    price: '',
    Ordertype: '',
    quantity: '',
    customername: '',
    customerlocation: '',
    paymentstatus: '',
    orderstatus: "ORDER_PENDING",
    customerphone: '',
    unit: '',
    availableQuantity: ''
};

const OrderForm = ({ onOrderPlaced, editOrder, orders }) => {
    const isEdit = Boolean(editOrder?.id);
    const [dataList, setDataList] = useState([]);
    const [selectedOrder, setSelectOrder] = useState(OrderState);
    const [orderStatusDisabled, setOrderStatusDisabled] = useState(true);
    const [remainingQuantity, setRemainingQuantity] = useState(0)


    useEffect(() => {
        const fetchInventory = async () => {
            const result = await getInventory();
            setDataList(result?.data || []);
        };
        fetchInventory();
    }, []);


    useEffect(() => {
        if (isEdit && editOrder) {
            setSelectOrder({
                ...OrderState,
                id: editOrder.id,
                Item: editOrder.inventoryname || '',
                inventoryId: editOrder.inventoryid || null,
                price: editOrder.price || '',
                Ordertype: editOrder.ordertype || '',
                quantity: editOrder.quantity || '',
                customername: editOrder.customername || '',
                customerlocation: editOrder.customerlocation || '',
                paymentstatus: (editOrder.paymentstatus || '').toUpperCase(),
                orderstatus: editOrder.orderstatus || 'ORDER_PENDING',
                customerphone: editOrder.customerphone || '',
                unit: editOrder.unit || '',
                availableQuantity: editOrder.availableQuantity
            });
        }
    }, [isEdit, editOrder]);

    const fetchUsedInventory = async (item) => {
        try {
            await fetchUsedQtyForInventory(item.id, item.remainingQuantity);

            setSelectOrder(prev => ({
                ...prev,
                remainingQuantity
            }));
        } catch (err) {
            console.error("Error fetching used quantity:", err);
        }
    };

    const handleSelect = (e) => {
        const { name, value } = e.target;
        console.log("e.target", e.target)
        if (name === 'Item') {
            const selectedItem = dataList.find(item => item.id === value);
            setSelectOrder(prev => ({
                ...prev,
                Item: selectedItem.inventoryName,
                inventoryId: selectedItem.id,
                price: selectedItem.price,
                unit: selectedItem.unit,

            }));
            fetchUsedInventory(selectedItem);
        } else if (name === 'paymentstatus') {
            let orderstatus = 'ORDER_INPROGRESS';
            setOrderStatusDisabled(false);

            if (value === 'PAYMENT_COMPLETED') {
                orderstatus = 'ORDER_COMPLETED';
            }

            setSelectOrder(prev => ({
                ...prev,
                [name]: value,
                orderstatus: orderstatus
            }));
        } else {
            setSelectOrder(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handlesave = async () => {
        const {
            inventoryId, Item, price, Ordertype, quantity,
            customername, customerlocation, paymentstatus,
            customerphone, unit, orderstatus, id
        } = selectedOrder;

        if (!inventoryId || !Item || !Ordertype || !quantity || !customername ||
            !customerlocation || !paymentstatus || !customerphone) {
            alert("Please fill in all fields.");
            return;
        }

        const selectedInventory = dataList.find(item => item.id === inventoryId);
        if (!selectedInventory) {
            alert("Selected inventory not found.");
            return;
        }


        const payload = {
            inventoryid: inventoryId,
            inventoryname: Item,
            unit: unit || 'unit',
            ordertype: Ordertype,
            price: price,
            quantity: quantity,
            customername: customername,
            customerlocation: customerlocation,
            paymentstatus: paymentstatus.toLowerCase(),
            orderstatus: orderstatus,
            customerphone: customerphone
        };

        try {
            if (id) {
                await updateOrder(id, payload);
                alert("Order updated successfully!");
            } else {
                await addOrder(payload);
                alert("Order placed successfully!");
            }
            setSelectOrder(OrderState);
            setOrderStatusDisabled(true);
            onOrderPlaced(); // notify parent
        } catch (err) {
            console.error("Order error:", err);
            alert("Failed to save order.");
        }
    };

    return (
        <>
            <OrderField selectedOrder={selectedOrder} handleSelect={handleSelect} isEdit={isEdit} dataList={dataList} orderStatusDisabled={orderStatusDisabled} fetchUsedInventory={fetchUsedInventory} />

            <Button
                sx={{ width: 250, marginLeft: 2, marginBottom: 2, padding: 1, marginTop: 2 }}
                variant="contained"
                onClick={handlesave}
            >
                Save
            </Button>
        </>
    );
};

export default OrderForm;
