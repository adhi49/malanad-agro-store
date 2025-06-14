import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";
import { useCallback } from "react";

const OrderList = ({ ordersFetching = false, orderlist = [], handleEdit }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN");
  };

  const renderLoadingOrEmptySection = useCallback(() => {
    if (ordersFetching) {
      return <CircularProgress size={20} />;
    } else if (!orderlist?.length) return "No Data Found";
  }, [ordersFetching, orderlist]);

  return (
    <TableContainer component={Paper} sx={{ minWidth: 700 }} aria-label="customized table">
      <Table stickyHeader>
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
          {(ordersFetching || !orderlist?.length) && (
            <TableRow>
              <TableCell colSpan={10} sx={{ justifyContent: "center", textAlign: "center" }}>
                {renderLoadingOrEmptySection()}
              </TableCell>
            </TableRow>
          )}
          {orderlist?.length > 0 &&
            orderlist?.map((order) => (
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
                  <Button variant="outlined" size="small" onClick={() => handleEdit(order.id)}>
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
