import { FormControl, FormHelperText, TextField } from "@mui/material";

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
  <FormControl fullWidth>
    <TextField
      fullWidth
      name={name}
      label={`${label} ${required ? "*" : ""}`}
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      InputProps={endAdornment ? { endAdornment } : undefined}
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
);

export default TextFieldComponent;
