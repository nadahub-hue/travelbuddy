import { Container, Row, Col } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { logout } from "../../slices/adminSlice";
import { useLang } from "../LangContext";

const BASE_URL = "http://localhost:7500";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { t } = useLang();
  const isAdminLoggedIn = useSelector((state) => state.admin.isLoggedIn);

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgColor, setMsgColor] = useState("green");
  const [rejectInputs, setRejectInputs] = useState({});
  const [reports, setReports] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [driverActivity, setDriverActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [expandedDriver, setExpandedDriver] = useState({});
  const [activeSection, setActiveSection] = useState("pending");
  const [flaggedIds, setFlaggedIds] = useState([]);
  const [driverFeedbacks, setDriverFeedbacks] = useState({});
  const [expandedFeedback, setExpandedFeedback] = useState({});
  const [notifyTarget, setNotifyTarget] = useState("all_users");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyBody, setNotifyBody] = useState("");
  const [notifySending, setNotifySending] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate("/admin-login");
    } else {
      fetchDrivers();
      fetchFlaggedDrivers();
    }
  }, [isAdminLoggedIn, navigate]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/drivers`);
      setDrivers(res.data?.drivers || []);
    } catch (err) {
      console.error("Error fetching drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/admin/reports`);
      setReports(res.data);
    } catch (err) {
      console.error("Reports error:", err);
    }
    setReportsLoading(false);
  };

  const fetchDriverActivity = async () => {
    setActivityLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/admin/driver-activity`);
      setDriverActivity(res.data?.drivers || []);
    } catch (err) {
      console.error("driver activity error:", err);
    }
    setActivityLoading(false);
  };

  const fetchFlaggedDrivers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/flagged-drivers`);
      setFlaggedIds(res.data?.flaggedDriverIds || []);
    } catch (_) {}
  };

  const toggleFeedback = async (driverId) => {
    if (expandedFeedback[driverId]) {
      setExpandedFeedback((prev) => ({ ...prev, [driverId]: false }));
      return;
    }
    setExpandedFeedback((prev) => ({ ...prev, [driverId]: true }));
    if (!driverFeedbacks[driverId]) {
      try {
        const res = await axios.get(`${BASE_URL}/admin/driver-feedback/${driverId}`);
        setDriverFeedbacks((prev) => ({ ...prev, [driverId]: res.data?.feedbacks || [] }));
      } catch (_) {}
    }
  };

  const showMsg = (text, color = "green") => {
    setMsg(text);
    setMsgColor(color);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleApprove = async (driverId) => {
    try {
      const res = await axios.patch(`${BASE_URL}/api/drivers/verifyDriver/${driverId}`, { action: "approve" });
      if (res.data?.flag) {
        showMsg("Driver approved successfully");
        fetchDrivers();
      } else {
        showMsg(res.data?.serverMsg || "Approval failed", "red");
      }
    } catch (err) {
      showMsg("Error approving driver", "red");
    }
  };

  const handleReject = async (driverId) => {
    const reason = rejectInputs[driverId] || "";
    try {
      const res = await axios.patch(`${BASE_URL}/api/drivers/verifyDriver/${driverId}`, { action: "reject", rejectionReason: reason });
      if (res.data?.flag) {
        showMsg("Driver rejected");
        setRejectInputs((prev) => ({ ...prev, [driverId]: "" }));
        fetchDrivers();
      } else {
        showMsg(res.data?.serverMsg || "Rejection failed", "red");
      }
    } catch (err) {
      showMsg("Error rejecting driver", "red");
    }
  };

  const handleRemove = async (driverId) => {
    try {
      const res = await axios.delete(`${BASE_URL}/admin/drivers/${driverId}`);
      if (res.data?.flag) {
        showMsg("Driver removed and notified");
        fetchDrivers();
      } else {
        showMsg(res.data?.serverMsg || "Remove failed", "red");
      }
    } catch (err) {
      showMsg("Error removing driver", "red");
    }
  };

  const handleSuspend = async (driverId) => {
    try {
      const res = await axios.patch(`${BASE_URL}/admin/drivers/${driverId}/suspend`);
      if (res.data?.flag) {
        showMsg(res.data.serverMsg || "Done");
        fetchDrivers();
      } else {
        showMsg(res.data?.serverMsg || "Failed", "red");
      }
    } catch (err) {
      showMsg("Error updating driver status", "red");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin-login");
  };

  const pendingDrivers   = drivers.filter((d) => d.status === "pending_verification");
  const verifiedDrivers  = drivers.filter((d) => d.status === "verified");
  const suspendedDrivers = drivers.filter((d) => d.status === "suspended");

  const th = { padding: "10px 14px", textAlign: "left", fontWeight: 700, whiteSpace: "nowrap" };
  const td = { padding: "10px 14px", verticalAlign: "middle" };

  const renderStars = (avg) => {
    if (avg == null) return <span style={{ color: "#aaa", fontSize: "0.85rem" }}>{t("noRatingYet")}</span>;
    const full = Math.round(avg);
    return (
      <span title={`${avg} / 5`}>
        <span style={{ color: "#ffb400", fontSize: "1rem", letterSpacing: 1 }}>
          {"★".repeat(full)}{"☆".repeat(5 - full)}
        </span>
        <span style={{ marginLeft: 6, fontWeight: 700, color: "#4b0082", fontSize: "0.85rem" }}>
          {avg}
        </span>
      </span>
    );
  };

  if (!isAdminLoggedIn) return <div>{t("loading")}</div>;

  const driverCard = (driver, showApproveReject, showRemove, showSuspend = false, showFeedback = true) => {
    const isFlagged = flaggedIds.includes(driver._id);
    return (
      <div
        key={driver._id}
        style={{
          background: isFlagged ? "#fff3e0" : "#f5f5f5",
          padding: "15px",
          marginBottom: "15px",
          borderRadius: "10px",
          borderLeft: isFlagged ? "4px solid #e65100" : "none",
        }}
      >
        {isFlagged && (
          <div style={{ color: "#e65100", fontWeight: 700, marginBottom: 8 }}>
            ⚠️ {t("flaggedWarning")}
          </div>
        )}
        <p><b>{t("driverName")}:</b> {driver.driverName}</p>
        <p><b>{t("driverEmail")}:</b> {driver.driverEmail}</p>
        <p><b>{t("driverPhone")}:</b> {driver.driverPhone}</p>
        <p><b>{t("driverVehicle")}:</b> {driver.vehicleModel}</p>
        <p><b>{t("driverPlate")}:</b> {driver.plateNumber}</p>
        <p><b>{t("driverLicense")}:</b> {driver.licenseNumber}</p>
        <p><b>{t("driverExp")}:</b> {driver.experienceYears} {t("yearsExp")}</p>
        <p><b>{t("driverStatus")}:</b> {driver.status}</p>
        {driver.rejectionReason && <p style={{ color: "#c0392b" }}><b>{t("driverRejReason")}:</b> {driver.rejectionReason}</p>}
        {driver.licenseImage && (
          <p><b>{t("licensePdf")}:</b>{" "}
            <a href={`${BASE_URL}/uploads/${driver.licenseImage}`} target="_blank" rel="noreferrer">{t("viewLink")}</a>
          </p>
        )}
        {driver.permitImage && (
          <p><b>{t("permitPdf")}:</b>{" "}
            <a href={`${BASE_URL}/uploads/${driver.permitImage}`} target="_blank" rel="noreferrer">{t("viewLink")}</a>
          </p>
        )}
        {driver.carRegistrationImage && (
          <p><b>{t("carRegPdf")}:</b>{" "}
            <a href={`${BASE_URL}/uploads/${driver.carRegistrationImage}`} target="_blank" rel="noreferrer">{t("viewLink")}</a>
          </p>
        )}

        {showFeedback && (
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={() => toggleFeedback(driver._id)}
              style={{ background: "#e8d5f5", color: "#4b0082", border: "none", borderRadius: 20, padding: "6px 16px", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}
            >
              {expandedFeedback[driver._id] ? t("hideFeedback") : t("showFeedback")}
            </button>

            {expandedFeedback[driver._id] && (
              <div style={{ marginTop: 10, background: "#fff", borderRadius: 10, padding: "10px 14px" }}>
                {!driverFeedbacks[driver._id] ? (
                  <p style={{ color: "#888" }}>{t("loadingDrivers")}</p>
                ) : driverFeedbacks[driver._id].length === 0 ? (
                  <p style={{ color: "#888" }}>{t("noFeedbackYet")}</p>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
                      {[1,2,3,4,5].map((star) => {
                        const count = driverFeedbacks[driver._id].filter((f) => f.rating === star).length;
                        return (
                          <span key={star} style={{ fontSize: "0.85rem", color: star === 1 ? "#c0392b" : "#555" }}>
                            {"★".repeat(star)} × {count}
                          </span>
                        );
                      })}
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#4b0082" }}>
                        {t("avgRating")}: {(driverFeedbacks[driver._id].reduce((s, f) => s + f.rating, 0) / driverFeedbacks[driver._id].length).toFixed(1)} / 5
                      </span>
                    </div>
                    <div style={{ maxHeight: 180, overflowY: "auto" }}>
                      {driverFeedbacks[driver._id].map((f, i) => (
                        <div key={i} style={{ borderBottom: "1px solid #eee", paddingBottom: 6, marginBottom: 6 }}>
                          <span style={{ color: f.rating <= 2 ? "#c0392b" : "#27ae60", fontWeight: 700 }}>{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</span>
                          {f.comment && <span style={{ marginLeft: 8, fontSize: "0.9rem", color: "#555" }}>{f.comment}</span>}
                          <span style={{ marginLeft: 8, fontSize: "0.75rem", color: "#aaa" }}>{f.userEmail}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
          {showApproveReject && (
            <>
              <button
                onClick={() => handleApprove(driver._id)}
                style={{ backgroundColor: "green", color: "white", border: "none", padding: "8px 20px", borderRadius: "20px", cursor: "pointer" }}
              >
                {t("approve")}
              </button>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder={t("rejectionReason")}
                  value={rejectInputs[driver._id] || ""}
                  onChange={(e) => setRejectInputs((prev) => ({ ...prev, [driver._id]: e.target.value }))}
                  style={{ border: "1px solid #ccc", borderRadius: "20px", padding: "6px 14px", fontSize: "0.9rem", outline: "none" }}
                />
                <button
                  onClick={() => handleReject(driver._id)}
                  style={{ backgroundColor: "#c0392b", color: "white", border: "none", padding: "8px 20px", borderRadius: "20px", cursor: "pointer" }}
                >
                  {t("reject")}
                </button>
              </div>
            </>
          )}

          {showRemove && (
            <button
              onClick={() => handleRemove(driver._id)}
              style={{ backgroundColor: "#555", color: "white", border: "none", padding: "8px 20px", borderRadius: "20px", cursor: "pointer" }}
            >
              {t("removeAndNotify")}
            </button>
          )}

          {showSuspend && (
            <button
              onClick={() => handleSuspend(driver._id)}
              style={{
                backgroundColor: driver.status === "suspended" ? "#27ae60" : "#e67e22",
                color: "white", border: "none", padding: "8px 20px", borderRadius: "20px", cursor: "pointer",
              }}
            >
              {driver.status === "suspended" ? t("reinstate") : t("suspend")}
            </button>
          )}
        </div>
      </div>
    );
  };

  const handleSendNotification = async () => {
    if (!notifyTitle.trim() || !notifyBody.trim()) {
      showMsg("Title and message are required", "red");
      return;
    }
    if (notifyTarget === "specific" && !notifyEmail.trim()) {
      showMsg("Please enter an email address", "red");
      return;
    }
    setNotifySending(true);
    try {
      const res = await axios.post(`${BASE_URL}/admin/notify`, {
        target: notifyTarget,
        email: notifyEmail,
        title: notifyTitle,
        body: notifyBody,
      });
      if (res.data?.flag) {
        showMsg(res.data.serverMsg || "Notification sent!");
        setNotifyTitle("");
        setNotifyBody("");
        setNotifyEmail("");
      } else {
        showMsg(res.data?.serverMsg || "Failed to send", "red");
      }
    } catch (err) {
      showMsg("Error sending notification", "red");
    }
    setNotifySending(false);
  };

  const SECTIONS = [
    { id: "pending",   label: `${t("pendingDrivers")} (${pendingDrivers.length})` },
    { id: "verified",  label: `${t("verifiedDrivers")} (${verifiedDrivers.length})` },
    { id: "suspended", label: `${t("suspendedDrivers")} (${suspendedDrivers.length})` },
    { id: "reports",   label: t("platformReports") },
    { id: "notify",    label: t("sendNotification") },
  ];

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col className="text-center">
          <h1 style={{ color: "#4b0082", fontWeight: "bold" }}>{t("adminDashboard")}</h1>
        </Col>
      </Row>

      {msg && (
        <Row className="mb-3">
          <Col className="text-center">
            <div style={{ backgroundColor: msgColor === "green" ? "#e0ffe0" : "#ffe0e0", padding: "10px", borderRadius: "10px", fontWeight: "bold", color: msgColor }}>
              {msg}
            </div>
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        <Col>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSection(s.id);
                  if (s.id === "reports") {
                    if (!reports) fetchReports();
                    fetchDriverActivity();
                  }
                }}
                style={{
                  padding: "10px 22px",
                  borderRadius: "30px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  background: activeSection === s.id ? "#4b0082" : "#e8d5f5",
                  color: activeSection === s.id ? "#fff" : "#4b0082",
                  transition: "all 0.2s",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Col>
      </Row>

      {activeSection === "pending" && (
        <Row className="mb-5">
          <Col>
            <h3 style={{ marginBottom: "20px" }}>{t("pendingDrivers")}</h3>
            {loading ? <p>{t("loadingDrivers")}</p> :
              pendingDrivers.length === 0 ? <p>{t("noPendingDrivers")}</p> :
              pendingDrivers.map((driver) => driverCard(driver, true, false, false, false))}
          </Col>
        </Row>
      )}

      {activeSection === "verified" && (
        <Row className="mb-5">
          <Col>
            <h3 style={{ marginBottom: "20px" }}>{t("verifiedDrivers")}</h3>
            {loading ? <p>{t("loadingDrivers")}</p> :
              verifiedDrivers.length === 0 ? <p>{t("noVerifiedDrivers")}</p> :
              verifiedDrivers.map((driver) => driverCard(driver, false, true, true))}
          </Col>
        </Row>
      )}

      {activeSection === "suspended" && (
        <Row className="mb-5">
          <Col>
            <h3 style={{ marginBottom: "20px", color: "#e67e22" }}>{t("suspendedDrivers")}</h3>
            {loading ? <p>{t("loadingDrivers")}</p> :
              suspendedDrivers.length === 0 ? <p>{t("noSuspendedDrivers")}</p> :
              suspendedDrivers.map((driver) => driverCard(driver, false, true, true))}
          </Col>
        </Row>
      )}

      {activeSection === "reports" && (
        <Row className="mb-5">
          <Col>
            <h3 style={{ marginBottom: "20px" }}>{t("platformReports")}</h3>
            {reportsLoading ? (
              <p>{t("loadingReports")}</p>
            ) : reports ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
                {[
                  [t("totalUsers"), reports.totalUsers, "#4b0082"],
                  [t("totalDrivers"), reports.totalDrivers, "#1565c0"],
                  [t("totalTrips"), reports.totalTrips, "#2e7d32"],
                  [t("totalBookings"), reports.totalBookings, "#e65100"],
                  [t("totalRevenue"), reports.totalRevenue, "#ad1457"],
                  [t("avgRating"), reports.avgRating + " / 5", "#f57f17"],
                  [t("totalFeedbacks"), reports.totalFeedbacks, "#6a1b9a"],
                ].map(([label, value, color]) => (
                  <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderTop: `4px solid ${color}` }}>
                    <div style={{ fontSize: "0.82rem", color: "#888", fontWeight: 600, marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 700, color }}>{value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <button
                onClick={() => { fetchReports(); fetchDriverActivity(); }}
                style={{ background: "#4b0082", color: "#fff", border: "none", borderRadius: 20, padding: "10px 24px", cursor: "pointer", fontWeight: 600 }}
              >
                {t("loadReports")}
              </button>
            )}

            {/* Driver Activity Table */}
            <div style={{ marginTop: 32 }}>
              <h4 style={{ color: "#4b0082", marginBottom: 16 }}>{t("driverActivityTitle")}</h4>
              {activityLoading ? (
                <p>{t("loadingDrivers")}</p>
              ) : driverActivity === null ? null : driverActivity.length === 0 ? (
                <p style={{ color: "#888" }}>{t("noDriverActivity")}</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
                    <thead>
                      <tr style={{ background: "#4b0082", color: "#fff" }}>
                        <th style={th}>{t("driverName")}</th>
                        <th style={th}>{t("driverVehicle")}</th>
                        <th style={th}>{t("driverPlate")}</th>
                        <th style={th}>{t("driverRating")}</th>
                        <th style={th}>{t("totalPassengers")}</th>
                        <th style={th}>{t("totalRevenue")}</th>
                        <th style={th}>{t("trips")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driverActivity.map((d) => (
                        <Fragment key={d.driverId}>
                          <tr style={{ background: "#f5f0ff", borderBottom: "2px solid #e0d0ff" }}>
                            <td style={td}>{d.driverName}</td>
                            <td style={td}>{d.vehicleModel || "—"}</td>
                            <td style={td}>{d.plateNumber || "—"}</td>
                            <td style={td}>
                              {renderStars(d.avgRating)}
                              {d.feedbackCount > 0 && (
                                <div style={{ fontSize: "0.75rem", color: "#888", marginTop: 2 }}>
                                  {d.feedbackCount} {t("reviews")}
                                </div>
                              )}
                            </td>
                            <td style={td}>{d.totalPassengers}</td>
                            <td style={td}>{Number(d.totalRevenue || 0).toFixed(3)}</td>
                            <td style={td}>
                              <button
                                type="button"
                                onClick={() => setExpandedDriver((prev) => ({ ...prev, [d.driverId]: !prev[d.driverId] }))}
                                style={{ background: "#e8d5f5", color: "#4b0082", border: "none", borderRadius: 12, padding: "4px 12px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
                              >
                                {expandedDriver[d.driverId] ? "▲" : "▼"} {d.trips.length}
                              </button>
                            </td>
                          </tr>
                          {expandedDriver[d.driverId] && d.trips.map((trip, i) => (
                            <tr key={`${d.driverId}-trip-${i}`} style={{ background: "#faf5ff", borderBottom: "1px solid #ede0ff" }}>
                              <td style={{ ...td, paddingLeft: 24, color: "#555", fontSize: "0.85rem" }} colSpan={3}>
                                📍 {trip.from} → {trip.to}
                              </td>
                              <td style={{ ...td, color: "#888", fontSize: "0.8rem" }}>—</td>
                              <td style={{ ...td, color: "#555", fontSize: "0.85rem" }}>
                                {trip.passengers}
                                {trip.participantEmails?.length > 0 && (
                                  <div style={{ fontSize: "0.75rem", color: "#999", marginTop: 2 }}>
                                    {trip.participantEmails.join(", ")}
                                  </div>
                                )}
                              </td>
                              <td style={{ ...td, color: "#555", fontSize: "0.85rem" }}>
                                {Number(trip.totalFare || 0).toFixed(3)}
                                {trip.farePerPerson > 0 && (
                                  <div style={{ fontSize: "0.75rem", color: "#999" }}>
                                    {Number(trip.farePerPerson).toFixed(3)} / person
                                  </div>
                                )}
                              </td>
                              <td style={{ ...td, color: "#888", fontSize: "0.8rem" }}>
                                {trip.date ? new Date(trip.date).toLocaleDateString() : "—"} · {trip.status}
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Col>
        </Row>
      )}

      {activeSection === "notify" && (
        <Row className="mb-5">
          <Col md={{ size: 6, offset: 3 }}>
            <h3 style={{ marginBottom: "20px" }}>{t("sendNotification")}</h3>
            <div style={{ background: "#fff", borderRadius: 12, padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>{t("sendTo")}</label>
                <select
                  value={notifyTarget}
                  onChange={(e) => setNotifyTarget(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", fontSize: "1rem" }}
                >
                  <option value="all_users">{t("allUsers")}</option>
                  <option value="all_drivers">{t("allDrivers")}</option>
                  <option value="specific">{t("specificEmail")}</option>
                </select>
              </div>
              {notifyTarget === "specific" && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>{t("emailAddress2")}</label>
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="user@example.com"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", fontSize: "1rem" }}
                  />
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>{t("notifTitle")}</label>
                <input
                  type="text"
                  value={notifyTitle}
                  onChange={(e) => setNotifyTitle(e.target.value)}
                  placeholder={t("notifTitlePlaceholder")}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", fontSize: "1rem" }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>{t("notifMessage")}</label>
                <textarea
                  value={notifyBody}
                  onChange={(e) => setNotifyBody(e.target.value)}
                  placeholder={t("notifBodyPlaceholder")}
                  rows={4}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", fontSize: "1rem", resize: "vertical" }}
                />
              </div>
              <button
                onClick={handleSendNotification}
                disabled={notifySending}
                style={{
                  width: "100%", padding: "12px", borderRadius: 30, border: "none",
                  background: notifySending ? "#aaa" : "#4b0082", color: "#fff",
                  fontWeight: 700, fontSize: "1rem", cursor: notifySending ? "not-allowed" : "pointer",
                }}
              >
                {notifySending ? t("sending") : t("sendNotifBtn")}
              </button>
            </div>
          </Col>
        </Row>
      )}

      <Row className="mt-4">
        <Col className="text-center">
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#6910bc", color: "#ffffff", border: "none",
              borderRadius: "30px", padding: "12px 40px",
              fontSize: "1.2rem", fontWeight: "bold", cursor: "pointer",
            }}
          >
            {t("logout")}
          </button>
        </Col>
      </Row>
    </Container>
  );
}