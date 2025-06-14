import { useRoutes } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";
import { AppProvider } from "./AppContext";
import GlobalAlert from "./GlobalAlert";

const App = () => {
  const routing = useRoutes([AdminRoutes]);
  return <>{routing}</>;
};

export default App;
