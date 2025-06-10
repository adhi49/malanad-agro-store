
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Box
} from '@mui/material';

const InventoryList = ({ dataList, handleGetInventory, handleDeleteInventory }) => {
    const handleGet = (id) => {
        handleGetInventory(id)
    }
    const handleDelete = (id) => {
        handleDeleteInventory(id)
    }
    return (
        <TableContainer component={Paper} sx={{ minWidth: 700 }} aria-label="customized table">
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Inventory Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Unit</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Available Quantity</TableCell>
                        <TableCell>Payment Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dataList.map((inventory, index) => (
                        <TableRow key={inventory.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{inventory.inventoryName}</TableCell>
                            <TableCell>{inventory.category}</TableCell>
                            <TableCell>{inventory.price}</TableCell>
                            <TableCell>{inventory.unit}</TableCell>
                            <TableCell>{inventory.sourceCompany}</TableCell>
                            <TableCell>{inventory.availableQuantity}</TableCell>
                            <TableCell>{inventory.paymentStatus}</TableCell>
                            <TableCell>
                                <Box display="flex" gap={1}>
                                    <Button variant="contained" onClick={() => handleGet(inventory.id)}>Edit</Button>
                                    <Button variant="contained" color="error" onClick={() => handleDelete(inventory.id)}>Delete</Button>
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
