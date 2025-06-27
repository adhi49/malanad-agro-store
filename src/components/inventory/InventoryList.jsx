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
  Pagination,
} from "@mui/material";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import DeleteIcon from "@mui/icons-material/Delete";

const InventoryList = ({ dataList, handleGetInventory, handleDeleteInventory, page, totalPages, onPageChange, }) => {
  const handleGet = (id) => {
    handleGetInventory(id);
  };
  const handleDelete = (id) => {
    handleDeleteInventory(id);
  };

  const rowsPerPage = 10;
  const emptyRows = rowsPerPage - dataList.length;
  return (
    <Box >
      <TableContainer component={Paper} sx={{ backgroundColor: '#fff', borderRadius: '12px' }}>

        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#e3f2fd' }} >
              {['Inventory Name', 'Category', 'Inventory Type', 'Price', 'Sell/Rent Price', 'Unit', 'Source', 'Quantity', 'Payment Status', 'Actions'].map((head, index) => (
                <TableCell key={index} sx={{ fontWeight: 'bold', color: '#0d47a1' }}>
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {dataList.map((inventory) => (
              <TableRow key={inventory.id}>
                <TableCell>{inventory.inventoryName}</TableCell>
                <TableCell>{inventory.category}</TableCell>
                <TableCell>{inventory.inventoryType}</TableCell>
                <TableCell>{inventory.price}</TableCell>
                <TableCell>{inventory.sellOrRentPrice}</TableCell>
                <TableCell>{inventory.unit}</TableCell>
                <TableCell>{inventory.sourceCompany}</TableCell>
                <TableCell>{inventory.availableQuantity}</TableCell>
                <TableCell>{inventory.paymentStatus}</TableCell>
                <TableCell>
                  <Box display="flex">
                    <IconButton variant="contained" color="success" onClick={() => handleGet(inventory.id)}>
                      <BorderColorIcon fontSize="small" />
                    </IconButton>
                    <IconButton variant="contained" color="error" onClick={() => handleDelete(inventory.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {/* Fill empty rows to keep height fixed */}
            {emptyRows > 0 &&
              Array.from({ length: emptyRows }).map((_, idx) => (
                <TableRow key={`empty-${idx}`} style={{ height: 53 }}>
                  <TableCell colSpan={10} />
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" mt={2} mb={2}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={onPageChange}
          color="primary"
          shape="rounded"
        />
      </Box>
    </Box>

  );
};

export default InventoryList;
