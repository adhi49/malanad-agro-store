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
  FormControl,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { getInventory } from "../../api/inventory";
import { addOrder, fetchUsedQtyForInventory, updateOrder } from "../../api/order";
import { useAppContext } from "../../AppContext";
import SelectField from "../common/SelectField";
import RadioField from "../common/RadioField";
import TextFieldComponent from "../common/TextField";
import "react-datepicker/dist/react-datepicker.css";
import DateTimePicker from "../common/DateTimePicker";
import { getFormatStatus } from "../../utils/commonFunc";

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

// Helper function to calculate rental price
const calculateRentalPrice = (sellOrRentPrice, dueDateTime) => {
  if (!sellOrRentPrice || !dueDateTime) return 0;

  const now = new Date();
  const due = new Date(dueDateTime);

  const diffMs = due.getTime() - now.getTime();

  if (diffMs <= 0) return 0;

  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours >= 24) {
    const diffDays = Math.ceil(diffHours / 24);
    return sellOrRentPrice * diffDays;
  } else {
    const hourlyRate = sellOrRentPrice / 24;
    const hours = Math.ceil(diffHours);
    return hourlyRate * hours;
  }
};

const getPriceBreakdown = (sellOrRentPrice, dueDateTime, orderType) => {
  if (orderType !== ORDER_TYPES.RENT || !sellOrRentPrice || !dueDateTime) return "";

  const now = new Date();
  const due = new Date(dueDateTime);
  const diffMs = due.getTime() - now.getTime();

  if (diffMs <= 0) return "Due date must be in the future";

  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours >= 24) {
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} × ₹${sellOrRentPrice}/day`;
  } else {
    const hourlyRate = (sellOrRentPrice / 24).toFixed(2);
    const hours = Math.ceil(diffHours);
    return `${hours} hour${hours > 1 ? "s" : ""} × ₹${hourlyRate}/hour`;
  }
};

const validateForm = (formData) => {
  const errors = {};

  const requiredFields = [
    "inventoryId",
    "orderType",
    "quantity",
    "customerName",
    "customerLocation",
    "paymentStatus",
    "customerPhone",
    ...(formData?.orderType === ORDER_TYPES.RENT ? ["dueDateTime"] : []),
  ];

  requiredFields.forEach((field) => {
    if (!formData[field] || (typeof formData[field] === "string" && !formData[field].trim())) {
      errors[field] = `${field
        .replace(/([A-Z])/g, " $1")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())} is required`;
    }
  });

  if (formData.customerPhone && !/^\d{10,15}$/.test(formData.customerPhone.replace(/\D/g, ""))) {
    errors.customerPhone = "Please enter a valid phone number (10-15 digits)";
  }

  if (
    formData.quantity &&
    formData.remainingQuantity !== null &&
    parseInt(formData.quantity) > formData.remainingQuantity
  ) {
    errors.quantity = "Quantity cannot exceed available quantity";
  }
  if (formData.quantity && parseInt(formData.quantity) <= 0) {
    errors.quantity = "Quantity must be greater than 0";
  }

  if (formData.customerName && formData.customerName.trim().length < 2) {
    errors.customerName = "Name must be at least 2 characters";
  }

  if (formData.customerLocation && formData.customerLocation.trim().length < 3) {
    errors.customerLocation = "Location must be at least 3 characters";
  }

  if (formData?.orderType === ORDER_TYPES.RENT && !formData.dueDateTime) {
    errors.dueDateTime = "Due date & time is required";
  }

  if (formData?.orderType === ORDER_TYPES.RENT && formData.dueDateTime) {
    const now = new Date();
    const due = new Date(formData.dueDateTime);
    if (due.getTime() <= now.getTime()) {
      errors.dueDateTime = "Due date & time must be in the future";
    }
  }

  return errors;
};

const initialState = {
  inventoryId: "",
  inventoryName: "",
  sellOrRentPrice: "",
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
  dueDateTime: null,
};

const OrderFormModal = ({ isOpen, onClose, fetchAllOrders, orderData }) => {
  const { showAlert } = useAppContext();
  const [inventoryList, setInventoryList] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [quantityLoading, setQuantityLoading] = useState(false);
  const [orderStatusDisabled, setOrderStatusDisabled] = useState(true);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState(initialState);

  const isEdit = Boolean(orderData?.id);

  const getFormFields = () => {
    const validTypes = new Set([ORDER_TYPES.SELL, ORDER_TYPES.RENT]);
    const filteredInventory = inventoryList.filter((item) =>
      validTypes.has(formData.orderType) ? item.inventoryType === formData.orderType : false
    );

    return [
      // Product Details
      {
        section: "Product Details",
        fields: [
          {
            name: "orderType",
            label: "Order Type",
            type: "radio",
            required: true,
            disabled: isEdit,
            options: Object.entries(ORDER_TYPES).map(([key, value]) => ({
              value,
              label: key.charAt(0) + key.slice(1).toLowerCase(),
            })),
            fullWidth: true,
          },
          {
            name: "inventoryId",
            label: "Item",
            type: "select",
            required: true,
            disabled: isEdit,
            options: filteredInventory.map((item) => ({
              value: item.id,
              label: item.inventoryName,
            })),
          },
          {
            name: "quantity",
            label: "Quantity",
            type: "number",
            required: true,
            disabled: isEdit,
            endAdornment: formData.unit ? <InputAdornment position="end">{formData.unit}</InputAdornment> : undefined,
            helperText:
              formData?.inventoryId && formData.remainingQuantity !== null
                ? `Available: ${formData?.remainingQuantity} ${formData.unit || "units"}`
                : undefined,
          },
          {
            name: "dueDateTime",
            label: "Due Date & Time",
            type: "date",
            value: formData?.dueDateTime || null,
            required: formData.orderType === ORDER_TYPES.RENT,
            show: formData.orderType === ORDER_TYPES.RENT,
          },
          {
            name: "price",
            label: "Total Price",
            type: "text",
            required: false,
            disabled: true,
            value: formData?.price ? `₹${formData.price * (formData?.quantity || 1)}` : "",
            helperText:
              formData.orderType === ORDER_TYPES.RENT && formData.sellOrRentPrice && formData.dueDateTime
                ? getPriceBreakdown(formData.sellOrRentPrice, formData.dueDateTime, formData.orderType)
                : formData.orderType === ORDER_TYPES.SELL && formData.sellOrRentPrice
                ? `Price per ${formData.unit || "unit"}: ₹${formData.sellOrRentPrice}`
                : undefined,
          },
          {
            name: "paymentStatus",
            label: "Payment Status",
            type: "select",
            required: true,
            options: Object.entries(PAYMENT_STATUS).map(([key, value]) => ({
              value,
              label: getFormatStatus(value),
            })),
          },
        ],
      },
      // Customer Details
      {
        section: "Customer Details",
        fields: [
          {
            name: "customerName",
            label: "Customer Name",
            type: "text",
            required: true,
          },
          {
            name: "customerPhone",
            label: "Phone Number",
            type: "tel",
            required: true,
          },
          {
            name: "customerLocation",
            label: "Location",
            type: "text",
            required: true,
          },
          {
            name: "orderStatus",
            label: "Order Status",
            type: "select",
            required: false,
            disabled: orderStatusDisabled,
            options: Object.entries(ORDER_STATUS).map(([key, value]) => ({
              value,
              label: getFormatStatus(value),
            })),
          },
        ],
      },
    ];
  };

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
  }, [showAlert]);

  const fetchRemainingQuantity = async (inventoryId, invQuantity) => {
    setQuantityLoading(true);
    try {
      const result = await fetchUsedQtyForInventory(inventoryId, invQuantity);
      return result?.availableQuantity || 0;
    } catch (error) {
      console.error("Error fetching remaining quantity:", error);
      return 0;
    } finally {
      setQuantityLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInventory();
      if (isEdit && orderData) {
        setFormData({
          orderType: orderData.orderType || "",
          id: orderData.id,
          inventoryId: orderData.inventoryId || "",
          inventoryName: orderData.inventoryName || "",
          sellOrRentPrice: orderData.sellOrRentPrice || "",
          price: orderData.price || "",
          quantity: orderData.quantity || "",
          customerName: orderData.customerName || "",
          customerLocation: orderData.customerLocation || "",
          paymentStatus: orderData.paymentStatus || "",
          orderStatus: orderData.orderStatus || ORDER_STATUS.PENDING,
          customerPhone: orderData.customerPhone || "",
          unit: orderData.unit || "",
          remainingQuantity: orderData.remainingQuantity || null,
          dueDateTime: new Date(orderData?.dueDateTime || null),
        });
        setOrderStatusDisabled(orderData?.paymentstatus?.toUpperCase() === PAYMENT_STATUS.PENDING);
      } else {
        setFormData({ ...initialState });
        setOrderStatusDisabled(true);
      }
      setErrors({});
    }
  }, [isOpen, isEdit, orderData, fetchInventory]);

  const handleDateChange = (date) => {
    setFormData((prev) => {
      let calculatedPrice = prev.price;

      if (prev.orderType === ORDER_TYPES.RENT && prev.sellOrRentPrice && date) {
        calculatedPrice = calculateRentalPrice(prev.sellOrRentPrice, date);
      }

      return {
        ...prev,
        dueDateTime: date ?? null,
        price: calculatedPrice,
      };
    });
  };

  const handleInputChange = async (event) => {
    const { name, value } = event.target;

    setErrors((prev) => {
      const { [name]: removed, ...rest } = prev;
      return rest;
    });

    if (name === "orderType") {
      setFormData((prev) => ({
        ...prev,
        orderType: value,
        inventoryId: "",
        inventoryName: "",
        sellOrRentPrice: "",
        price: "",
        unit: "",
        remainingQuantity: 0,
        dueDateTime: null,
      }));
    } else if (name === "inventoryId") {
      const selectedItem = inventoryList.find((item) => item.id === value);
      if (selectedItem) {
        const remainingQuantity = await fetchRemainingQuantity(value);

        // Calculate price based on order type
        let calculatedPrice = selectedItem.sellOrRentPrice;
        if (formData.orderType === ORDER_TYPES.RENT && formData.dueDateTime) {
          calculatedPrice = calculateRentalPrice(selectedItem.sellOrRentPrice, formData.dueDateTime);
        }

        setFormData((prev) => ({
          ...prev,
          inventoryId: value,
          inventoryName: selectedItem.inventoryName,
          sellOrRentPrice: selectedItem.sellOrRentPrice,
          price: calculatedPrice,
          unit: selectedItem.unit,
          remainingQuantity,
        }));
      }
    } else if (name === "paymentStatus") {
      let newOrderStatus = ORDER_STATUS.INPROGRESS;
      let newOrderStatusDisabled = false;

      if (value === PAYMENT_STATUS.COMPLETED) {
        newOrderStatus = ORDER_STATUS.COMPLETED;
      } else if (value === PAYMENT_STATUS.PENDING) {
        newOrderStatus = ORDER_STATUS.PENDING;
        newOrderStatusDisabled = true;
      }

      setOrderStatusDisabled(newOrderStatusDisabled);
      setFormData((prev) => ({ ...prev, [name]: value, orderStatus: newOrderStatus }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleClose = () => {
    setFormData({ ...initialState });
    setErrors({});
    onClose();
  };

  const handleSave = async () => {
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setFormLoading(true);

    const payload = {
      orderType: formData.orderType,
      inventoryId: formData.inventoryId,
      inventoryName: formData.inventoryName,
      unit: formData.unit || "unit",
      price: formData.price,
      quantity: parseInt(formData.quantity),
      customerName: formData.customerName.trim(),
      customerLocation: formData.customerLocation.trim(),
      paymentStatus: formData.paymentStatus,
      orderStatus: formData.orderStatus,
      customerPhone: formData.customerPhone.replace(/\D/g, ""),
      dueDateTime: formData?.dueDateTime?.toISOString() || null,
    };

    try {
      if (formData.id) {
        const res = await updateOrder(formData.id, payload);
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
      setFormLoading(false);
    }
  };

  const renderField = (field) => {
    const { name, label, type, required, disabled, show = true } = field;
    const isDisabled = disabled;
    const value = field.value !== undefined ? field.value : formData[name] || "";
    const error = errors[name];

    if (!show) return null;

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
          <FormControl fullWidth disabled={isDisabled}>
            <SelectField {...commonProps} options={field.options || []} />
          </FormControl>
        );
      case "radio":
        return (
          <FormControl fullWidth>
            <RadioField {...commonProps} options={field.options || []} />
          </FormControl>
        );
      case "number":
        return (
          <FormControl fullWidth>
            <TextFieldComponent
              {...commonProps}
              type="number"
              endAdornment={field.endAdornment}
              helperText={field.helperText}
            />
          </FormControl>
        );
      case "date":
        return (
          <DateTimePicker
            {...commonProps}
            selected={value}
            placeholder="Choose date & time"
            label="Due Date & Time"
            minDate={new Date()}
            onChange={handleDateChange}
            helperText={error}
          />
        );
      default:
        return (
          <FormControl fullWidth>
            <TextFieldComponent {...commonProps} type={type} />
          </FormControl>
        );
    }
  };

  if (inventoryLoading) {
    return (
      <Dialog open={isOpen} maxWidth="md" fullWidth>
        <DialogContent sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  const formSections = getFormFields();

  return (
    <Dialog open={isOpen} maxWidth="lg" fullWidth>
      <DialogTitle>{isEdit ? "Update Order" : "Create Order"}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ p: 1 }}>
          {formSections.map((section) => (
            <Box key={section.section} sx={{ mb: 3 }}>
              <DialogTitle sx={{ pl: 0, pb: 2 }}>{section.section}</DialogTitle>

              {section.section === "Product Details" ? (
                <Box>
                  {section.fields
                    .filter((field) => field.name === "orderType")
                    .map((field) => (
                      <Box sx={{ mb: 2 }} key={field.name}>
                        {renderField(field)}
                      </Box>
                    ))}

                  <Grid container spacing={2}>
                    {section.fields
                      .filter((field) => field.name !== "orderType")
                      .map((field) => (
                        <Grid item xs={6} key={field.name}>
                          {renderField(field)}
                        </Grid>
                      ))}
                  </Grid>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {section.fields.map((field) => (
                    <Grid item xs={6} key={field.name}>
                      {renderField(field)}
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          ))}

          {quantityLoading && (
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>Fetching available quantity...</Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={formLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={formLoading}
          startIcon={formLoading ? <CircularProgress size={16} /> : null}
        >
          {formLoading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderFormModal;
