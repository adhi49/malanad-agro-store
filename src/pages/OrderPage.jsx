import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import OrderList from "../components/Order/OrderList";
import OrderFormModal from "../components/Order/OrderFormModal";
import { getAllOrders, getOrderById } from "../api/order";

const OrderPage = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [orderlist, setOrders] = useState([]);
  const [orderData, setSelectOrder] = useState(null);
  const [ordersFetching, setFetching] = useState(false);

  const handleCloseModal = () => {
    setSelectOrder(null);
    setModalOpen(false);
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    setFetching(true);
    const result = await getAllOrders();
    setFetching(false);
    setOrders(result?.data || []);
  };

  const handleEdit = async (id) => {
    const response = await getOrderById(id);
    if (response?.data) {
      setSelectOrder(response.data);
      setModalOpen(true);
    }
  };

  return (
    <Box style={{ padding: 20 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Box />
        <Button variant="contained" onClick={() => setModalOpen(true)}>
          + Add New
        </Button>
      </Box>
      <OrderFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        fetchAllOrders={fetchAllOrders}
        orderData={orderData}
      />
      <OrderList orderlist={orderlist} handleEdit={handleEdit} ordersFetching={ordersFetching} />
    </Box>
  );
};

export default OrderPage;
