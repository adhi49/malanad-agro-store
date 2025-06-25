import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { useCallback } from "react";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { capitalizeFirst, formatDate, getFormatStatus } from "../../utils/commonFunc";

const OrderList = ({ ordersFetching = false, orderlist = [], handleEdit }) => {
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
            <TableCell>Type</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Order Total</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Order date</TableCell>
            <TableCell>Due date</TableCell>
            <TableCell>Payment</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Action</TableCell>
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
                <TableCell>{order.inventoryName}</TableCell>
                <TableCell>₹{order.price}</TableCell>
                <TableCell>{capitalizeFirst(order.orderType)}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>₹{order.price * order.quantity}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell sx={{ minWidth: 150 }}>{formatDate(order.createdAt)}</TableCell>
                <TableCell sx={{ minWidth: 150 }}>{formatDate(order.dueDateTime) ?? "--"}</TableCell>
                <TableCell>{getFormatStatus(order.paymentStatus)}</TableCell>
                <TableCell>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: 12,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      color: "#fff",
                      background:
                        order.orderStatus === "ORDER_CANCELLED"
                          ? "red"
                          : order.orderStatus === "ORDER_INPROGRESS"
                          ? "mediumseagreen"
                          : order.orderStatus === "ORDER_COMPLETED"
                          ? "green"
                          : "grey",
                      textWrap: "nowrap",
                    }}
                  >
                    {getFormatStatus(order.orderStatus)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <IconButton variant="contained" color="success" onClick={() => handleEdit(order.id)}>
                    <BorderColorIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OrderList;
