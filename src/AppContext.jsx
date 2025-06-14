import React, { createContext, useContext, useState } from "react";

const AppContext = createContext({
  isAlertOpen: false,
  showAlert: () => null,
});

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [alertInfo, setAlert] = useState({});

  const showAlert = ({ message = "", type = "success" }) => {
    if (message) {
      setAlert({ isOpen: true, message, type });
      setTimeout(() => setAlert({ isOpen: false, message: "", type }), 3000);
    } else {
      setAlert({ isOpen: false, message: "", type });
    }
  };

  return (
    <AppContext.Provider
      value={{
        alertInfo,
        showAlert,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
