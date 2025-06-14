import { TextField } from "@mui/material";

const TextFieldComponent = ({
  name,
  label,
  value,
  onChange,
  type,
  disabled,
  required,
  error,
  helperText,
  endAdornment,
}) => (
  <TextField
    fullWidth
    name={name}
    label={`${label} ${required ? "*" : ""}`}
    type={type}
    value={value}
    onChange={onChange}
    disabled={disabled}
    error={!!error}
    helperText={error || helperText}
    InputProps={endAdornment ? { endAdornment } : undefined}
  />
);

export default TextFieldComponent;
