import { useState } from "react";
import { Container } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { newDriverThunk } from "../slices/driverSlice";

export default function DriverRegister() {
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverEmail, setDriverEmail] = useState("");
  const [driverPassword, setDriverPassword] = useState("");
  const [cnfPwd, setCnfPwd] = useState("");

  const [licenseNumber, setLicenseNumber] = useState("");
  const [taxiPermitNumber, setTaxiPermitNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [experienceYears, setExperienceYears] = useState("");

  const [serverMsg, setServerMsg] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateOmaniPhone = (phone) => {
    return /^(9|7|2)\d{7}$/.test(phone);
  };

  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerMsg("");

    if (
      !driverName ||
      !driverPhone ||
      !driverEmail ||
      !driverPassword ||
      !cnfPwd ||
      !licenseNumber ||
      !taxiPermitNumber ||
      !vehicleModel ||
      !plateNumber ||
      !nationalId ||
      !experienceYears
    ) {
      setServerMsg("Please fill in all required fields");
      return;
    }

    if (!validateEmail(driverEmail)) {
      setServerMsg("Please enter a valid email address");
      return;
    }

    if (!validateOmaniPhone(driverPhone)) {
      setServerMsg("Invalid Omani phone number (should be 8 digits)");
      return;
    }

    if (!validatePassword(driverPassword)) {
      setServerMsg(
        "Password must have at least 6 characters, including uppercase, lowercase, number, and special character"
      );
      return;
    }

    if (driverPassword !== cnfPwd) {
      setServerMsg("Passwords do not match ❌");
      return;
    }

    if (isNaN(experienceYears) || Number(experienceYears) < 0) {
      setServerMsg("Please enter valid years of experience");
      return;
    }

    dispatch(
      newDriverThunk({
        driverName,
        driverPhone,
        driverEmail,
        driverPassword,
        licenseNumber,
        taxiPermitNumber,
        vehicleModel,
        plateNumber,
        nationalId,
        experienceYears,
        role: "taxi_driver",
        isVerifiedDriver: true,
      })
    ).then((res) => {
      const payload = res?.payload;

      if (payload && payload.flag) {
        navigate("/driver-login");
      } else {
        if (payload?.serverMsg) {
          setServerMsg(payload.serverMsg);
        } else {
          setServerMsg("Driver registration failed");
        }
      }
    });
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "650px",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#b42232", marginBottom: "30px" }}>
          Driver register
        </h1>

        <div className="inputBox">
          <span className="icon">👤</span>
          <input
            type="text"
            placeholder="Full Name"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            required
          />
        </div>

        <div className="inputBox">
          <span className="icon">📧</span>
          <input
            type="email"
            placeholder="Email Address"
            value={driverEmail}
            onChange={(e) => setDriverEmail(e.target.value)}
            required
          />
        </div>

        <div className="inputBox">
          <span className="icon">📞</span>
          <input
            type="text"
            placeholder="Phone Number"
            value={driverPhone}
            onChange={(e) => setDriverPhone(e.target.value)}
            required
          />
        </div>

        <div className="inputBox">
          <span className="icon">🪪</span>
          <input
            type="text"
            placeholder="Driving License Number"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            required
          />
        </div>

        <div className="inputBox">
          <span className="icon">🚕</span>
          <input
            type="text"
            placeholder="Taxi Permit / Badge Number"
            value={taxiPermitNumber}
            onChange={(e) => setTaxiPermitNumber(e.target.value)}
            required
          />
        </div>

        <div className="inputBox">
          <span className="icon">🚗</span>
          <input
            type="text"
            placeholder="Vehicle Model"
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
            required
          />
        </div>

        <div className="inputBox">
          <span className="icon">🔢</span>
          <input
            type="text"
            placeholder="Vehicle Plate Number"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            required
          />
        </div>

        <div className="inputBox">
          <span className="icon">🆔</span>
          <input
            type="text"
            placeholder="National ID / Resident Card Number"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            required
          />
        </div>

        <div className="inputBox">
          <span className="icon">⏳</span>
          <input
            type="number"
            placeholder="Years of Driving Experience"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            required
          />
        </div>

        <div className="inputBox">
          <span className="icon">🔒</span>
          <input
            type="password"
            placeholder="Password"
            value={driverPassword}
            onChange={(e) => setDriverPassword(e.target.value)}
            required
          />
        </div>

        <div className="inputBox">
          <span className="icon">✔️</span>
          <input
            type="password"
            placeholder="Confirm Password"
            value={cnfPwd}
            onChange={(e) => setCnfPwd(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            width: "80%",
            backgroundColor: "#8b2c2c",
            color: "white",
            borderRadius: "30px",
            padding: "12px",
            fontSize: "20px",
            marginTop: "20px",
            border: "none",
          }}
        >
          Sign Up
        </button>

        {serverMsg && (
          <div
            style={{
              backgroundColor: "#ffe0e0",
              color: "#7b1515",
              padding: "10px",
              marginTop: "15px",
              borderRadius: "10px",
              fontWeight: "bold",
            }}
          >
            {serverMsg}
          </div>
        )}

        <br />
        <br />
        <br />

        <p style={{ marginTop: "15px", fontSize: "18px" }}>
          Already have an account?{" "}
          <Link
            to="/driver-login"
            style={{ color: "#b42232", fontWeight: "bold" }}
          >
            LOGIN
          </Link>
        </p>
      </form>

      <style>{`
        .inputBox {
          width: 100%;
          max-width: 550px;
          background-color: #ffb4b4;
          padding: 14px 18px;
          margin: 12px auto;
          border-radius: 25px;
          display: flex;
          align-items: center;
        }

        .inputBox .icon {
          font-size: 20px;
          margin-right: 10px;
        }

        .inputBox input {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 18px;
          outline: none;
        }
      `}</style>
    </Container>
  );
}