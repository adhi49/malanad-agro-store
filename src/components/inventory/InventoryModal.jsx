// components/InventoryModal.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

const InventoryModal = ({ isOpen, onClose, saveInventory, formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOnsave = () => {
    saveInventory(formData);
  };

  return (
    <Dialog open={isOpen} maxWidth="sm" fullWidth>
      <DialogTitle>Save Inventory</DialogTitle>
      <DialogContent dividers>
        <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <TextField
            label="Inventory Name"
            name="inventoryName"
            value={formData.inventoryName}
            onChange={handleChange}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select name="category" value={formData.category} onChange={handleChange}>
              <MenuItem value="Fertilizer">Fertilizer</MenuItem>
              <MenuItem value="Seeds">Seeds</MenuItem>
              <MenuItem value="Pesticides">Pesticides</MenuItem>
              <MenuItem value="Tools">Tools</MenuItem>
              <MenuItem value="Machine">Machine</MenuItem>

            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Inventory Type</InputLabel>
            <Select name="inventoryType" value={formData.inventoryType} onChange={handleChange}>
              <MenuItem value="Sell">Sell</MenuItem>
              <MenuItem value="Rent">Rent</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Selling Price"
            name="sellOrRentPrice"
            type="number"
            value={formData.sellOrRentPrice}
            onChange={handleChange}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Unit</InputLabel>
            <Select name="unit" value={formData.unit} onChange={handleChange}>
              <MenuItem value="kg">Kg</MenuItem>
              <MenuItem value="litre">Litre</MenuItem>
              <MenuItem value="packet">Packet</MenuItem>
              <MenuItem value="bottle">Bottle</MenuItem>
              <MenuItem value="watts">Watts</MenuItem>

            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Source Company</InputLabel>
            <Select name="sourceCompany" value={formData.sourceCompany} onChange={handleChange}>
              <MenuItem value="Own">Own</MenuItem>
              <MenuItem value="J J Power Tools">J J Power Tools</MenuItem>
              <MenuItem value="Madayikkan">Madayikkan</MenuItem>
              <MenuItem value="T stanes & company">T stanes & company</MenuItem>
              <MenuItem value="HI-5 Agricultural Equipment">HI-5 Agricultural Equipment</MenuItem>

            </Select>
          </FormControl>
          <TextField
            label="Available Quantity"
            name="availableQuantity"
            type="number"
            value={formData.availableQuantity}
            onChange={handleChange}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Payment Status</InputLabel>
            <Select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange}>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>cancel</Button>
        <Button onClick={handleOnsave}>save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryModal;
