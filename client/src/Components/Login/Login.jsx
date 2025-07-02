import React, { useState, useEffect } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAccount } from "wagmi";
import { API } from "../../API/API";

export default function Login() {
  const { address } = useAccount(); // Get connected wallet address
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    metamask_Address: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const [generalError, setGeneralError] = useState("");

  // Set MetaMask address whenever it changes
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      metamask_Address: address || "",
    }));
  }, [address]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Remove the error for this field if it becomes valid
    if (errors[name] && value.trim()) {
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  const validateFields = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";
    if (!formData.metamask_Address.trim())
      newErrors.metamask_Address = "Connect your wallet.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");

    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/admin_login", formData);
      console.log("Login successful!", response);
      if (response?.data.success) {
        // Handle successful login, e.g., redirect or store token
        localStorage.setItem("user", JSON.stringify(response.data?.data));
        setSuccess("Login successful!");
        navigate("/dashboard");
      }else{
        setGeneralError(response?.data.msg || "Something went wrong!");
      }
    } catch (err) {
      setGeneralError(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login_page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="login_card">
              <h5 className="fs-3 intfont fw-700 mainclr text-center">
                Welcome Back, Login
              </h5>
              <p className="text-center mainclr popfont fs-16 fw-semibold">
                Enter your details and Login to your account
              </p>
              <form onSubmit={handleSubmit}>
                <div className="position-relative d-flex align-items-center">
                  <input
                    type="text"
                    name="email"
                    placeholder="Enter Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`reg_input popfont mainclr fw-semibold ${
                      errors.email ? "is-invalid" : ""
                    }`}
                  />
                  <i className="fa-solid fa-envelope mainclr reg_inn_icon" />
                </div>
                {errors.email && (
                  <p className="text-danger small">{errors.email}</p>
                )}
                <div className="position-relative mt-3 d-flex align-items-center">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`reg_input popfont mainclr fw-semibold ${
                      errors.password ? "is-invalid" : ""
                    }`}
                  />
                  <i className="fa-solid fa-lock mainclr reg_inn_icon" />
                </div>
                {errors.password && (
                  <p className="text-danger small">{errors.password}</p>
                )}
                <div className="position-relative mt-3 d-flex align-items-center">
                  <input
                    type="text"
                    name="metamask_Address"
                    placeholder="MetaMask Address"
                    value={formData.metamask_Address}
                    readOnly
                    className={`reg_input popfont mainclr fw-semibold ${
                      errors.metamask_Address ? "is-invalid" : ""
                    }`}
                  />
                  <i className="fa-solid fa-wallet mainclr reg_inn_icon" />
                </div>
                {errors.metamask_Address && (
                  <p className="text-danger small">{errors.metamask_Address}</p>
                )}
                <p className="fs-16 fw-semibold popfont mainclr text-end mt-2">
                  Forget Password?
                </p>
                <button
                  type="submit"
                  className="login_btn mt-2 popfont fw-300"
                  style={{ color: "#F1F0FE" }}
                  disabled={loading} // Disable button during loading
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
                {generalError && (
                  <p className="text-danger text-center mt-2">{generalError}</p>
                )}
                {success && (
                  <p className="text-success text-center mt-2">{success}</p>
                )}
              </form>
              <p className="fs-16 fw-semibold popfont mainclr text-center mt-2">
                Don’t have an account?{" "}
                <span className="fw-700">
                  <Link to="/Register">Register</Link>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
