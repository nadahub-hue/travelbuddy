import { Navbar, Nav, NavItem } from "reactstrap";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


import logoImg from "../images/logo2.png";
import homePic from "../images/house.png";
import searchIcon from "../images/search.png";
import aboutIcon from "../images/team.png";
import chatIcon from "../images/chat.png";
import paymentIcon from "../images/card.png";
import bookingIcon from "../images/booking.png";
import ConformBooking from "../images/conformbook.png";
//import adminIcon from "../images/admin.png";
//import TaxiIcon from "../images/taxi-driver.png";
//import UserIcon from "../images/user.png";
import feedbackIcon from "../images/good-feedback.png";
import profileIcon from "../images/user (1).png";




export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // simple logout handler (front-end only)
  const handleLogout = () => {
    // if you store tokens in localStorage, clear them here
    // localStorage.removeItem("userToken");
    // localStorage.removeItem("driverToken");
    // localStorage.removeItem("adminToken");

    setIsMenuOpen(false);
    navigate("/"); // go to welcome / home after logout
  };
  return (
    <Navbar
      expand="lg"
      className="px-4 shadow-sm"
      style={{
        backgroundColor: "#c7b6ee",
        height: "80px",
      }}
    >
      {/* logo on the left */}
      <Link to="/" className="d-flex align-items-center">
        <img
          src={logoImg}
          alt="Travel Buddy Logo"
          style={{ height: "60px", width: "60px", cursor: "pointer" }}
        />
      </Link>

      {/* main menu in the middle */}
      <Nav
        navbar
        className="mx-auto d-flex align-items-center"
        style={{ gap: "35px", fontSize: "1.1rem", fontWeight: 500 }}
      >
        <NavItem>
          <Link
            to="/home"
            className="nav-link d-flex align-items-center"
            style={{ color: "#4b0082", gap: "6px" }}
          >
            <img src={homePic} alt="Home" style={{ height: "26px" }} />
            Home
          </Link>
        </NavItem>

        <NavItem>
          <Link
            to="/about"
            className="nav-link d-flex align-items-center"
            style={{ color: "#4b0082", gap: "6px" }}
          >
            <img src={aboutIcon} alt="About Us" style={{ height: "26px" }} />
            About Us
          </Link>
        </NavItem>

        <NavItem>
          <Link
            to="/search"
            className="nav-link d-flex align-items-center"
            style={{ color: "#4b0082", gap: "6px" }}
          >
            <img src={searchIcon} alt="Search" style={{ height: "26px" }} />
            Search
          </Link>
        </NavItem>

        <NavItem>
          <Link
            to="/booking"
            className="nav-link d-flex align-items-center"
            style={{ color: "#4b0082", gap: "6px" }}
          >
            <img src={bookingIcon} alt="Booking" style={{ height: "26px" }} />
            Booking
          </Link>
        </NavItem>

        <NavItem>
          <Link
            to="/conform-booking"
            className="nav-link d-flex align-items-center"
            style={{ color: "#4b0082", gap: "6px" }}
          >
            <img src={ConformBooking} alt="Booking" style={{ height: "26px" }} />
            Conform Booking
          </Link>
        </NavItem>

        <NavItem>
          <Link
            to="/payment-method"
            className="nav-link d-flex align-items-center"
            style={{ color: "#4b0082", gap: "6px" }}
          >
            <img src={paymentIcon} alt="Payment" style={{ height: "26px" }} />
            Payment
          </Link>
        </NavItem>

        <NavItem>
          <Link
            to="/chat"
            className="nav-link d-flex align-items-center"
            style={{ color: "#4b0082", gap: "6px" }}
          >
            <img src={chatIcon} alt="Chat" style={{ height: "26px" }} />
            Chat
          </Link>
        </NavItem>

        <NavItem>
          <Link
            to="/feedback"
            className="nav-link d-flex align-items-center"
            style={{ color: "#4b0082", gap: "6px" }}
          >
            <img
              src={feedbackIcon}
              alt="Feedback"
              style={{ height: "26px" }}
            />
            Feedback
          </Link>
        </NavItem>

        <NavItem>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
            }}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <div
              style={{
                borderRadius: "50%",
                padding: "8px",
              }}
            >
              <img src={profileIcon} alt="User" style={{ width: "45px" }} />
            </div>
            <span style={{ fontSize: "1.8rem", color: "black" }}>
              {isMenuOpen ? "˄" : "˅"}
            </span>

            {isMenuOpen && (
              <div
                style={{
                  padding: "10px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#8b1313ff",
                  cursor: "pointer",
                }}
                onClick={handleLogout}
              >
                <span>Logout</span>
                <span style={{ fontSize: "1.4rem" }}>›</span>
              </div>

            )}
          </div>
        </NavItem>
      </Nav>



    </Navbar>
  );
}
