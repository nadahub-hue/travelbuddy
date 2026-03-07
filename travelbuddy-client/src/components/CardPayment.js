import { Container, Row, Col, FormGroup, Label, Button } from "reactstrap";
import { useState } from "react";

// images
import visaImg from "../images/visa.png";
import amexImg from "../images/american-express.png";
import cardsImg from "../images/credit-card.png";

export default function CardPayment() {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [msg, setMsg] = useState(""); // ⭐ message for user

  const handlePay = (e) => {
    e.preventDefault();

    setMsg("Paid Successfully ✔");   // ⭐ success message
  };

  const fieldStyle = {
    borderRadius: "18px",
    padding: "18px",
    fontSize: "1.1rem",
    border: "2px solid #000",
  };

  return (
    <Container
      fluid
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        paddingTop: "30px",
      }}
    >
      <Container style={{ maxWidth: "980px" }}>
        {/* title + images */}
        <Row>
          <Col>
            <h1
              style={{
                fontSize: "3rem",
                fontWeight: "700",
                color: "#000",
                marginBottom: "6px",
              }}
            >
              Card
            </h1>

            <div style={{ display: "flex", gap: "14px", marginBottom: "28px" }}>
              <img src={visaImg} alt="Visa" style={{ height: "50px" }} />
              <img src={cardsImg} alt="Cards" style={{ height: "50px" }} />
              <img src={amexImg} alt="Amex" style={{ height: "50px" }} />
            </div>
          </Col>
        </Row>

        {/* form */}
        <Row>
          <Col>
            <form onSubmit={handlePay}>
              {/* name */}
              <FormGroup style={{ marginBottom: "28px" }}>
                <Label style={{ fontSize: "2rem", fontWeight: "600" }}>
                  Name on card
                </Label>
                <input
                  className="form-control"
                  style={fieldStyle}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </FormGroup>

              {/* card number */}
              <FormGroup style={{ marginBottom: "40px" }}>
                <Label style={{ fontSize: "2rem", fontWeight: "600" }}>
                  Card number
                </Label>
                <input
                  className="form-control"
                  style={fieldStyle}
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  required
                />
              </FormGroup>

              {/* expire + cvv */}
              <Row style={{ marginBottom: "40px" }}>
                <Col md="6">
                  <FormGroup>
                    <Label style={{ fontSize: "2rem", fontWeight: "600" }}>
                      Expire date
                    </Label>
                    <div style={{ fontSize: "1.4rem", color: "#777" }}>
                      Format: MM/YY
                    </div>
                    <input
                      className="form-control"
                      style={fieldStyle}
                      value={exp}
                      onChange={(e) => setExp(e.target.value)}
                      required
                    />
                  </FormGroup>
                </Col>

                <Col md="6">
                  <FormGroup>
                    <Label style={{ fontSize: "2rem", fontWeight: "600" }}>
                      Security code (cvv)
                    </Label>
                    <div style={{ fontSize: "1.4rem", color: "#777" }}>
                      3 or 4 digits
                    </div>
                    <input
                      className="form-control"
                      style={fieldStyle}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      required
                    />
                  </FormGroup>
                </Col>
              </Row>

              {/* Pay button */}
              <Row>
                <Col className="d-flex justify-content-center">
                  <Button
                    type="submit"
                    style={{
                      backgroundColor: "#5a28c8",
                      border: "none",
                      borderRadius: "22px",
                      padding: "16px 60px",
                      fontSize: "1.6rem",
                      fontWeight: "600",
                      width: "60%",
                    }}
                  >
                    Pay
                  </Button>
                </Col>
              </Row>

              {/* ⭐ Success message */}
              {msg && (
                <p
                  className="text-center mt-4"
                  style={{
                    color: "green",
                    fontSize: "1.5rem",
                    fontWeight: "600",
                  }}
                >
                  {msg}
                </p>
              )}
            </form>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}
