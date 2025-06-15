import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
} from "@mui/material";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import DeleteIcon from "@mui/icons-material/Delete";

const InventoryList = ({ dataList, handleGetInventory, handleDeleteInventory }) => {
  const handleGet = (id) => {
    handleGetInventory(id);
  };
  const handleDelete = (id) => {
    handleDeleteInventory(id);
  };
  return (
    <TableContainer component={Paper} sx={{ minWidth: 700 }} aria-label="customized table">
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Inventory Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Unit</TableCell>
            <TableCell>Source</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Payment Status</TableCell>
            <TableCell align="center">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataList.map((inventory) => (
            <TableRow key={inventory.id}>
              <TableCell>{inventory.inventoryName}</TableCell>
              <TableCell>{inventory.category}</TableCell>
              <TableCell>{inventory.price}</TableCell>
              <TableCell>{inventory.unit}</TableCell>
              <TableCell>{inventory.sourceCompany}</TableCell>
              <TableCell>{inventory.availableQuantity}</TableCell>
              <TableCell>{inventory.paymentStatus}</TableCell>
              <TableCell>
                <Box display="flex">
                  <IconButton variant="contained" color="success" onClick={() => handleGet(inventory.id)}>
                    <BorderColorIcon />
                  </IconButton>
                  <IconButton variant="contained" color="error" onClick={() => handleDelete(inventory.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InventoryList;
