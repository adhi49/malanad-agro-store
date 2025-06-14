import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

// Form field components
const SelectField = ({ name, label, value, onChange, options, disabled, required, error, helperText }) => (
  <FormControl fullWidth error={!!error} disabled={disabled} sx={{ minWidth: 250 }}>
    <InputLabel>
      {label} {required && "*"}
    </InputLabel>
    <Select name={name} value={value} onChange={onChange}>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
    {(error || helperText) && (
      <Box sx={{ color: error ? "error.main" : "text.secondary", fontSize: "0.75rem", mt: 0.5 }}>
        {error || helperText}
      </Box>
    )}
  </FormControl>
);

export default SelectField;
