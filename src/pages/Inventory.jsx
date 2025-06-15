import { useEffect, useState } from "react";
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import InventoryModal from "../components/inventory/InventoryModal";
import { addInventory, deleteInventory, getInventory, getInventoryById, updateInventory } from "../api/inventory";
import InventoryList from "../components/inventory/InventoryList";
import { useAppContext } from "../AppContext";

const initialState = {
  inventoryName: "",
  category: "",
  price: "",
  unit: "",
  sourceCompany: "",
  availableQuantity: "",
  paymentStatus: "",
};

const Inventory = () => {
  const { showAlert } = useAppContext();
  const [formData, setFormData] = useState(initialState);
  const [isModalOpen, setModalOpen] = useState(false);
  const [dataList, setInventoryList] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchInventoryList = async () => {
    const result = await getInventory();
    setInventoryList(result?.data || []);
  };

  useEffect(() => {
    fetchInventoryList();
  }, []);

  const toggleModal = () => {
    setFormData(initialState);
    setModalOpen((prevState) => !prevState);
  };

  const saveInventory = async (data) => {
    try {
      const userPayload = {
        inventoryName: formData.inventoryName,
        category: formData.category,
        price: formData.price,
        unit: formData.unit,
        sourceCompany: formData.sourceCompany,
        availableQuantity: formData.availableQuantity,
        paymentStatus: formData.paymentStatus,
      };

      let response;

      if (formData.id) {
        response = await updateInventory(formData.id, userPayload);
      } else {
        response = await addInventory(userPayload);
      }
      showAlert({ message: response?.message });
      toggleModal();
      fetchInventoryList();
    } catch (error) {
      showAlert({
        message:
          "Failed to save inventory: " +
          (error.response?.message || error.response?.data?.message || error?.message || "Unknown error"),
        type: "error",
      });
    }
  };

  const handleGetInventory = async (id) => {
    const item = await getInventoryById(id);
    if (!item || !item.data) {
      showAlert({ message: `Item not found for Inventory ID: ${id}` });
      return;
    }
    setFormData({ ...item.data, id });
    setModalOpen(true);
  };

  const handleDeleteInventory = async (id) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        const response = await deleteInventory(itemToDelete);
        showAlert({ message: response?.message });
        fetchInventoryList();
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
      } catch (err) {
        showAlert({
          message: "Failed to delete inventory: " + (err.response?.data?.message || "Unknown error"),
          type: "error",
        });
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  return (
    <Box style={{ padding: 20 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Box />
        <Button variant="contained" onClick={() => setModalOpen(true)}>
          + Add New
        </Button>
      </Box>
      <InventoryList
        dataList={dataList}
        handleGetInventory={handleGetInventory}
        handleDeleteInventory={handleDeleteInventory}
      />
      <InventoryModal
        isOpen={isModalOpen}
        onClose={toggleModal}
        saveInventory={saveInventory}
        formData={formData}
        setFormData={setFormData}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={cancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;
