import {
    Select, MenuItem, FormControl, InputLabel, TextField, DialogTitle,
    InputAdornment, FormLabel, FormControlLabel,
    RadioGroup, Radio, Box
} from '@mui/material';

const OrderField = ({ selectedOrder, handleSelect, isEdit, dataList, orderStatusDisabled }) => {
    return (
        <Box sx={{ width: '100%' }}>
            <DialogTitle>Product Details</DialogTitle>
            <FormControl size="small" sx={{ width: 250, mb: 4, marginLeft: 2 }}>
                <InputLabel id="item-label">Item</InputLabel>
                <Select name="Item" value={selectedOrder.Item} onChange={handleSelect} disabled={isEdit}>
                    {dataList?.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                            {item.inventoryName}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl sx={{ padding: 1, width: 230, marginLeft: 5 }}>
                <FormLabel>Type</FormLabel>
                <RadioGroup row name="Ordertype" value={selectedOrder.Ordertype} onChange={handleSelect}>
                    <FormControlLabel value="sell" control={<Radio disabled={isEdit} />} label="Sell" />
                    <FormControlLabel value="rent" control={<Radio disabled={isEdit} />} label="Rent" />
                </RadioGroup>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    sx={{ width: 250, marginLeft: 2, marginTop: 2 }}
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={selectedOrder.quantity}
                    onChange={handleSelect}
                    disabled={isEdit}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">{selectedOrder.unit}</InputAdornment>
                    }}
                    helperText={
                        selectedOrder.remainingQuantity !== undefined && selectedOrder.remainingQuantity !== null
                            ? `Available quantity is ${selectedOrder.remainingQuantity}`
                            : ''
                    }
                />
                <FormControl sx={{ width: 250, marginLeft: 3, marginTop: 2 }}>
                    <InputLabel>Payment Status</InputLabel>
                    <Select name="paymentstatus" value={selectedOrder.paymentstatus} onChange={handleSelect}>
                        <MenuItem value="PAYMENT_COMPLETED">Payment completed</MenuItem>
                        <MenuItem value="PAYMENT_PENDING">Payment pending</MenuItem>
                        <MenuItem value="PARTIALLY_PAID">Partially paid</MenuItem>
                        <MenuItem value="PAYMENT_FAILED">Payment failed</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <DialogTitle>Customer Details</DialogTitle>
            <TextField
                label="Customer Name"
                name="customername"
                value={selectedOrder.customername}
                onChange={handleSelect}
                sx={{ width: 250, marginLeft: 2, marginBottom: 2, padding: 1 }}
            />
            <TextField
                label="Phone Number"
                name="customerphone"
                type="number"
                value={selectedOrder.customerphone}
                onChange={handleSelect}
                sx={{ width: 250, marginLeft: 2, marginBottom: 2, padding: 1 }}
            />
            <TextField
                label="Location"
                name="customerlocation"
                value={selectedOrder.customerlocation}
                onChange={handleSelect}
                sx={{ width: 250, marginLeft: 2, marginBottom: 2, padding: 1 }}
            />

            <FormControl sx={{ width: 250, marginLeft: 3, marginTop: 1 }} disabled={orderStatusDisabled}>
                <InputLabel>Order Status</InputLabel>
                <Select name="orderstatus" value={selectedOrder.orderstatus} onChange={handleSelect}>
                    <MenuItem value="ORDER_PENDING">Order Pending</MenuItem>
                    <MenuItem value="ORDER_COMPLETED">Order Completed</MenuItem>
                    <MenuItem value="ORDER_INPROGRESS">Order In Progress</MenuItem>
                    <MenuItem value="ORDER_CANCELLED">Order Cancelled</MenuItem>
                </Select>
            </FormControl>


        </Box>
    )
}
export default OrderField;