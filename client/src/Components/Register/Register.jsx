import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import { API } from "../../API/API";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Register() {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    email: "",
    userName: "",
    password: "",
    metamask_Address: "",
  });

  const navigtion = useNavigate();

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!formData.userName.trim()) newErrors.userName = "Name is required.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";
    if (!formData.metamask_Address.trim())
      newErrors.metamask_Address = "Connect Wallet First";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/admin_register", formData);
      console.log("response",response)
      if (response.data.success) {
        setSuccess("Registration successful!");
        setFormData({
          email: "",
          userName: "",
          password: "",
          metamask_Address: address || "",
        });
        navigtion("/");
      }else{
        setErrors({
          general: response.data.msg || "Something went wrong!",
        });
      }
    } catch (err) {
      console.log("err)",err)
      setErrors({
        general: err.response?.data?.message || "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      metamask_Address: address || "",
    }));
  }, [address]);

  return (
    <div className="login_page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="login_card">
              <h5 className="fs-4 fw-bold intfont mainclr text-center">
                Create an account
              </h5>
              <p className="text-center mainclr popfont fs-6 fw-normal">
                Create an account and register on to rent property
              </p>
              <form onSubmit={handleSubmit}>
                <div className="position-relative d-flex align-items-center">
                  <input
                    type="text"
                    name="email"
                    placeholder="Enter Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`reg_input popfont mainclr fw-normal ${
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
                    type="text"
                    name="userName"
                    placeholder="Enter Your Name"
                    value={formData.userName}
                    onChange={handleChange}
                    className={`reg_input popfont mainclr fw-normal ${
                      errors.userName ? "is-invalid" : ""
                    }`}
                  />
                  <i className="fa-solid fa-user mainclr reg_inn_icon" />
                </div>
                {errors.userName && (
                  <p className="text-danger small">{errors.userName}</p>
                )}
                <div className="position-relative mt-3 d-flex align-items-center">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`reg_input popfont mainclr fw-normal ${
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
                    placeholder="Metamask Address"
                    value={formData.metamask_Address}
                    className={`reg_input popfont mainclr fw-normal ${
                      errors.metamask_Address ? "is-invalid" : ""
                    }`}
                    disabled
                  />
                  <i className="fa-solid fa-wallet mainclr reg_inn_icon" />
                </div>
                {errors.metamask_Address && (
                  <p className="text-danger small">{errors.metamask_Address}</p>
                )}
                <p className="fs-6 fw-normal popfont mainclr text-center mt-2">
                  <input type="checkbox" /> I agree to{" "}
                  <span className="fw-semibold">Terms of Services</span> and{" "}
                  <span className="fw-semibold">Privacy Policy</span> of the
                  platform.
                </p>
                <button
                  type="submit"
                  className="login_btn mt-2 popfont fw-normal"
                  style={{ color: "#F1F0FE" }}
                  disabled={loading} // Disable button when loading
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </form>
              {errors.general && (
                <p className="text-danger text-center mt-2">{errors.general}</p>
              )}
              {success && (
                <p className="text-success text-center mt-2">{success}</p>
              )}
              <p className="fs-16 fw-normal popfont mainclr text-center mt-2">
                Already have an account?{" "}
                <span className="fw-700">
                  <Link to="/">Login</Link>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
