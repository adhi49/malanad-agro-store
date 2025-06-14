import { Snackbar, Alert } from "@mui/material";
import { useAppContext } from "./AppContext";

const GlobalAlert = () => {
  const { alertInfo = {} } = useAppContext();
  console.log("====alertInfo====", alertInfo);
  return (
    <Snackbar
      open={!!alertInfo.isOpen}
      autoHideDuration={3000}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      {alertInfo?.message && <Alert severity={alertInfo.type}>{alertInfo.message}</Alert>}
    </Snackbar>
  );
};

export default GlobalAlert;
