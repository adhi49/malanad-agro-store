import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select } from "@mui/material";

// Form field components
const SelectField = ({ name, label, value, onChange, options, disabled, required, error, helperText }) => (
  <FormControl fullWidth disabled={disabled} sx={{ minWidth: 250 }}>
    <InputLabel shrink>
      {label} {required && "*"}
    </InputLabel>
    <Select notched label={label} name={name} value={value} onChange={onChange}>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
    {(error || helperText) && (
      <FormHelperText
        sx={{ ml: 0, pl: 0, color: error ? "error.main" : "text.secondary", fontSize: "0.75rem", mt: 0.5 }}
      >
        {error || helperText}
      </FormHelperText>
    )}
  </FormControl>
);

export default SelectField;
