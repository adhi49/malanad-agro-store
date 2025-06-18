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
  SELL: "Sell",
  RENT: "Rent",
};
// Form field configuration
const FORM_FIELDS = {
  PRODUCT: [
    { name: "orderType", label: "Order Type", type: "radio", required: true, disabled: "edit" },
    { name: "inventoryId", label: "Item", type: "select", required: true, disabled: "edit" },
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

    // eslint-disable-next-line default-case
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
const OrderFormModal = ({ isOpen, onClose, fetchAllOrders, orderData }) => {
  const { showAlert } = useAppContext();
  const [state, dispatch] = useReducer(orderFormReducer, initialState);
  const [inventoryList, setInventoryList] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const { validateField, validateForm } = useFormValidation();

  const isEdit = Boolean(orderData?.id);

  const orderType = state.formData?.orderType;

  // Memoized options for select fields
  const selectOptions = useMemo(() => {
    const filteredInventory = inventoryList.filter((item) =>
      orderType === "Sell"
        ? item.inventoryType === "Sell"
        : orderType === "Rent"
          ? item.inventoryType === "Rent"
          : true
    );

    return {
      inventoryId: filteredInventory.map((item) => ({
        value: item.id,
        label: item.inventoryName,
      })),
      paymentStatus: Object.entries(PAYMENT_STATUS).map(([key, value]) => ({
        value,
        label: value
          .split("_")
          .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
          .join(" "),
      })),
      orderStatus: Object.entries(ORDER_STATUS).map(([key, value]) => ({
        value,
        label: value
          .split("_")
          .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
          .join(" "),
      })),
    };
  }, [inventoryList, orderType]);


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
      showAlert?.({ message: "Failed to fetch inventory", type: "error" });
    } finally {
      setInventoryLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch remaining quantity for selected inventory
  const fetchRemainingQuantity = useCallback(async (inventoryId, invQuantity) => {
    dispatch({ type: "SET_LOADING", payload: { quantity: true } });
    try {
      const result = await fetchUsedQtyForInventory(inventoryId, invQuantity);
      return result?.availableQuantity || 0;
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
      if (isEdit && orderData) {
        const formData = {
          orderType: orderData.orderType || "",
          id: orderData.id,
          inventoryId: orderData.inventoryId || "",
          inventoryName: orderData.inventoryName || "",
          price: orderData.price || "",
          quantity: orderData.quantity || "",
          customerName: orderData.customerName || "",
          customerLocation: orderData.customerLocation || "",
          paymentStatus: orderData.paymentStatus || "",
          orderStatus: orderData.orderStatus || ORDER_STATUS.PENDING,
          customerPhone: orderData.customerPhone || "",
          unit: orderData.unit || "",
          remainingQuantity: orderData.remainingQuantity || null,
        };

        dispatch({
          type: "SET_EDIT_DATA",
          payload: {
            formData,
            orderStatusDisabled: orderData.paymentstatus?.toUpperCase() === PAYMENT_STATUS.PENDING,
          },
        });
      } else {
        dispatch({ type: "RESET_FORM" });
      }
    }
  }, [isOpen, isEdit, orderData, fetchInventory]);

  // Handle input changes
  const handleInputChange = useCallback(
    async (event) => {
      const { name, value: inventoryId } = event.target;

      // Clear field-specific errors
      dispatch({ type: "CLEAR_ERROR", payload: name });

      if (name === "inventoryId") {
        const selectedItem = inventoryList.find((item) => item.id === inventoryId);
        if (selectedItem) {
          const remainingQuantity = await fetchRemainingQuantity(inventoryId);
          dispatch({
            type: "SET_FORM_DATA",
            payload: {
              inventoryId,
              inventoryName: selectedItem.inventoryName,
              price: selectedItem.price,
              unit: selectedItem.unit,
              remainingQuantity,
            },
          });
        }
      } else if (name === "paymentStatus") {
        let newOrderStatus = ORDER_STATUS.INPROGRESS;
        let orderStatusDisabled = false;

        if (inventoryId === PAYMENT_STATUS.COMPLETED) {
          newOrderStatus = ORDER_STATUS.COMPLETED;
        } else if (inventoryId === PAYMENT_STATUS.PENDING) {
          newOrderStatus = ORDER_STATUS.PENDING;
          orderStatusDisabled = true;
        }

        dispatch({ type: "SET_ORDER_STATUS_DISABLED", payload: orderStatusDisabled });
        dispatch({
          type: "SET_FORM_DATA",
          payload: { [name]: inventoryId, orderStatus: newOrderStatus },
        });
      } else {
        dispatch({ type: "SET_FORM_DATA", payload: { [name]: inventoryId } });
      }

      // Real-time validation
      const fieldErrors = validateField(name, inventoryId, state.formData);
      if (Object.keys(fieldErrors).length > 0) {
        dispatch({ type: "SET_ERRORS", payload: fieldErrors });
      }
    },
    [inventoryList, fetchRemainingQuantity, validateField, state.formData]
  );

  const handleClose = useCallback(() => {
    dispatch({ type: "RESET_FORM" });
    onClose();
  }, [onClose]);

  // Handle form submission
  const handleSave = useCallback(async () => {
    const { isValid, errors } = validateForm(state.formData);

    if (!isValid) {
      dispatch({ type: "SET_ERRORS", payload: errors });
      // showAlert({ message: "Please fix the errors in the form", type: "error" });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: { form: true } });

    const payload = {
      orderType: state.formData.orderType,
      inventoryId: state.formData.inventoryId,
      inventoryName: state.formData.inventoryName,
      unit: state.formData.unit || "unit",
      price: state.formData.price,
      quantity: parseInt(state.formData.quantity),
      customerName: state.formData.customerName.trim(),
      customerLocation: state.formData.customerLocation.trim(),
      paymentStatus: state.formData.paymentStatus,
      orderStatus: state.formData.orderStatus,
      customerPhone: state.formData.customerPhone.replace(/\D/g, ""),
    };

    try {
      if (state.formData.id) {
        const res = await updateOrder(state.formData.id, payload);
        showAlert({ message: res.message, type: "success" });
      } else {
        const res = await addOrder(payload);
        showAlert({ message: res.message, type: "success" });
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
  }, [state.formData, validateForm, showAlert, fetchAllOrders, handleClose]);

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
      <DialogTitle>{isEdit ? "Update Order" : "Create Order"}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ p: 1 }}>
          {/* Product Details Section */}
          <DialogTitle sx={{ pl: 0, pb: 2 }}>Product Details</DialogTitle>
          <Grid>
            {/* First show only the orderType field */}
            {FORM_FIELDS.PRODUCT.filter((field) => field.name === "orderType").map((field) => (
              <Grid item xs={12} key={field.name}>
                {renderField(field)}
              </Grid>
            ))}
            <Grid container spacing={2} marginTop={2}>
              {/* Then show the rest of the product fields */}
              {FORM_FIELDS.PRODUCT.filter((field) => field.name !== "orderType").map((field) => (
                <Grid item xs={6} key={field.name}>
                  {renderField(field)}
                </Grid>
              ))}
            </Grid>
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
