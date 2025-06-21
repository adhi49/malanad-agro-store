import "./App.css";
import { useRoutes } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";

const App = () => {
  const routing = useRoutes([AdminRoutes]);
  return <>{routing}</>;
};

export default App;
