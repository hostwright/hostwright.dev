import { useState } from "react";
import FinaleCircuitPulse from "./FinaleCircuitPulse";
import FinaleSplitFlap from "./FinaleSplitFlap";
import FinaleAssembleWord from "./FinaleAssembleWord";
import FinaleTerminalBuild from "./FinaleTerminalBuild";

const TABS = [
  { key: "a", label: "A — Circuit pulse", Comp: FinaleCircuitPulse },
  { key: "b", label: "B — Flip reveal", Comp: FinaleSplitFlap },
  { key: "c", label: "C — Assemble word", Comp: FinaleAssembleWord },
  { key: "d", label: "D — Terminal build", Comp: FinaleTerminalBuild },
] as const;

export default function FinaleProtoApp() {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("a");
  const Active = TABS.find((tab) => tab.key === active)!.Comp;

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f4f1ea",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          padding: "16px 24px",
          borderBottom: "1px solid #ddd8cc",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            style={{
              padding: "10px 18px",
              borderRadius: "999px",
              border:
                tab.key === active ? "2px solid #1f3a5f" : "1px solid #ccc",
              background: tab.key === active ? "#1f3a5f" : "#fff",
              color: tab.key === active ? "#fff" : "#20232a",
              fontWeight: 600,
              fontFamily: "system-ui, sans-serif",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        <Active />
      </div>
    </div>
  );
}
