import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FormControl, FormHelperText, TextField } from "@mui/material";
import { formatDate } from "../../utils/commonFunc";

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
  error = "",
  helperText = "",
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
        <FormControl>
          <TextField
            value={formatDate(selected)}
            label={label}
            fullWidth
            variant="outlined"
            disabled={disabled}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
          {(error || helperText) && (
            <FormHelperText
              sx={{ ml: 0, pl: 0, color: error ? "error.main" : "text.secondary", fontSize: "0.75rem", mt: 0.5 }}
            >
              {error || helperText}
            </FormHelperText>
          )}
        </FormControl>
      }
    />
  );
};

export default DateTimePicker;
