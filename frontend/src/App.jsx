import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Items from "./pages/Items";
import ReportItem from "./pages/ReportItem";
import ItemDetails from "./pages/ItemDetails";
import Dashboard from "./pages/Dashboard";
import EditItem from "./pages/EditItem";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/items" element={<Items />} />
        <Route path="/report" element={<ReportItem />} />
        <Route path="/items/:id" element={<ItemDetails />} />
        <Route path="/items/:id/edit" element={<EditItem />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
