import { BrowserRouter, Route, Routes } from "react-router"
import Home from "./pages/Home"
import Report from "./pages/Report"
import Price from "./pages/Price"
import { AuthProvider, ProtectedRoute } from "./AuthContaxt/authContaxt"
import Login from "./pages/login"
  import { ToastContainer, toast } from 'react-toastify';



const App = () => {
  return (
    <BrowserRouter>
    <AuthProvider>
    <Routes>
      <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
           <Route path="/" element={<Home/>}></Route> 
      <Route path="/report" element={<Report/>}></Route> 
       <Route path="/price" element={<Price/>}></Route> 
          </Route>
     
    </Routes>
    <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
    </BrowserRouter>
  )
}

export default App