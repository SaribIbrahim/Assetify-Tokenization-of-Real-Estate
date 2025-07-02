import React, { useState } from "react";
import "./Header.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import { IoSearchSharp, IoMenu } from "react-icons/io5";
import { FaTelegramPlane, FaUser } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { useAccount, useBalance, useNetwork, useSwitchNetwork } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";

export default function Header({ onMenuClick,setSearch }) {
  const [show, setShow] = useState(false);
  const { chain } = useNetwork();
  const { chains, switchNetwork } = useSwitchNetwork();
  const { address } = useAccount();
  const { open } = useWeb3Modal();
  const AdminAddress = "0xfE965Bf18206530754F8D611fF7F60683Ba2e244";

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleMenuSelection = (menuOption) => {
    onMenuClick(menuOption); // Pass selected menu option to App.js
    handleClose(); // Close Offcanvas after selection
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user"); // Remove user data from localStorage
    navigate("/"); // Redirect to the login page
  };

  return (
    <div>
      <Navbar collapseOnSelect expand="lg" className="main_nav">
        <Container>
          <Link to="/" className="text-decoration-none main_logo">
            <Navbar.Brand className="intfont mainclr fs-4 fw-bold col-class">
              Assetify
            </Navbar.Brand>
          </Link>
          <div className="d-flex gap-2 align-items-center">
            <IoMenu className="fs-1 d-block d-md-none" onClick={handleShow} />
            {/* <Link to="/" className="text-decoration-none">
              <button className="popfont d-flex d-md-none align-items-center fs-6 text-white head_btn">
                <FaUser className="me-2" />
                Login
              </button>
            </Link> */}
          </div>
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="m-auto">
              <div className="position-relative d-none d-md-block">
                <input
                  type="text"
                  placeholder="Search property"
                  className="main_head_inp popfont mainclr"
                  onChange={(e)=>setSearch(e.target.value)}

                />
                {/* <IoSearchSharp className="sea_icon mainclr" /> */}
              </div>
              {address == AdminAddress && (
                <Link to="Admin">
                  <p>admin</p>
                </Link>
              )}
            </Nav>

            <Nav className="d-flex gap-1">
              <div className="social_icons d-flex justify-content-center fs-5 align-items-center popfont">
                <a href="https://web.telegram.org/" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-white">
                 <FaTelegramPlane /></a>
              </div>
              <div className="social_icons fs-5 d-flex justify-content-center align-items-center popfont">
                {/* <BsTwitterX /> */}
                <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-white">
                  <BsTwitterX />
                </a>
              </div>
              {/* <Link to="Login" className='text-decoration-none'>
                                <button className='popfont d-none d-md-flex align-items-center fs-6 text-white head_btn'>
                                    <FaUser className='me-2' />Login
                                </button>
                            </Link>
                            <Link to="Register" className='text-decoration-none'>
                                <button className='popfont d-flex align-items-center fs-6 text-white head_btn'>
                                    <FaUser className='me-2' />Register
                                </button>
                            </Link> */}

              <button
                className="popfont d-none d-md-flex align-items-center fs-6 text-white head_btn"
                onClick={() =>
                  address
                    ? chain?.id == chains[0]?.id
                      ? open()
                      : switchNetwork?.(chains[0]?.id)
                    : open()
                }
              >
                {address ? (
                  chain?.id == chains[0]?.id || chain?.id == chains[1]?.id ? (
                    address ? (
                      <>
                        {`${address?.substring(0, 6)}...${address?.substring(
                          address.length - 4
                        )}`}
                      </>
                    ) : (
                      <>Connect Wallet</>
                    )
                  ) : (
                    "Switch NetWork"
                  )
                ) : (
                  <>Connect Wallet</>
                )}
              </button>
            </Nav>
          </Navbar.Collapse>

          {/* Offcanvas Menu for Mobile View */}
          <Offcanvas show={show} onHide={handleClose}>
            <Offcanvas.Header closeButton />
            <Offcanvas.Body>
              <div className="d-flex justify-content-center mb-2">
                <div
                  className="social_icons d-flex justify-content-center fs-5 align-items-center popfont"
                  onClick={handleClose}
                >
                  <FaTelegramPlane />
                </div>
                <div
                  className="social_icons fs-5 d-flex justify-content-center align-items-center popfont"
                  onClick={handleClose}
                >
                  <BsTwitterX />
                </div>
              </div>

              <div>
                <Link
                  to="Register"
                  className="text-decoration-none"
                  onClick={handleClose}
                >
                  <button className="popfont d-flex w-100 mb-2 align-items-center fs-6 text-white head_btn">
                    <FaUser className="me-2" />
                    Register
                  </button>
                </Link>
              </div>

              <div>
                <Link
                  to="addProperty"
                  className="text-decoration-none text-dark  text_clr  "
                >
                  <div
                    className="inner_setting_bar  popfont fs-5 fw-600 text_clr"
                    onClick={() => handleMenuSelection("Add a Property")}
                  >
                    Add a Property
                  </div>
                </Link>
                <div
                  className="inner_setting_bar mt-3 popfont fs-5 fw-600 text_clr"
                  onClick={() => handleMenuSelection("List a Property")}
                >
                  List a Property
                </div>

                <div
                  className="inner_setting_bar mt-3 popfont fs-5 fw-600"
                  onClick={() => handleMenuSelection("My Wallet")}
                >
                  My Wallet
                </div>
                <div
                  className="inner_setting_bar mt-3 popfont fs-5 fw-600 text_clr"
                  onClick={() => handleMenuSelection("My Assets")}
                >
                  My Assets
                </div>
                <div
                  className="inner_setting_bar mt-3 popfont fs-5 fw-600 text_clr"
                  onClick={() => handleMenuSelection("Favorites")}
                >
                  Favorites
                </div>
                <div
                  className="inner_setting_bar mt-3 popfont fs-5 fw-600 text_clr"
                  onClick={() => {
                    handleMenuSelection("Log Out");
                    handleLogout();
                  }}
                >
                  Log Out
                </div>
              </div>
            </Offcanvas.Body>
          </Offcanvas>
        </Container>
      </Navbar>
    </div>
  );
}
