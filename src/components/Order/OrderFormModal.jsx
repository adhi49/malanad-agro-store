import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  InputAdornment,
  Box,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useEffect, useState, useCallback, useMemo, useReducer } from "react";
import { getInventory } from "../../api/inventory";
import { addOrder, fetchUsedQtyForInventory, updateOrder } from "../../api/order";
import { useAppContext } from "../../AppContext";
import SelectField from "../common/SelectField";
import RadioField from "../common/RadioField";
import TextFieldComponent from "../common/TextField";

// Constants
const ORDER_STATUS = {
  PENDING: "ORDER_PENDING",
  INPROGRESS: "ORDER_INPROGRESS",
  COMPLETED: "ORDER_COMPLETED",
  CANCELLED: "ORDER_CANCELLED",
};

const PAYMENT_STATUS = {
  COMPLETED: "PAYMENT_COMPLETED",
  PENDING: "PAYMENT_PENDING",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  FAILED: "PAYMENT_FAILED",
};

const ORDER_TYPES = {
  SELL: "sell",
  RENT: "rent",
};

// Form field configuration
const FORM_FIELDS = {
  PRODUCT: [
    { name: "inventoryId", label: "Item", type: "select", required: true, disabled: "edit" },
    { name: "orderType", label: "Order Type", type: "radio", required: true, disabled: "edit" },
    { name: "quantity", label: "Quantity", type: "number", required: true, disabled: "edit" },
    { name: "paymentStatus", label: "Payment Status", type: "select", required: true },
  ],
  CUSTOMER: [
    { name: "customerName", label: "Customer Name", type: "text", required: true },
    { name: "customerPhone", label: "Phone Number", type: "tel", required: true },
    { name: "customerLocation", label: "Location", type: "text", required: true },
    { name: "orderStatus", label: "Order Status", type: "select", required: false },
  ],
};

// Initial state
const initialState = {
  formData: {
    inventoryId: "",
    inventoryName: "",
    price: "",
    orderType: "",
    quantity: "",
    customerName: "",
    customerLocation: "",
    paymentStatus: "",
    orderStatus: ORDER_STATUS.PENDING,
    customerPhone: "",
    unit: "",
    remainingQuantity: null,
  },
  loading: {
    form: false,
    quantity: false,
  },
  errors: {},
  orderStatusDisabled: true,
};

// Reducer for complex state management
const orderFormReducer = (state, action) => {
  switch (action.type) {
    case "SET_FORM_DATA":
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: { ...state.loading, ...action.payload },
      };
    case "SET_ERRORS":
      return {
        ...state,
        errors: { ...state.errors, ...action.payload },
      };
    case "CLEAR_ERROR":
      const { [action.payload]: removed, ...restErrors } = state.errors;
      return {
        ...state,
        errors: restErrors,
      };
    case "SET_ORDER_STATUS_DISABLED":
      return {
        ...state,
        orderStatusDisabled: action.payload,
      };
    case "RESET_FORM":
      return initialState;
    case "SET_EDIT_DATA":
      return {
        ...state,
        formData: action.payload.formData,
        orderStatusDisabled: action.payload.orderStatusDisabled,
      };
    default:
      return state;
  }
};

// Custom hook for form validation
const useFormValidation = () => {
  const validateField = useCallback((name, value, formData) => {
    const errors = {};

    switch (name) {
      case "customerPhone":
        if (value && !/^\d{10,15}$/.test(value.replace(/\D/g, ""))) {
          errors[name] = "Please enter a valid phone number (10-15 digits)";
        }
        break;
      case "quantity":
        if (value && formData.remainingQuantity !== null && parseInt(value) > formData.remainingQuantity) {
          errors[name] = "Quantity cannot exceed available quantity";
        }
        if (value && parseInt(value) <= 0) {
          errors[name] = "Quantity must be greater than 0";
        }
        break;
      case "customerName":
        if (value && value.trim().length < 2) {
          errors[name] = "Name must be at least 2 characters";
        }
        break;
      case "customerLocation":
        if (value && value.trim().length < 3) {
          errors[name] = "Location must be at least 3 characters";
        }
        break;
    }

    return errors;
  }, []);

  const validateForm = useCallback(
    (formData) => {
      const requiredFields = [
        "inventoryId",
        "orderType",
        "quantity",
        "customerName",
        "customerLocation",
        "paymentStatus",
        "customerPhone",
      ];
      const errors = {};

      requiredFields.forEach((field) => {
        if (!formData[field] || (typeof formData[field] === "string" && !formData[field].trim())) {
          errors[field] = `${field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()
            .replace(/^\w/, (c) => c.toUpperCase())} is required`;
        }
      });

      // Additional validations
      Object.keys(formData).forEach((field) => {
        const fieldErrors = validateField(field, formData[field], formData);
        Object.assign(errors, fieldErrors);
      });

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      };
    },
    [validateField]
  );

  return { validateField, validateForm };
};

// Main component
const OrderFormModal = ({ isOpen, onClose, fetchAllOrders, editOrder }) => {
  const { showAlert } = useAppContext();
  const [state, dispatch] = useReducer(orderFormReducer, initialState);
  const [inventoryList, setInventoryList] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const { validateField, validateForm } = useFormValidation();

  const isEdit = Boolean(editOrder?.id);

  // Memoized options for select fields
  const selectOptions = useMemo(
    () => ({
      inventoryId: inventoryList.map((item) => ({
        value: item.id,
        label: item.inventoryName,
      })),
      paymentStatus: Object.entries(PAYMENT_STATUS).map(([key, value]) => ({
        value,
        label: key
          .split("_")
          .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
          .join(" "),
      })),
      orderStatus: Object.entries(ORDER_STATUS).map(([key, value]) => ({
        value,
        label: key
          .split("_")
          .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
          .join(" "),
      })),
    }),
    [inventoryList]
  );

  const radioOptions = useMemo(
    () => ({
      orderType: Object.entries(ORDER_TYPES).map(([key, value]) => ({
        value,
        label: key.charAt(0) + key.slice(1).toLowerCase(),
      })),
    }),
    []
  );

  // Fetch inventory data
  const fetchInventory = useCallback(async () => {
    setInventoryLoading(true);
    try {
      const result = await getInventory();
      setInventoryList(result?.data || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      showAlert({ message: "Failed to fetch inventory", type: "error" });
    } finally {
      setInventoryLoading(false);
    }
  }, [showAlert]);

  // Fetch remaining quantity for selected inventory
  const fetchRemainingQuantity = useCallback(async (inventoryId) => {
    dispatch({ type: "SET_LOADING", payload: { quantity: true } });
    try {
      const result = await fetchUsedQtyForInventory(inventoryId);
      return result?.remainingQuantity || 0;
    } catch (error) {
      console.error("Error fetching remaining quantity:", error);
      return 0;
    } finally {
      dispatch({ type: "SET_LOADING", payload: { quantity: false } });
    }
  }, []);

  // Initialize form
  useEffect(() => {
    if (isOpen) {
      fetchInventory();
      if (isEdit && editOrder) {
        const formData = {
          id: editOrder.id,
          inventoryId: editOrder.inventoryid || "",
          inventoryName: editOrder.inventoryname || "",
          price: editOrder.price || "",
          orderType: editOrder.ordertype || "",
          quantity: editOrder.quantity || "",
          customerName: editOrder.customername || "",
          customerLocation: editOrder.customerlocation || "",
          paymentStatus: (editOrder.paymentstatus || "").toUpperCase(),
          orderStatus: editOrder.orderstatus || ORDER_STATUS.PENDING,
          customerPhone: editOrder.customerphone || "",
          unit: editOrder.unit || "",
          remainingQuantity: editOrder.remainingQuantity || null,
        };

        dispatch({
          type: "SET_EDIT_DATA",
          payload: {
            formData,
            orderStatusDisabled: editOrder.paymentstatus?.toUpperCase() === PAYMENT_STATUS.PENDING,
          },
        });
      } else {
        dispatch({ type: "RESET_FORM" });
      }
    }
  }, [isOpen, isEdit, editOrder, fetchInventory]);

  // Handle input changes
  const handleInputChange = useCallback(
    async (event) => {
      const { name, value } = event.target;

      // Clear field-specific errors
      dispatch({ type: "CLEAR_ERROR", payload: name });

      if (name === "inventoryId") {
        const selectedItem = inventoryList.find((item) => item.id === value);
        if (selectedItem) {
          const remainingQty = await fetchRemainingQuantity(value);
          dispatch({
            type: "SET_FORM_DATA",
            payload: {
              inventoryId: value,
              inventoryName: selectedItem.inventoryName,
              price: selectedItem.price,
              unit: selectedItem.unit,
              remainingQuantity: remainingQty,
            },
          });
        }
      } else if (name === "paymentStatus") {
        let newOrderStatus = ORDER_STATUS.INPROGRESS;
        let orderStatusDisabled = false;

        if (value === PAYMENT_STATUS.COMPLETED) {
          newOrderStatus = ORDER_STATUS.COMPLETED;
        } else if (value === PAYMENT_STATUS.PENDING) {
          newOrderStatus = ORDER_STATUS.PENDING;
          orderStatusDisabled = true;
        }

        dispatch({ type: "SET_ORDER_STATUS_DISABLED", payload: orderStatusDisabled });
        dispatch({
          type: "SET_FORM_DATA",
          payload: { [name]: value, orderStatus: newOrderStatus },
        });
      } else {
        dispatch({ type: "SET_FORM_DATA", payload: { [name]: value } });
      }

      // Real-time validation
      const fieldErrors = validateField(name, value, state.formData);
      if (Object.keys(fieldErrors).length > 0) {
        dispatch({ type: "SET_ERRORS", payload: fieldErrors });
      }
    },
    [inventoryList, fetchRemainingQuantity, validateField, state.formData]
  );

  // Handle form submission
  const handleSave = useCallback(async () => {
    const { isValid, errors } = validateForm(state.formData);

    if (!isValid) {
      dispatch({ type: "SET_ERRORS", payload: errors });
      showAlert({ message: "Please fix the errors in the form", type: "error" });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: { form: true } });

    const payload = {
      inventoryid: state.formData.inventoryId,
      inventoryname: state.formData.inventoryName,
      unit: state.formData.unit || "unit",
      ordertype: state.formData.orderType,
      price: state.formData.price,
      quantity: parseInt(state.formData.quantity),
      customername: state.formData.customerName.trim(),
      customerlocation: state.formData.customerLocation.trim(),
      paymentstatus: state.formData.paymentStatus.toLowerCase(),
      orderstatus: state.formData.orderStatus,
      customerphone: state.formData.customerPhone.replace(/\D/g, ""),
    };

    try {
      if (state.formData.id) {
        await updateOrder(state.formData.id, payload);
        showAlert({ message: "Order updated successfully!", type: "success" });
      } else {
        await addOrder(payload);
        showAlert({ message: "Order created successfully!", type: "success" });
      }

      handleClose();
      fetchAllOrders();
    } catch (error) {
      console.error("Order error:", error);
      showAlert({
        message: error.response?.data?.message || "Failed to save order",
        type: "error",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: { form: false } });
    }
  }, [state.formData, validateForm, showAlert, fetchAllOrders]);

  const handleClose = useCallback(() => {
    dispatch({ type: "RESET_FORM" });
    onClose();
  }, [onClose]);

  const renderField = useCallback(
    (field) => {
      const { name, label, type, required, disabled } = field;
      const isDisabled = disabled === "edit" ? isEdit : false;
      const value = state.formData[name] || "";
      const error = state.errors[name];

      const commonProps = {
        name,
        label,
        value,
        onChange: handleInputChange,
        disabled: isDisabled,
        required,
        error,
      };

      switch (type) {
        case "select":
          return (
            <SelectField
              {...commonProps}
              options={selectOptions[name] || []}
              disabled={isDisabled || (name === "orderStatus" && state.orderStatusDisabled)}
            />
          );
        case "radio":
          return <RadioField {...commonProps} options={radioOptions[name] || []} />;
        case "number":
          return (
            <TextFieldComponent
              {...commonProps}
              type="number"
              endAdornment={
                name === "quantity" && state.formData.unit ? (
                  <InputAdornment position="end">{state.formData.unit}</InputAdornment>
                ) : undefined
              }
              helperText={
                name === "quantity" && state.formData.remainingQuantity !== null
                  ? `Available: ${state.formData.remainingQuantity} ${state.formData.unit || "units"}`
                  : undefined
              }
            />
          );
        default:
          return <TextFieldComponent {...commonProps} type={type} />;
      }
    },
    [state, isEdit, handleInputChange, selectOptions, radioOptions]
  );

  if (inventoryLoading) {
    return (
      <Dialog open={isOpen} maxWidth="md" fullWidth>
        <DialogContent sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? "Edit Order" : "Create New Order"}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ p: 2 }}>
          {/* Product Details Section */}
          <DialogTitle sx={{ pl: 0, pb: 2 }}>Product Details</DialogTitle>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {FORM_FIELDS.PRODUCT.map((field) => (
              <Grid item xs={12} sm={4} key={field.name}>
                {renderField(field)}
              </Grid>
            ))}
          </Grid>

          {/* Customer Details Section */}
          <DialogTitle sx={{ pl: 0, pb: 2 }}>Customer Details</DialogTitle>
          <Grid container spacing={2}>
            {FORM_FIELDS.CUSTOMER.map((field) => (
              <Grid item xs={12} sm={6} key={field.name}>
                {renderField(field)}
              </Grid>
            ))}
          </Grid>

          {/* Display loading state for quantity fetch */}
          {state.loading.quantity && (
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>Fetching available quantity...</Box>
            </Box>
          )}

          {/* Display errors */}
          {Object.keys(state.errors).length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Please fix the errors above before submitting
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={state.loading.form}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={state.loading.form}
          startIcon={state.loading.form ? <CircularProgress size={16} /> : null}
        >
          {state.loading.form ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderFormModal;
