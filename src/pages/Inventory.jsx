import { useEffect, useState } from "react";
import { Button, Box } from "@mui/material";
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
  const fetchInventoryList = async () => {
    const result = await getInventory();
    setInventoryList(result?.data || []);
  };

  useEffect(() => {
    fetchInventoryList();
  }, []);

  const toggleModal = () => {
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
      console.log("response", response);
      showAlert({ message: response?.message });
      toggleModal();
      fetchInventoryList(); // Fetch updated list
    } catch (error) {
      showAlert({
        message: "Failed to save inventory: " + (error.response?.message || "Unknown error"),
        type: "error",
      });
    }
  };

  const handleGetInventory = async (id) => {
    const item = await getInventoryById(id);
    if (!item || !item.data) {
      console.warn("Item not found for ID:", id, item);
      return;
    }
    console.log("Item fetched:", item);
    setFormData({ ...item.data, id });
    setModalOpen(true); // Open modal after setting formData
  };
  const handleDeleteInventory = async (id) => {
    if (window.confirm("Are you sure you want to delete this item")) {
      const response = await deleteInventory(id);
      alert(response.message);
      fetchInventoryList();
    }
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
    </Box>
  );
};

export default Inventory;
