import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TextField } from "@mui/material";

const DateTimePicker = ({
  selected,
  onChange,
  label,
  minDate,
  maxDate,
  placeholder = "Select date and time",
  showTimeSelect = true,
  dateFormat = "dd-MM-yyyy h:mm aa",
  disabled = false,
  textFieldProps = {},
}) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      showTimeSelect={showTimeSelect}
      timeIntervals={15}
      timeCaption="Time"
      dateFormat={dateFormat}
      minDate={minDate}
      maxDate={maxDate}
      placeholderText={placeholder}
      disabled={disabled}
      customInput={
        <TextField
          label={label}
          fullWidth
          variant="outlined"
          disabled={disabled}
          {...textFieldProps}
          error={!!textFieldProps?.helperText}
        />
      }
    />
  );
};

export default DateTimePicker;
