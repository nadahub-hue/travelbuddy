import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardBody,
} from "reactstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ConformBooking() {
  const location = useLocation();
  const navigate = useNavigate();

  const [cancelMsg, setCancelMsg] = useState("");

  const { startLocation, endLocation } = location.state || {};

  const handleConfirm = () => {
    navigate("/payment-method");
  };

  const handleCancel = () => {
    setCancelMsg("Cancel is Done");
  };

  return (
    <Container fluid className="py-4">
      <Container style={{ maxWidth: "700px" }}>

        {/* Title */}
        <Row className="mb-4">
          <Col className="text-center">
            <h2 style={{ color: "#4b0082", fontWeight: "700" }}>
              Confirm Booking
            </h2>
            <p style={{ color: "#555" }}>
              Please review your trip details before you continue.
            </p>
          </Col>
        </Row>

        {/* Booking Info Card */}
        <Card className="shadow-sm mb-4">
          <CardBody>
            <h5 style={{ fontWeight: "600", marginBottom: "15px" }}>
              Booking Information
            </h5>
            <p>
              <strong>Start Location:</strong> {startLocation || "Not provided"}
            </p>
            <p>
              <strong>End Location:</strong> {endLocation || "Not provided"}
            </p>
          </CardBody>
        </Card>

        {/* Cancel message */}
        {cancelMsg && (
          <div
            style={{
              backgroundColor: "#e5d4ff",
              padding: "12px 20px",
              borderRadius: "8px",
              color: "#4b0082",
              fontWeight: "600",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            {cancelMsg}
          </div>
        )}

        {/* Buttons */}
        <Row className="g-3">
          <Col md="6" className="text-md-start text-center">
            <Button
              className="w-100"
              style={{
                backgroundColor: "#4b0082",
                borderColor: "#4b0082",
                fontWeight: "600",
              }}
              onClick={handleConfirm}
            >
              Confirm Booking
            </Button>
          </Col>

          <Col md="6" className="text-md-end text-center">
            <Button
              className="w-100"
              style={{
                backgroundColor: "#cccccc",
                borderColor: "#cccccc",
                color: "#333",
                fontWeight: "600",
              }}
              onClick={handleCancel}
            >
              Cancel Booking
            </Button>



            <br /> <br /><br /><br /><br /><br /><br /><br /><br /><br />
            <Button
              onClick={() => navigate("/booking")}
              style={{
                backgroundColor: "#9854c6",
                color: "#ffffff"
              }}
            >
              Back
            </Button>
          </Col>

        </Row>

      </Container>
    </Container>
  );
}
