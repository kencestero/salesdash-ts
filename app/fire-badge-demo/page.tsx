"use client";

import { FireBadge } from "@/components/ui/fire-badge";

export default function FireBadgeDemoPage() {
  // Mock trailers with different ages
  const trailers = [
    { stockNumber: "MJ-2024-001", model: "8.5×16 SA • MJ Orange • Food Service", daysOld: 0 },
    { stockNumber: "MJ-2024-002", model: "7×14 TA • Black • Enclosed Cargo", daysOld: 1 },
    { stockNumber: "MJ-2024-003", model: "6×12 SA • White • Utility", daysOld: 2 },
    { stockNumber: "MJ-2024-004", model: "8.5×20 TA • Silver • Car Hauler", daysOld: 3 },
    { stockNumber: "MJ-2024-005", model: "6×10 SA • MJ Orange • Dump", daysOld: 7 },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1d29 0%, #0f1117 100%)",
      padding: "40px",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <h1 style={{
            fontSize: "36px",
            fontWeight: "bold",
            color: "#fff",
            marginBottom: "12px"
          }}>
            🔥 Fire Badge Demo
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "18px" }}>
            Automatic "HOT UNIT" indicators for trailers 2 days old or less
          </p>
        </div>

        {/* Badge Variants */}
        <div style={{
          background: "#1a1d29",
          borderRadius: "12px",
          padding: "32px",
          marginBottom: "32px",
          border: "1px solid #374151"
        }}>
          <h2 style={{ color: "#fff", fontSize: "20px", marginBottom: "24px" }}>Badge Variants</h2>
          <div style={{
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
            alignItems: "center"
          }}>
            <div style={{ textAlign: "center" }}>
              <FireBadge variant="mj" size="sm" daysOld={0} />
              <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "8px" }}>MJ Orange (Small)</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <FireBadge variant="mj" size="md" daysOld={1} />
              <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "8px" }}>MJ Orange (Medium)</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <FireBadge variant="mj" size="lg" daysOld={2} />
              <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "8px" }}>MJ Orange (Large)</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <FireBadge variant="classic" size="md" daysOld={0} showDays={false} />
              <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "8px" }}>Classic Red</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <FireBadge variant="compact" size="sm" daysOld={1} showDays={false} />
              <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "8px" }}>Compact</p>
            </div>
          </div>
        </div>

        {/* Trailer Cards */}
        <div style={{
          background: "#1a1d29",
          borderRadius: "12px",
          padding: "32px",
          border: "1px solid #374151"
        }}>
          <h2 style={{ color: "#fff", fontSize: "20px", marginBottom: "24px" }}>
            Live Inventory Example
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {trailers.map((trailer) => (
              <div
                key={trailer.stockNumber}
                style={{
                  background: "#0f1117",
                  borderRadius: "8px",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid #374151",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 10px 30px rgba(245, 166, 35, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
                  {/* Stock Number with Fire Badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "180px" }}>
                    <span style={{
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}>
                      {trailer.stockNumber}
                    </span>
                    {trailer.daysOld <= 2 && (
                      <FireBadge daysOld={trailer.daysOld} size="sm" />
                    )}
                  </div>

                  {/* Model */}
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                      {trailer.model}
                    </p>
                  </div>
                </div>

                {/* Days Old Indicator */}
                <div style={{
                  background: trailer.daysOld <= 2 ? "rgba(245, 166, 35, 0.1)" : "rgba(156, 163, 175, 0.1)",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  minWidth: "100px",
                  textAlign: "center"
                }}>
                  <span style={{
                    color: trailer.daysOld <= 2 ? "#f5a623" : "#9ca3af",
                    fontSize: "12px",
                    fontWeight: "500"
                  }}>
                    {trailer.daysOld === 0 ? "Today" :
                     trailer.daysOld === 1 ? "Yesterday" :
                     `${trailer.daysOld} days old`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          marginTop: "32px",
          background: "rgba(245, 166, 35, 0.1)",
          border: "1px solid rgba(245, 166, 35, 0.3)",
          borderRadius: "8px",
          padding: "20px",
        }}>
          <h3 style={{ color: "#f5a623", fontSize: "16px", marginBottom: "8px" }}>
            How it works
          </h3>
          <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: "1.6" }}>
            The FireBadge component automatically appears on trailers that are <strong style={{ color: "#f5a623" }}>2 days old or less</strong>.
            The age is calculated from the <code style={{
              background: "#0f1117",
              padding: "2px 6px",
              borderRadius: "4px",
              color: "#f5a623"
            }}>createdAt</code> timestamp in your database.
            The animated fire effect uses pure CSS (no JavaScript libraries) for optimal performance.
          </p>
        </div>
      </div>
    </div>
  );
}
