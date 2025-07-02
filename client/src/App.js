import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./Components/Header/Header";
import { Route, Routes } from "react-router-dom";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import Home_page from "./Components/Home_page/Home_page";
import AdminPannel from "./Components/AdminPannel/AdminPannel";
import { useState } from "react";
import PrivateRoute from "./Components/Routes/PrivateRoute";
import PublicRoute from "./Components/Routes/PublicRoute";
import AddProperty from "./Components/AddProperty/AddProperty";
import { Toaster } from "react-hot-toast";
import MyAssets from "./Components/MyAssets/MyAssets";
import Favorite from "./Components/Favrioute/Fav";

function App() {
  const [selectedMenu, setSelectedMenu] = useState("All"); // Default to "All"
  const [search, setSearch] = useState("")
  const handleMenuClick = (menuOption) => {
    setSelectedMenu(menuOption);
  };

  return (
    <div className="App">
      <Header onMenuClick={handleMenuClick} setSearch={setSearch} />
      <Toaster />

      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/Register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Private Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Home_page
                selectedMenu={selectedMenu}
                setSelectedMenu={setSelectedMenu}
                search={search}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/addProperty"
          element={
            <PrivateRoute>
              <AddProperty
                selectedMenu={selectedMenu}
                setSelectedMenu={setSelectedMenu}
              />
            </PrivateRoute>
          }
        />

        <Route
          path="/MyAssets"
          element={
            <PrivateRoute>
              <MyAssets
                selectedMenu={selectedMenu}
                setSelectedMenu={setSelectedMenu}
              />
            </PrivateRoute>
          }
        />
         <Route
          path="/favorites"
          element={
            <PrivateRoute>
              <Favorite />
            </PrivateRoute>
          }
        />
        <Route
          path="/Admin"
          element={
            <PrivateRoute>
              <AdminPannel />
            </PrivateRoute>
          }
        />
      </Routes>
      {/* <AddProperty/> */}
    </div>
  );
}

export default App;
