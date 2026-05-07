export default function Slide02_Challenge() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#1A1C22" }}>
      <div
        className="absolute top-0 left-0 h-full"
        style={{
          width: "42vw",
          background: "linear-gradient(135deg, #242830 0%, #1E2028 100%)"
        }}
      />
      <div
        className="absolute top-0 left-[42vw]"
        style={{ width: "0.3vw", height: "100%", background: "#D4960A", opacity: 0.6 }}
      />

      <div className="absolute left-[6vw] top-[12vh]">
        <div className="font-body font-semibold mb-[1.5vh]" style={{ fontSize: "1.2vw", color: "#D4960A", letterSpacing: "0.2em" }}>
          THE PROBLEM
        </div>
        <h2
          className="font-display font-bold tracking-tight"
          style={{ fontSize: "5vw", lineHeight: 1, color: "#F5F0E8", textWrap: "balance", maxWidth: "34vw" }}
        >
          INVISIBLE WORKFORCE SKILLS
        </h2>
        <div className="mt-[3vh]" style={{ width: "5vw", height: "0.3vh", background: "#D4960A" }} />
        <p
          className="font-body mt-[2.5vh]"
          style={{ fontSize: "1.6vw", color: "#9AA0AE", maxWidth: "32vw", lineHeight: 1.7 }}
        >
          Managing 146 employees across 9 departments with Excel spreadsheets and paper forms leaves critical skill gaps invisible until production suffers.
        </p>
      </div>

      <div className="absolute right-[5vw] top-[10vh]" style={{ width: "50vw" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5vh" }}>
          <div
            style={{
              background: "#242830",
              borderLeft: "0.4vw solid #D4960A",
              padding: "2.5vh 2.5vw",
              borderRadius: "0 0.5vw 0.5vw 0"
            }}
          >
            <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "#F5F0E8", marginBottom: "0.8vh" }}>
              No real-time skill visibility
            </div>
            <div className="font-body" style={{ fontSize: "1.4vw", color: "#5A6070", lineHeight: 1.5 }}>
              Managers cannot instantly see who is qualified for critical production tasks, creating bottlenecks and delays.
            </div>
          </div>

          <div
            style={{
              background: "#242830",
              borderLeft: "0.4vw solid #8B909A",
              padding: "2.5vh 2.5vw",
              borderRadius: "0 0.5vw 0.5vw 0"
            }}
          >
            <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "#F5F0E8", marginBottom: "0.8vh" }}>
              Untracked skill gaps
            </div>
            <div className="font-body" style={{ fontSize: "1.4vw", color: "#5A6070", lineHeight: 1.5 }}>
              Training needs go undetected until production quality suffers — reactive, not proactive.
            </div>
          </div>

          <div
            style={{
              background: "#242830",
              borderLeft: "0.4vw solid #8B909A",
              padding: "2.5vh 2.5vw",
              borderRadius: "0 0.5vw 0.5vw 0"
            }}
          >
            <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "#F5F0E8", marginBottom: "0.8vh" }}>
              Fragmented evaluation records
            </div>
            <div className="font-body" style={{ fontSize: "1.4vw", color: "#5A6070", lineHeight: 1.5 }}>
              Assessment data scattered across spreadsheets, paper forms, and individual manager notes with no unified view.
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[4vw]">
        <div className="font-body" style={{ fontSize: "1.1vw", color: "#5A6070" }}>Created by <span style={{ color: "#D4960A" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}
