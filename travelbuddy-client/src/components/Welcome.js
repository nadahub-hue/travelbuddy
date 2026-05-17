import { Container, Row, Col, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLang } from "./LangContext";
import welcomeImg from "../images/welcome photo.png";

export default function Welcome() {
  const navigate = useNavigate();
  const { t } = useLang();

  const isUserLoggedIn = useSelector((s) => s.user.isLoggedIn);
  const isDriverLoggedIn = useSelector((s) => s.driver.isLoggedIn);
  const isAdminLoggedIn = useSelector((s) => s.admin.isLoggedIn);
  const isLoggedIn = isUserLoggedIn || isDriverLoggedIn || isAdminLoggedIn;

  return (
    <Container fluid className="p-0 welcome-page" style={{ minHeight: "100vh" }}>
      <div className="welcome-bg-shapes" aria-hidden="true">
        <div className="welcome-shape welcome-shape-1" />
        <div className="welcome-shape welcome-shape-2" />
        <div className="welcome-shape welcome-shape-3" />
      </div>
      <Row className="m-0 d-flex flex-column justify-content-between welcome-content" style={{ minHeight: "100vh" }}>
        <Col className="d-flex align-items-center justify-content-center welcome-hero-col">
          <Row className="w-100 m-0 align-items-center justify-content-center" style={{ maxWidth: "900px" }}>
            <Col md="6" className="text-center text-md-start welcome-title-col">
              <h1 className="welcome-title-line welcome-animate-1" style={{ color: "#7b238e", fontWeight: 700, fontSize: "3rem", margin: 0 }}>
                Travel
              </h1>
              <h1 className="welcome-title-line welcome-animate-2" style={{ color: "#800d0d", fontWeight: 700, fontSize: "3rem", marginTop: "-10px", marginLeft: "30px" }}>
                Buddy
              </h1>
              <p className="welcome-tagline welcome-animate-3 d-none d-md-block" style={{ color: "#5a3d7a", fontSize: "1.1rem", marginTop: "16px", marginLeft: "4px", fontWeight: 500 }}>
                {t("welcomeTagline")}
              </p>
            </Col>
            <Col md="6" className="text-center mt-4 mt-md-0 d-flex flex-column align-items-center welcome-img-col">
              <div className="welcome-img-wrap welcome-animate-4">
                <img src={welcomeImg} alt="Travel Buddy" className="welcome-hero-img" />
              </div>
            </Col>
          </Row>
        </Col>

        <Col className="text-center mt-3 welcome-greeting-col">
          <p className="welcome-greeting welcome-animate-5" style={{ color: "#800d0d", fontSize: "clamp(2rem, 6vw, 50px)", fontWeight: "bold", marginBottom: "10px" }}>
            {t("welcome")}
          </p>
        </Col>

        <Col xs="12" className="p-0">
          {!isLoggedIn && (
            <div className="welcome-cta-wrap welcome-animate-6">
              <Button
                className="border-0 rounded-0 welcome-cta-btn"
                onClick={() => navigate("/user-type")}
              >
                <span className="welcome-cta-text">{t("getStarted")}</span>
                <span className="welcome-cta-shine" aria-hidden="true" />
              </Button>
            </div>
          )}
        </Col>
      </Row>

      <style>{`
        .welcome-page {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #f6e9ff 0%, #fff5f8 40%, #ede4ff 70%, #f9f3ff 100%);
          background-size: 200% 200%;
          animation: welcome-bg-shift 12s ease infinite;
        }

        .welcome-bg-shapes {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .welcome-shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.35;
          filter: blur(40px);
        }

        .welcome-shape-1 {
          width: 280px;
          height: 280px;
          background: #9854c6;
          top: 8%;
          left: -5%;
          animation: welcome-float 8s ease-in-out infinite;
        }

        .welcome-shape-2 {
          width: 220px;
          height: 220px;
          background: #e8a0c0;
          top: 40%;
          right: -3%;
          animation: welcome-float 10s ease-in-out infinite reverse;
        }

        .welcome-shape-3 {
          width: 160px;
          height: 160px;
          background: #4b0082;
          bottom: 22%;
          left: 30%;
          animation: welcome-float 7s ease-in-out infinite 1s;
        }

        .welcome-content {
          position: relative;
          z-index: 1;
        }

        .welcome-animate-1 { animation: welcome-fade-up 0.8s ease both; }
        .welcome-animate-2 { animation: welcome-fade-up 0.8s ease 0.15s both; }
        .welcome-animate-3 { animation: welcome-fade-up 0.8s ease 0.3s both; }
        .welcome-animate-4 { animation: welcome-fade-up 0.9s ease 0.25s both; }
        .welcome-animate-5 { animation: welcome-fade-up 0.8s ease 0.45s both; }
        .welcome-animate-6 { animation: welcome-fade-up 0.9s ease 0.6s both; }

        .welcome-img-wrap {
          position: relative;
          display: inline-block;
        }

        .welcome-hero-img {
          max-width: 320px;
          width: 100%;
          animation: welcome-img-float 4s ease-in-out infinite;
          filter: drop-shadow(0 16px 32px rgba(75, 0, 130, 0.18));
        }

        .welcome-greeting {
          animation: welcome-greeting-pulse 3s ease-in-out infinite;
        }

        .welcome-cta-wrap {
          width: 100vw;
          margin: 0;
          padding: 0;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
        }

        .welcome-cta-btn {
          width: 100%;
          background: linear-gradient(90deg, #3e005a, #5c1a8a, #3e005a) !important;
          background-size: 200% 100% !important;
          color: #ffffff !important;
          font-size: 2rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          padding: 50px 0 !important;
          margin: 0;
          position: relative;
          overflow: hidden;
          animation: welcome-cta-gradient 4s ease infinite;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .welcome-cta-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 -8px 32px rgba(62, 0, 90, 0.35);
        }

        .welcome-cta-btn:active {
          transform: translateY(0);
        }

        .welcome-cta-text {
          position: relative;
          z-index: 2;
        }

        .welcome-cta-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: welcome-shine 3s ease-in-out infinite;
          z-index: 1;
        }

        @keyframes welcome-bg-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes welcome-fade-up {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes welcome-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(12px, -18px) scale(1.05); }
        }

        @keyframes welcome-img-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }

        @keyframes welcome-greeting-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); opacity: 0.92; }
        }

        @keyframes welcome-cta-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes welcome-shine {
          0% { left: -100%; }
          60%, 100% { left: 150%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .welcome-page,
          .welcome-shape,
          .welcome-hero-img,
          .welcome-greeting,
          .welcome-cta-btn,
          .welcome-cta-shine,
          [class*="welcome-animate-"] {
            animation: none !important;
          }
          [class*="welcome-animate-"] {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </Container>
  );
}
