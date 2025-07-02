import React from "react";
import "./SideBar.css";
import { useNavigate } from "react-router-dom";

export default function SideBar({
  side1,
  side2,
  side3,
  side4,
  side5,
  side6,
  onMenuClick,

}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user"); // Remove user data from localStorage
    navigate("/"); // Redirect to the login page
  };
  const handleMenuClick = (menu) => {
    if (menu === side1) {
      navigate("/addProperty"); // Navigate to /dashboard/addProperty when side1 is clicked
    } else if (menu === side2) {
      navigate("/dashboard"); // Navigate to /dashboard when side2 is clicked
    } else if (menu == side4) {
      navigate("/MyAssets"); // Navigate to /dashboard when side2 is clicked
    }
     else if (menu == side5) {
      navigate("/favorites"); // Navigate to /dashboard when side2 is clicked
    }
    else {
      onMenuClick(menu); // Call the onMenuClick handler for other menu items
    }
  };


  return (
    <div className="side_bar_top pt-3">
      <div className="">
        <div
          className="inner_setting_bar popfont fs-6 fw-600 text_clr"
          onClick={() => handleMenuClick(side1)}
        >
          {side1}
        </div>
        <div
          className="inner_setting_bar mt-3 popfont fs-6 fw-600"
          onClick={() => handleMenuClick(side2)}
        >
          {side2}
        </div>

        <div
          className="inner_setting_bar mt-3 popfont fs-6 fw-600 text_clr"
          onClick={() => handleMenuClick(side4)}
        >
          {side4}
        </div>
        <div
          className="inner_setting_bar mt-3 popfont fs-6 fw-600 text_clr"
          onClick={() => {
            handleMenuClick(side5)
          }}
        >
          {side5}
        </div>
        <div
          className="inner_setting_bar mt-3 popfont fs-6 fw-600 text_clr"
          onClick={() => {
            onMenuClick(side6)
            handleLogout();
          }}
        >
          {side6}
        </div>
        {/* Optional Change Password Section */}
        {/* <div className="inner_setting_bar text_clr mt-3 jkfont fs-16 fw-400">
          Change password
        </div> */}
      </div>
    </div>
  );
}
