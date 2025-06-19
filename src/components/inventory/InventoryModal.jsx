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

const categoryList = [
  { label: "Fertilizer", value: "Fertilizer" },
  { label: "Seeds", value: "Seeds" },
  { label: "Pesticides", value: "Pesticides" },
  { label: "Tools", value: "Tools" },
  { label: "Machine", value: "Machine" },
];
const rentItemList = ["Tools", "Machine"];

const InventoryModal = ({ isOpen, onClose, saveInventory, formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "category" && !rentItemList.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        inventoryType: "Sell",
      }));
    }
  };

  const handleOnsave = () => {
    saveInventory(formData);
  };

  const isRentItemSelected = rentItemList.includes(formData?.category);
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
              {categoryList.map((categoryItem) => {
                return <MenuItem value={categoryItem.value}>{categoryItem.label}</MenuItem>;
              })}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Inventory Type</InputLabel>
            <Select
              name="inventoryType"
              value={formData.inventoryType}
              onChange={handleChange}
              disabled={!isRentItemSelected}
            >
              <MenuItem value="Sell">Sell</MenuItem>
              {isRentItemSelected && <MenuItem value="Rent">Rent</MenuItem>}
            </Select>
          </FormControl>
          <TextField
            label="Item Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label={formData?.inventoryType === "Rent" ? "Rent Price (Per Day)" : "Selling Price"}
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
              <MenuItem value="count">Count</MenuItem> {/* For rent */}
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
