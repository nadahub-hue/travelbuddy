import { useState } from "react";
import { Container } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { newDriverThunk } from "../../slices/driverSlice";
import driverRegValidationSchema from "../../validations/DriverRejValidation.js";

const fieldErrorStyle = {
  display: "block",
  textAlign: "left",
  color: "#c0392b",
  fontSize: "0.85rem",
  fontWeight: 600,
  marginTop: 4,
  marginBottom: 8,
  paddingLeft: 12,
  minHeight: "1.2rem",
};

function mapYupErrors(err) {
  const next = {};
  if (err.inner?.length) {
    err.inner.forEach((e) => {
      if (e.path && !next[e.path]) next[e.path] = e.message;
    });
  } else if (err.path) {
    next[err.path] = err.message;
  }
  return next;
}

function FieldWrap({ error, children }) {
  return (
    <div style={{ width: "100%", maxWidth: 550, margin: "0 auto" }}>
      {children}
      <small style={fieldErrorStyle}>{error || "\u00a0"}</small>
    </div>
  );
}

// Step definitions
const STEPS = ["Personal", "Vehicle", "Documents", "Password"];

const STEP_FIELDS = [
  ["driverName", "driverEmail", "driverPhone", "nationalId", "experienceYears"],
  ["licenseNumber", "taxiPermitNumber", "vehicleModel", "plateNumber"],
  ["licenseFile", "permitFile", "carRegistrationFile"],
  ["driverPassword", "cnfPwd"],
];

export default function DriverRegister() {
  const [step, setStep] = useState(0);

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
  const [licenseFile, setLicenseFile] = useState(null);
  const [permitFile, setPermitFile] = useState(null);
  const [carRegistrationFile, setCarRegistrationFile] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const clearError = (field) =>
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  // Validate only the fields in the current step before advancing
  const validateStep = async () => {
    const formData = {
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      driverEmail: driverEmail.trim(),
      driverPassword,
      cnfPwd,
      licenseNumber: licenseNumber.trim(),
      taxiPermitNumber: taxiPermitNumber.trim(),
      vehicleModel: vehicleModel.trim(),
      plateNumber: plateNumber.trim(),
      nationalId: nationalId.trim(),
      experienceYears: String(experienceYears).trim(),
    };

    const currentFields = STEP_FIELDS[step];

    // File validation for step 2
    if (step === 2) {
      const fileErrors = {};
      if (!licenseFile) fileErrors.licenseFile = "License PDF is required";
      if (!permitFile) fileErrors.permitFile = "Permit PDF is required";
      if (!carRegistrationFile) fileErrors.carRegistrationFile = "Car registration PDF is required";
      if (Object.keys(fileErrors).length > 0) {
        setFieldErrors(fileErrors);
        return false;
      }
      return true;
    }

    try {
      await driverRegValidationSchema.validate(formData, { abortEarly: false });
      // Clear errors for current step fields
      setFieldErrors((prev) => {
        const next = { ...prev };
        currentFields.forEach((f) => delete next[f]);
        return next;
      });
      return true;
    } catch (error) {
      if (error.name === "ValidationError") {
        const allErrors = mapYupErrors(error);
        // Only show errors for current step's fields
        const stepErrors = {};
        currentFields.forEach((f) => {
          if (allErrors[f]) stepErrors[f] = allErrors[f];
        });
        if (Object.keys(stepErrors).length > 0) {
          setFieldErrors(stepErrors);
          return false;
        }
        return true;
      }
      return false;
    }
  };

  const handleNext = async () => {
    const valid = await validateStep();
    if (valid) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => s - 1);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMsg("");
    setIsSubmitting(true);

    const formData = {
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      driverEmail: driverEmail.trim(),
      driverPassword,
      cnfPwd,
      licenseNumber: licenseNumber.trim(),
      taxiPermitNumber: taxiPermitNumber.trim(),
      vehicleModel: vehicleModel.trim(),
      plateNumber: plateNumber.trim(),
      nationalId: nationalId.trim(),
      experienceYears: String(experienceYears).trim(),
    };

    try {
      await driverRegValidationSchema.validate(formData, { abortEarly: false });

      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (k !== "cnfPwd") data.append(k, k === "experienceYears" ? Number(v) : v);
      });
      data.append("licenseFile", licenseFile);
      data.append("permitFile", permitFile);
      data.append("carRegistrationFile", carRegistrationFile);

      const resultAction = await dispatch(newDriverThunk(data));

      if (newDriverThunk.fulfilled.match(resultAction)) {
        const payload = resultAction.payload;
        if (payload?.flag) {
          setServerMsg(payload?.serverMsg || "Driver registered successfully. Please log in.");
          setTimeout(() => navigate("/login"), 1200);
        } else {
          setServerMsg(payload?.serverMsg || "Driver registration failed");
        }
      } else {
        setServerMsg(
          resultAction.payload?.serverMsg ||
            resultAction.error?.message ||
            "Driver registration failed"
        );
      }
    } catch (error) {
      if (error.name === "ValidationError") {
        setFieldErrors(mapYupErrors(error));
      } else {
        setServerMsg(error?.message || "Submission failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", padding: "24px 0" }}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ width: "100%", maxWidth: "650px", textAlign: "center" }}
      >
        <h1 style={{ color: "#b42232", marginBottom: "10px" }}>Driver Register</h1>

        {/* Step indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
          {STEPS.map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                backgroundColor: i <= step ? "#b42232" : "#ddd",
                color: i <= step ? "white" : "#999",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: 700,
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: "13px", color: i === step ? "#b42232" : "#999", fontWeight: i === step ? 700 : 400 }}>
                {label}
              </span>
              {i < STEPS.length - 1 && <span style={{ color: "#ddd" }}>›</span>}
            </div>
          ))}
        </div>

        {/* Step 0 — Personal Info */}
        {step === 0 && (
          <>
            <FieldWrap error={fieldErrors.driverName}>
              <div className="inputBox">
                <span className="icon">👤</span>
                <input type="text" placeholder="Full Name" value={driverName}
                  onChange={(e) => { setDriverName(e.target.value); clearError("driverName"); }} />
              </div>
            </FieldWrap>
            <FieldWrap error={fieldErrors.driverEmail}>
              <div className="inputBox">
                <span className="icon">📧</span>
                <input type="email" placeholder="Email Address" value={driverEmail}
                  onChange={(e) => { setDriverEmail(e.target.value); clearError("driverEmail"); }} />
              </div>
            </FieldWrap>
            <FieldWrap error={fieldErrors.driverPhone}>
              <div className="inputBox">
                <span className="icon">📞</span>
                <input type="text" placeholder="Phone Number" value={driverPhone}
                  onChange={(e) => { setDriverPhone(e.target.value); clearError("driverPhone"); }} />
              </div>
            </FieldWrap>
            <FieldWrap error={fieldErrors.nationalId}>
              <div className="inputBox">
                <span className="icon">🆔</span>
                <input type="text" placeholder="National ID / Resident Card Number" value={nationalId}
                  onChange={(e) => { setNationalId(e.target.value); clearError("nationalId"); }} />
              </div>
            </FieldWrap>
            <FieldWrap error={fieldErrors.experienceYears}>
              <div className="inputBox">
                <span className="icon">⏳</span>
                <input type="number" min="0" placeholder="Years of Driving Experience" value={experienceYears}
                  onChange={(e) => { setExperienceYears(e.target.value); clearError("experienceYears"); }} />
              </div>
            </FieldWrap>
          </>
        )}

        {/* Step 1 — Vehicle Info */}
        {step === 1 && (
          <>
            <FieldWrap error={fieldErrors.licenseNumber}>
              <div className="inputBox">
                <span className="icon">🪪</span>
                <input type="text" placeholder="Driving License Number" value={licenseNumber}
                  onChange={(e) => { setLicenseNumber(e.target.value); clearError("licenseNumber"); }} />
              </div>
            </FieldWrap>
            <FieldWrap error={fieldErrors.taxiPermitNumber}>
              <div className="inputBox">
                <span className="icon">🚕</span>
                <input type="text" placeholder="Taxi Permit / Badge Number" value={taxiPermitNumber}
                  onChange={(e) => { setTaxiPermitNumber(e.target.value); clearError("taxiPermitNumber"); }} />
              </div>
            </FieldWrap>
            <FieldWrap error={fieldErrors.vehicleModel}>
              <div className="inputBox">
                <span className="icon">🚗</span>
                <input type="text" placeholder="Vehicle Model" value={vehicleModel}
                  onChange={(e) => { setVehicleModel(e.target.value); clearError("vehicleModel"); }} />
              </div>
            </FieldWrap>
            <FieldWrap error={fieldErrors.plateNumber}>
              <div className="inputBox">
                <span className="icon">🔢</span>
                <input type="text" placeholder="Vehicle Plate Number" value={plateNumber}
                  onChange={(e) => { setPlateNumber(e.target.value); clearError("plateNumber"); }} />
              </div>
            </FieldWrap>
          </>
        )}

        {/* Step 2 — Documents */}
        {step === 2 && (
          <>
            <FieldWrap error={fieldErrors.licenseFile}>
              <div className="inputBox">
                <span className="icon">📄</span>
                <span style={{ fontSize: "14px", marginRight: "8px", color: "#555" }}>License PDF</span>
                <input type="file" accept="application/pdf"
                  onChange={(e) => { setLicenseFile(e.target.files[0] || null); clearError("licenseFile"); }} />
              </div>
            </FieldWrap>
            <FieldWrap error={fieldErrors.permitFile}>
              <div className="inputBox">
                <span className="icon">📄</span>
                <span style={{ fontSize: "14px", marginRight: "8px", color: "#555" }}>Permit PDF</span>
                <input type="file" accept="application/pdf"
                  onChange={(e) => { setPermitFile(e.target.files[0] || null); clearError("permitFile"); }} />
              </div>
            </FieldWrap>
            <FieldWrap error={fieldErrors.carRegistrationFile}>
              <div className="inputBox">
                <span className="icon">📄</span>
                <span style={{ fontSize: "14px", marginRight: "8px", color: "#555" }}>Car Registration PDF</span>
                <input type="file" accept="application/pdf"
                  onChange={(e) => { setCarRegistrationFile(e.target.files[0] || null); clearError("carRegistrationFile"); }} />
              </div>
            </FieldWrap>
          </>
        )}

        {/* Step 3 — Password */}
        {step === 3 && (
          <>
            <FieldWrap error={fieldErrors.driverPassword}>
              <div className="inputBox">
                <span className="icon">🔒</span>
                <input type="password" placeholder="Password" value={driverPassword}
                  onChange={(e) => { setDriverPassword(e.target.value); clearError("driverPassword"); }} />
              </div>
            </FieldWrap>
            <FieldWrap error={fieldErrors.cnfPwd}>
              <div className="inputBox">
                <span className="icon">✔️</span>
                <input type="password" placeholder="Confirm Password" value={cnfPwd}
                  onChange={(e) => { setCnfPwd(e.target.value); clearError("cnfPwd"); }} />
              </div>
            </FieldWrap>
          </>
        )}

        {/* Navigation buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "16px" }}>
          {step > 0 && (
            <button type="button" onClick={handleBack} style={{
              width: "35%", backgroundColor: "transparent", color: "#8b2c2c",
              border: "2px solid #8b2c2c", borderRadius: "30px", padding: "12px",
              fontSize: "18px", cursor: "pointer",
            }}>
              ← Back
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={handleNext} style={{
              width: step > 0 ? "55%" : "80%", backgroundColor: "#8b2c2c", color: "white",
              borderRadius: "30px", padding: "12px", fontSize: "18px",
              border: "none", cursor: "pointer",
            }}>
              Next →
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} style={{
              width: "55%", backgroundColor: isSubmitting ? "#aaa" : "#8b2c2c",
              color: "white", borderRadius: "30px", padding: "12px", fontSize: "18px",
              border: "none", cursor: isSubmitting ? "not-allowed" : "pointer",
            }}>
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </button>
          )}
        </div>

        {serverMsg && (
          <div style={{
            backgroundColor: "#ffe0e0", color: "#7b1515", padding: "10px",
            marginTop: "15px", borderRadius: "10px", fontWeight: "bold",
          }}>
            {serverMsg}
          </div>
        )}

        <p style={{ marginTop: "15px", fontSize: "18px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#b42232", fontWeight: "bold" }}>LOGIN</Link>
        </p>
      </form>

      <style>{`
        .inputBox {
          width: 100%;
          max-width: 550px;
          background-color: #ffb4b4;
          padding: 14px 18px;
          margin: 4px auto 0;
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