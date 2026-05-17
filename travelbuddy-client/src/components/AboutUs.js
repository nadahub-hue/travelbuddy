import { Container, Row, Col } from "reactstrap";
import { useLang } from "./LangContext";
import commuImage from "../images/communication.png";

const FEATURES = [
  { icon: "🤝", key: "aboutFeature1", color: "#6E2F8A", delay: "0.5s" },
  { icon: "💬", key: "aboutFeature2", color: "#1565c0", delay: "0.65s" },
  { icon: "🌱", key: "aboutFeature3", color: "#2e7d32", delay: "0.8s" },
  { icon: "🇴🇲", key: "aboutFeature4", color: "#c62828", delay: "0.95s" },
];

export default function AboutUs() {
  const { t } = useLang();

  return (
    <Container fluid className="p-0 about-page" style={{ minHeight: "calc(100vh - 82px)" }}>
      <div className="about-bg-shapes" aria-hidden="true">
        <div className="about-shape about-shape-1" />
        <div className="about-shape about-shape-2" />
        <div className="about-shape about-shape-3" />
        <div className="about-shape about-shape-4" />
      </div>

      <Container fluid className="about-content" style={{ padding: "40px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <Row className="align-items-center g-4 g-lg-5">
          <Col lg="6" xs="12" className="about-text-col">
            <div className="about-title-wrap about-anim-1">
              <span className="about-badge">{t("about")}</span>
              <h1 className="about-title">{t("aboutUsTitle")}</h1>
              <div className="about-title-line" />
            </div>

            <div className="about-features about-anim-2">
              {FEATURES.map((f) => (
                <div
                  key={f.key}
                  className="about-feature-pill"
                  style={{ animationDelay: f.delay, borderColor: f.color }}
                >
                  <span className="about-feature-icon">{f.icon}</span>
                  <span>{t(f.key)}</span>
                </div>
              ))}
            </div>

            <div className="about-paragraphs">
              {[t("aboutP1"), t("aboutP2"), t("aboutP3"), t("aboutP4")].map((text, i) => (
                <p
                  key={i}
                  className={`about-p about-anim-p${i + 1}`}
                  style={{ animationDelay: `${0.35 + i * 0.12}s` }}
                >
                  {text}
                </p>
              ))}
            </div>
          </Col>

          <Col lg="6" xs="12" className="d-flex justify-content-center align-items-center about-visual-col">
            <div className="about-visual about-anim-visual">
              <div className="about-ring about-ring-1" />
              <div className="about-ring about-ring-2" />
              <div className="about-ring about-ring-3" />
              <img src={commuImage} alt="About illustration" className="about-hero-img" />
            </div>
          </Col>
        </Row>
      </Container>

      <style>{`
        .about-page {
          position: relative;
          overflow: hidden;
          background: linear-gradient(160deg, #f3e8ff 0%, #fff 35%, #fce8f0 65%, #ede7f6 100%);
          background-size: 220% 220%;
          animation: about-bg-flow 14s ease infinite;
        }

        .about-bg-shapes {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .about-shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(50px);
          opacity: 0.4;
        }

        .about-shape-1 {
          width: 320px;
          height: 320px;
          background: #9854c6;
          top: -5%;
          right: 10%;
          animation: about-drift 9s ease-in-out infinite;
        }

        .about-shape-2 {
          width: 260px;
          height: 260px;
          background: #ff8a80;
          bottom: 10%;
          left: -8%;
          animation: about-drift 11s ease-in-out infinite reverse;
        }

        .about-shape-3 {
          width: 200px;
          height: 200px;
          background: #4b0082;
          top: 45%;
          left: 40%;
          animation: about-drift 8s ease-in-out infinite 0.5s;
        }

        .about-shape-4 {
          width: 140px;
          height: 140px;
          background: #81c784;
          bottom: 25%;
          right: 5%;
          animation: about-drift 7s ease-in-out infinite 1s;
        }

        .about-content {
          position: relative;
          z-index: 1;
        }

        .about-anim-1 { animation: about-slide-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .about-anim-2 { animation: about-slide-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both; }
        .about-anim-visual { animation: about-scale-in 1s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both; }

        .about-anim-p1, .about-anim-p2, .about-anim-p3, .about-anim-p4 {
          animation: about-fade-up 0.75s ease both;
        }

        .about-badge {
          display: inline-block;
          background: linear-gradient(90deg, #6E2F8A, #9c27b0);
          color: #fff;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 20px;
          margin-bottom: 12px;
          animation: about-badge-glow 2.5s ease-in-out infinite;
        }

        .about-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 800;
          color: #6E2F8A;
          margin: 0 0 12px 0;
          line-height: 1.1;
        }

        .about-title-line {
          height: 5px;
          width: 0;
          max-width: 120px;
          background: linear-gradient(90deg, #6E2F8A, #e91e63);
          border-radius: 4px;
          animation: about-line-grow 1s ease 0.4s forwards;
        }

        .about-features {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 28px 0 24px;
        }

        .about-feature-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.85);
          border: 2px solid;
          border-radius: 30px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
          box-shadow: 0 4px 14px rgba(110, 47, 138, 0.12);
          animation: about-pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .about-feature-pill:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 8px 24px rgba(110, 47, 138, 0.2);
        }

        .about-feature-icon {
          font-size: 1.2rem;
        }

        .about-p {
          font-size: 1.15rem;
          line-height: 1.75;
          color: #333;
          margin-bottom: 1rem;
        }

        .about-visual {
          position: relative;
          width: 100%;
          max-width: 480px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .about-ring {
          position: absolute;
          border-radius: 50%;
          border: 3px solid rgba(110, 47, 138, 0.25);
        }

        .about-ring-1 {
          width: 100%;
          height: 100%;
          min-width: 280px;
          min-height: 280px;
          animation: about-ring-spin 20s linear infinite;
        }

        .about-ring-2 {
          width: 88%;
          height: 88%;
          min-width: 240px;
          min-height: 240px;
          border-color: rgba(233, 30, 99, 0.2);
          animation: about-ring-spin 15s linear infinite reverse;
        }

        .about-ring-3 {
          width: 76%;
          height: 76%;
          min-width: 200px;
          min-height: 200px;
          border-style: dashed;
          border-color: rgba(76, 175, 80, 0.35);
          animation: about-ring-pulse 3s ease-in-out infinite;
        }

        .about-hero-img {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 2;
          animation: about-img-float 5s ease-in-out infinite;
          filter: drop-shadow(0 20px 40px rgba(110, 47, 138, 0.25));
        }

        @keyframes about-bg-flow {
          0%, 100% { background-position: 0% 40%; }
          50% { background-position: 100% 60%; }
        }

        @keyframes about-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -25px) scale(1.08); }
          66% { transform: translate(-15px, 15px) scale(0.95); }
        }

        @keyframes about-slide-in {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes about-scale-in {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes about-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes about-pop-in {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes about-line-grow {
          to { width: 120px; }
        }

        @keyframes about-badge-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(110, 47, 138, 0.4); }
          50% { box-shadow: 0 0 20px 4px rgba(110, 47, 138, 0.25); }
        }

        @keyframes about-img-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(1deg); }
        }

        @keyframes about-ring-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes about-ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.06); opacity: 1; }
        }

        @media (max-width: 991px) {
          .about-visual-col { order: -1; margin-bottom: 20px; }
          .about-features { justify-content: center; }
          .about-title-wrap { text-align: center; }
          .about-title-line { margin: 0 auto; }
        }

        @media (prefers-reduced-motion: reduce) {
          .about-page,
          .about-shape,
          .about-badge,
          .about-title-line,
          .about-feature-pill,
          .about-hero-img,
          .about-ring,
          [class*="about-anim-"] {
            animation: none !important;
          }
          .about-title-line { width: 120px; }
          [class*="about-anim-"] { opacity: 1; transform: none; }
        }
      `}</style>
    </Container>
  );
}
