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
  Box,
  FormHelperText,
} from "@mui/material";
import { useState } from "react";

const categoryList = [
  { label: "Fertilizer", value: "Fertilizer" },
  { label: "Seeds", value: "Seeds" },
  { label: "Pesticides", value: "Pesticides" },
  { label: "Tools", value: "Tools" },
  { label: "Machine", value: "Machine" },
  { label: "Agriculture Chemicals", value: "Agriculture Chemicals" },

];

const rentItemList = ["Tools", "Machine"];

const validateForm = (data) => {
  const errors = {};
  if (!data.inventoryName) {
    errors["inventoryName"] = "Inventory name is required";
  }
  if (!data.category) {
    errors["category"] = "Category is required";
  }
  if (!data.inventoryType) {
    errors["inventoryType"] = "Inventory type is required";
  }
  if (!data.unit) {
    errors["unit"] = "Unit is required";
  }
  if (!data.availableQuantity) {
    errors["availableQuantity"] = "Available quantity is required";
  }
  if (!data.price) {
    errors["price"] = "Price is required";
  }
  if (!data.sellOrRentPrice) {
    errors["sellOrRentPrice"] = `${data.inventoryType === "Rent" ? "Rent" : "Selling"} price is required`;
  }
  return errors;
};

const InventoryModal = ({ isOpen, onClose, saveInventory, formData, setFormData }) => {
  const [errors, setErrors] = useState({});
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
    const erros = validateForm(formData);
    if (!Object.keys(erros).length) {
      saveInventory(formData);
    } else {
      setErrors(erros);
    }
  };

  const isRentItemSelected = rentItemList.includes(formData?.category);

  // Form fields array
  const formFields = [
    {
      name: "inventoryName",
      label: "Inventory Name",
      type: "textfield",
      value: formData.inventoryName,
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      value: formData.category,
      options: categoryList,
    },
    {
      name: "inventoryType",
      label: "Inventory Type",
      type: "select",
      value: formData.inventoryType,
      disabled: !isRentItemSelected,
      options: [{ label: "Sell", value: "Sell" }, ...(isRentItemSelected ? [{ label: "Rent", value: "Rent" }] : [])],
    },
    {
      name: "unit",
      label: "Unit",
      type: "select",
      value: formData.unit,
      options: [
        { label: "Kg", value: "Kg" },
        { label: "Litre", value: "Litre" },
        { label: "Packet", value: "Packet" },
        { label: "Bottle", value: "Bottle" },
        { label: "Watts", value: "Watts" },
        { label: "Count", value: "Count" },
      ],
    },
    {
      name: "price",
      label: `Item Price ${formData?.unit || ""}`,
      type: "textfield",
      inputType: "number",
      value: formData.price,
      disabled: !formData?.unit,
    },
    {
      name: "availableQuantity",
      label: "Available Quantity",
      type: "textfield",
      inputType: "number",
      value: formData.availableQuantity,
    },
    {
      name: "sellOrRentPrice",
      label:
        formData?.inventoryType === "Rent" ? "Rent Price (Per Day)" : `Selling Price (Per ${formData?.unit || ""})`,
      type: "textfield",
      inputType: "number",
      value: formData.sellOrRentPrice,
      disabled: !formData?.unit,
    },
    {
      name: "sourceCompany",
      label: "Source Company",
      type: "select",
      value: formData.sourceCompany,
      options: [
        { label: "Own", value: "Own" },
        { label: "J J Power Tools", value: "J J Power Tools" },
        { label: "Madayikkan", value: "Madayikkan" },
        { label: "T stanes & company", value: "T stanes & company" },
        { label: "HI-5 Agricultural Equipment", value: "HI-5 Agricultural Equipment" },
      ],
    },
    {
      name: "paymentStatus",
      label: "Payment Status",
      type: "select",
      value: formData.paymentStatus,
      options: [
        { label: "Paid", value: "Paid" },
        { label: "Pending", value: "Pending" },
      ],
    },
  ];

  const renderField = (field) => {
    const commonProps = {
      name: field.name,
      value: field.value || "",
      onChange: handleChange,
      fullWidth: true,
      disabled: field.disabled || false,
    };

    const errorText = errors?.[field?.name];

    if (field.type === "textfield") {
      return (
        <FormControl fullWidth>
          <TextField
            {...commonProps}
            label={field.label}
            type={field.inputType || "text"}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
          {errorText && <FormHelperText sx={{ color: "#d32f2f", pl: 0, ml: 0 }}>{errorText}</FormHelperText>}
        </FormControl>
      );
    }

    if (field.type === "select") {
      return (
        <FormControl fullWidth disabled={field?.disabled}>
          <InputLabel shrink>{field.label}</InputLabel>
          <Select {...commonProps} label={field.label} notched>
            {field.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {!field?.disabled && errorText && (
            <FormHelperText sx={{ color: "#d32f2f", pl: 0, ml: 0 }}>{errorText}</FormHelperText>
          )}
        </FormControl>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Save Inventory</DialogTitle>
      <DialogContent dividers>
        {formFields.map((field) => (
          <Box sx={{ my: 3 }} key={field.name}>
            {renderField(field)}
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleOnsave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryModal;
