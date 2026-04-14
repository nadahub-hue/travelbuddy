import { Container, Row, Col } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { logout } from "../../slices/adminSlice";

const BASE_URL = "http://localhost:7500/admin";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdminLoggedIn = useSelector((state) => state.admin.isLoggedIn);

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate("/admin-login");
    } else {
      fetchDrivers();
    }
  }, [isAdminLoggedIn, navigate]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/drivers`);
      setDrivers(res.data?.drivers || []);
    } catch (err) {
      console.error("Error fetching drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (driverId) => {
    try {
      const res = await axios.put(`${BASE_URL}/approveDriver/${driverId}`);
      if (res.data?.flag) {
        setMsg("Driver approved successfully");

        fetchDrivers();
      } else {
        setMsg(res.data?.serverMsg || "Approval failed");
      }
    } catch (err) {
      console.error("Approval error:", err);
      setMsg("Error approving driver");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin-login");
  };

  if (!isAdminLoggedIn) {
    return <div>Loading...</div>;
  }

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col className="text-center">
          <h1 style={{ color: "#4b0082", fontWeight: "bold" }}>
            Admin Dashboard
          </h1>
        </Col>
      </Row>

      {msg && (
        <Row className="mb-3">
          <Col className="text-center">
            <div
              style={{
                backgroundColor: "#e0ffe0",
                padding: "10px",
                borderRadius: "10px",
                fontWeight: "bold",
              }}
            >
              {msg}
            </div>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <h3 style={{ marginBottom: "20px" }}>Pending Drivers</h3>

          {loading ? (
            <p>Loading drivers...</p>
          ) : drivers.length === 0 ? (
            <p>No drivers found</p>
          ) : (
            drivers.map((driver) => (
              <div
                key={driver._id}
                style={{
                  background: "#f5f5f5",
                  padding: "15px",
                  marginBottom: "15px",
                  borderRadius: "10px",
                }}
              >
                <p><b>Name:</b> {driver.driverName}</p>
                <p><b>Email:</b> {driver.driverEmail}</p>
                <p><b>Phone:</b> {driver.driverPhone}</p>
                <p><b>Vehicle:</b> {driver.vehicleModel}</p>
                <p><b>Experience:</b> {driver.experienceYears} years</p>

                <button
                  onClick={() => handleApprove(driver._id)}
                  style={{
                    backgroundColor: "green",
                    color: "white",
                    border: "none",
                    padding: "8px 20px",
                    borderRadius: "20px",
                    cursor: "pointer",
                  }}
                >
                  Approve
                </button>
              </div>
            ))
          )}
        </Col>
      </Row>

      <Row className="mt-4">
        <Col className="text-center">
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#6910bc",
              color: "#ffffff",
              border: "none",
              borderRadius: "30px",
              padding: "12px 40px",
              fontSize: "1.2rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </Col>
      </Row>
    </Container>
  );
}