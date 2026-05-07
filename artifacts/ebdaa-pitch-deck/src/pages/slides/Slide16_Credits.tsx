const base = import.meta.env.BASE_URL;
const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide16_Credits() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#1A1C22" }}>
      <style>{`
        @keyframes credIn { from { opacity: 0; transform: translateY(3vh); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lineGrow { from { width: 0; } to { width: 6vw; } }
        .cred-line { animation: ${isExport ? "none" : "lineGrow 0.6s ease 0.2s both"}; }
        .cred-1 { animation: ${isExport ? "none" : "credIn 0.6s ease 0.3s both"}; }
        .cred-2 { animation: ${isExport ? "none" : "credIn 0.6s ease 0.5s both"}; }
        .cred-3 { animation: ${isExport ? "none" : "credIn 0.6s ease 0.7s both"}; }
        .cred-4 { animation: ${isExport ? "none" : "credIn 0.6s ease 0.9s both"}; }
      `}</style>

      <img
        src={`${base}hero-factory.png`}
        crossOrigin="anonymous"
        alt="Factory background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.15 }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, rgba(26,28,34,0.5) 0%, rgba(26,28,34,0.96) 65%)" }}
      />

      <div
        className="absolute inset-0"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}
      >
        <div className="cred-line" style={{ height: "0.4vh", background: "#D4960A", marginBottom: "4vh", width: "6vw" }} />

        <div className="cred-1">
          <div className="font-body font-semibold" style={{ fontSize: "1.3vw", color: "#5A6070", letterSpacing: "0.25em", marginBottom: "1.5vh" }}>PREPARED BY</div>
          <div className="font-display font-bold" style={{ fontSize: "8vw", color: "#D4960A", lineHeight: 0.9, letterSpacing: "-0.02em" }}>
            yasserious
            <span style={{ color: "rgba(212,150,10,0.5)" }}>.com</span>
          </div>
        </div>

        <div className="cred-2" style={{ marginTop: "3vh" }}>
          <div className="font-body" style={{ fontSize: "1.8vw", color: "#9AA0AE", lineHeight: 1.6, maxWidth: "50vw" }}>
            Digital systems, engineered with precision.<br />
            Built for Ebdaa's 146 employees across 9 departments.
          </div>
        </div>

        <div className="cred-3" style={{ marginTop: "4vh", display: "flex", gap: "5vw" }}>
          <div style={{ textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "#D4960A" }}>146+</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>Employees</div>
          </div>
          <div style={{ width: "0.15vw", background: "#2E3340" }} />
          <div style={{ textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "#D4960A" }}>9</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>Departments</div>
          </div>
          <div style={{ width: "0.15vw", background: "#2E3340" }} />
          <div style={{ textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "#D4960A" }}>8wk</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>To delivery</div>
          </div>
          <div style={{ width: "0.15vw", background: "#2E3340" }} />
          <div style={{ textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "#D4960A" }}>$72K+</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>3-yr value</div>
          </div>
        </div>

        <div className="cred-4" style={{ marginTop: "4.5vh", padding: "1.8vh 5vw", background: "rgba(212,150,10,0.1)", border: "0.15vw solid rgba(212,150,10,0.35)", borderRadius: "0.8vw" }}>
          <div className="font-body" style={{ fontSize: "1.5vw", color: "#D4960A" }}>
            <a href="https://yasserious.com" target="_blank" rel="noopener noreferrer" style={{ color: "#D4960A", textDecoration: "underline" }}>yasserious.com</a>
          </div>
        </div>

        <div className="cred-line" style={{ height: "0.4vh", background: "#D4960A", marginTop: "4vh", width: "6vw" }} />
      </div>
    </div>
  );
}
