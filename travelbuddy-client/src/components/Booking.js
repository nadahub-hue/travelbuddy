import { Container, Row, Col, FormGroup, Label, Button } from "reactstrap";
import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLang } from "./LangContext";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function MapPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function Booking() {
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const prefilled = location.state || {};

  const [startLocation, setStartLocation] = useState(prefilled.startLocation || "");
  const [endLocation, setEndLocation]     = useState(prefilled.endLocation || "");
  const [msg, setMsg]                     = useState("");
  const [pickupPin, setPickupPin]         = useState(null);
  const [dropoffPin, setDropoffPin]       = useState(null);
  const [pinMode, setPinMode]             = useState("pickup");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startLocation.trim() || !endLocation.trim()) {
      setMsg(t("fillBothLocations"));
      return;
    }
    setMsg(t("savedSuccessfully"));
    setTimeout(() => {
      navigate("/payment-method", {
        state: {
          startLocation,
          endLocation,
          pickupLat: pickupPin?.[0],
          pickupLng: pickupPin?.[1],
          dropoffLat: dropoffPin?.[0],
          dropoffLng: dropoffPin?.[1],
          fare: prefilled.fare || 0,
        },
      });
    }, 1000);
  };

  const handleMapClick = useCallback(async (pos) => {
    if (pinMode === "pickup") setPickupPin(pos);
    else setDropoffPin(pos);

    // Reverse-geocode the dropped pin (lat/lng → human-readable address) using
    // OpenStreetMap's free Nominatim service. No API key required.
    try {
      const [lat, lng] = pos;
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;
      const res = await fetch(url, {
        headers: { "Accept-Language": "en" },
      });
      const data = await res.json();

      // Build a short, readable label. Prefer specific fields if available,
      // fall back to the full display_name.
      const a = data.address || {};
      const parts = [
        a.road || a.pedestrian || a.neighbourhood || a.suburb,
        a.city || a.town || a.village || a.county,
        a.country,
      ].filter(Boolean);
      const label = parts.length > 0 ? parts.join(", ") : (data.display_name || "");

      if (label) {
        if (pinMode === "pickup") setStartLocation(label);
        else setEndLocation(label);
      }
    } catch (err) {
      // Network/CORS errors just leave the text field untouched.
      console.warn("Reverse geocoding failed:", err);
    }
  }, [pinMode]);

  return (
    <Container fluid className="py-4">
      <Container style={{ maxWidth: "900px" }}>
        <Row className="mb-4">
          <Col className="text-center">
            <h2 style={{ color: "#4b0082", fontWeight: "700" }}>{t("bookYourRide")}</h2>
            <p style={{ color: "#555" }}>{t("enterLocationsHint")}</p>
          </Col>
        </Row>

        <form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md="6">
              <FormGroup>
                <Label style={{ fontWeight: "600" }}>{t("startLocation")}</Label>
                <input
                  className="form-control"
                  placeholder={t("startLocationPlaceholder")}
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  required
                />
              </FormGroup>
            </Col>

            <Col md="6">
              <FormGroup>
                <Label style={{ fontWeight: "600" }}>{t("endLocation")}</Label>
                <input
                  className="form-control"
                  placeholder={t("endLocationPlaceholder")}
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  required
                />
              </FormGroup>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col className="text-center">
              <Button
                type="submit"
                style={{ backgroundColor: "#4b0082", borderColor: "#4b0082", padding: "10px 40px", fontWeight: "600" }}
              >
                {t("saveLocations")}
              </Button>
            </Col>
          </Row>

          {msg && (
            <Row>
              <Col className="text-center">
                <p style={{ color: msg.includes("✓") ? "green" : "red", fontWeight: "bold", fontSize: "1.1rem" }}>
                  {msg}
                </p>
              </Col>
            </Row>
          )}
        </form>

        <Row className="mt-3 mb-2">
          <Col>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600, color: "#4b0082" }}>{t("pinOnMap")}:</span>
              <button
                type="button"
                onClick={() => setPinMode("pickup")}
                style={{
                  padding: "8px 20px", borderRadius: 20, border: "none",
                  background: pinMode === "pickup" ? "#4b0082" : "#e0d5f5",
                  color: pinMode === "pickup" ? "#fff" : "#4b0082",
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                📍 {t("pickupPoint")}
              </button>
              <button
                type="button"
                onClick={() => setPinMode("dropoff")}
                style={{
                  padding: "8px 20px", borderRadius: 20, border: "none",
                  background: pinMode === "dropoff" ? "#4b0082" : "#e0d5f5",
                  color: pinMode === "dropoff" ? "#fff" : "#4b0082",
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                🏁 {t("dropoffPoint")}
              </button>
              {pickupPin && <span style={{ fontSize: "0.85rem", color: "#555" }}>{t("pickupPoint")}: {pickupPin[0].toFixed(4)}, {pickupPin[1].toFixed(4)}</span>}
              {dropoffPin && <span style={{ fontSize: "0.85rem", color: "#555" }}>{t("dropoffPoint")}: {dropoffPin[0].toFixed(4)}, {dropoffPin[1].toFixed(4)}</span>}
            </div>
          </Col>
        </Row>

        <Row>
          <Col>
            <div style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", height: 420 }}>
              <MapContainer center={[23.5880, 58.3829]} zoom={7} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                />
                <MapPicker
                  position={pinMode === "pickup" ? pickupPin : dropoffPin}
                  setPosition={handleMapClick}
                />
                {pickupPin && pinMode !== "pickup" && <Marker position={pickupPin} />}
                {dropoffPin && pinMode !== "dropoff" && <Marker position={dropoffPin} />}
              </MapContainer>
            </div>
            <p style={{ textAlign: "center", color: "#888", fontSize: "0.85rem", marginTop: 8 }}>
              {t("clickToPlacePin")} {pinMode === "pickup" ? t("pickupPoint") : t("dropoffPoint")}
            </p>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}