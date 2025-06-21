import { Box, FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup } from "@mui/material";

const RadioField = ({ name, label, value, onChange, options, disabled, required, error }) => (
  <FormControl disabled={disabled}>
    <FormLabel>
      {label} {required && "*"}
    </FormLabel>
    <RadioGroup row name={name} value={value} onChange={onChange}>
      {options.map((option) => (
        <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />
      ))}
    </RadioGroup>
    {error && (
      <FormHelperText sx={{ color: "error.main", fontSize: "0.75rem", mt: 0.5, ml: 0, pl: 0 }}>{error}</FormHelperText>
    )}
  </FormControl>
);

export default RadioField;
