import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./AppContext";
import GlobalAlert from "./GlobalAlert";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AppProvider>
    <GlobalAlert />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AppProvider>
);
