import { Container, Row, Col, FormGroup, Label } from "reactstrap";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [pwd, setPwd] = useState("");
  const [cnfPwd, setCnfPwd] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");

  const location = useLocation();
  const navigate = useNavigate();

  // read ?token= from URL
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pwd.length < 10) {
      setMsgType("error");
      setMsg("Password must be at least 10 characters long.");
      return;
    }

    if (pwd !== cnfPwd) {
      setMsgType("error");
      setMsg("Passwords do not match");
      return;
    }

    if (!token) {
      setMsgType("error");
      setMsg("Invalid or missing reset token.");
      return;
    }

    try {
      const res = await fetch("http://localhost:7500/reset-password-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: pwd,
        }),
      });

      const data = await res.json();
      setMsg(data.msg || "Something happened");

      if (data.flag) {
        setMsgType("success");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMsgType("error");
      }
    } catch (err) {
      console.log(err);
      setMsgType("error");
      setMsg("Server error, please try again.");
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center"
      style={{ minHeight: "100vh", backgroundColor: "#f6e9ff" }}
    >
      <Container style={{ maxWidth: "600px", marginTop: "40px" }}>
        {/* Lock Icon */}
        <Row className="text-center mb-3">
          <Col>
            <div style={{ fontSize: "3rem" }}>🔐</div>
          </Col>
        </Row>

        {/* Title */}
        <Row className="text-center mb-3">
          <Col>
            <h1
              style={{
                color: "#4b0082",
                fontWeight: "bold",
                fontSize: "2.2rem",
              }}
            >
              Change Your Password
            </h1>
            <p style={{ color: "#000", fontSize: "1rem", marginTop: "10px" }}>
              Enter a new password below to change
              <br />
              your password
            </p>
          </Col>
        </Row>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <FormGroup className="mb-3">
            <Label style={{ fontWeight: "600", fontSize: "1.1rem" }}>
              New Password*
            </Label>
            <input
              type="password"
              className="form-control"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              required
              style={{
                backgroundColor: "#fff",
                padding: "15px",
                borderRadius: "10px",
                fontSize: "1rem",
              }}
            />
          </FormGroup>

          <FormGroup className="mb-4">
            <Label style={{ fontWeight: "600", fontSize: "1.1rem" }}>
              Re-enter new password*
            </Label>
            <input
              type="password"
              className="form-control"
              value={cnfPwd}
              onChange={(e) => setCnfPwd(e.target.value)}
              required
              style={{
                backgroundColor: "#fff",
                padding: "15px",
                borderRadius: "10px",
                fontSize: "1rem",
              }}
            />
          </FormGroup>

          {/* Password rules (simple) */}
          <Row className="mb-4">
            <Col>
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  padding: "20px",
                  border: "1px solid #ddd",
                }}
              >
                <p
                  style={{
                    fontWeight: "600",
                    marginBottom: "10px",
                  }}
                >
                  Your password must contain:
                </p>
                <p
                  style={{
                    color: "green",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "1.1rem",
                  }}
                >
                  ✔ At least 10 characters in length
                </p>
              </div>
            </Col>
          </Row>

          <Row className="text-center">
            <Col>
              <button
                type="submit"
                style={{
                  width: "80%",
                  backgroundColor: "#3e2aa8",
                  border: "none",
                  color: "white",
                  padding: "12px",
                  borderRadius: "12px",
                  fontSize: "1.3rem",
                  fontWeight: "bold",
                }}
              >
                Reset Password
              </button>
            </Col>
          </Row>

          {msg && (
            <div
              className={`mt-3 alert ${
                msgType === "success"
                  ? "alert-success"
                  : msgType === "error"
                  ? "alert-danger"
                  : "alert-info"
              }`}
            >
              {msg}
            </div>
          )}
        </form>
      </Container>
    </Container>
  );
}
