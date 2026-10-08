export interface NonGoal {
  title: string;
  detail: string;
}

// The name is retained for component compatibility; these are the narrow
// permanent safety/platform boundaries, not unowned product gaps.
export const nonGoals: NonGoal[] = [
  {
    title: "No private Apple APIs",
    detail: "Hostwright uses supported public APIs and versioned helpers, never unstable undocumented interfaces.",
  },
  {
    title: "Single-Mac release",
    detail: "Multi-Mac authority is deferred. This release makes no cluster availability or quorum claim.",
  },
  {
    title: "No silent telemetry",
    detail: "Observability is local by default; remote data requires explicit informed consent.",
  },
  {
    title: "No unmanaged deletion",
    detail: "Names and similarity never prove ownership. Unknown resources are reported or quarantined, not destroyed.",
  },
  {
    title: "Apple silicon only",
    detail: "Intel and old-macOS emulation are outside the public Apple container platform Hostwright qualifies.",
  },
];

// External constraints receive product fallbacks instead of becoming excuses.
export const underResearch: NonGoal[] = [
  {
    title: "Official Homebrew acceptance",
    detail: "The vendor tap supplies unsupported qualification packages. The intended GA launch also requires an accepted official cask and verified installation without adding a tap.",
  },
  {
    title: "Accelerators deferred",
    detail: "Guest passthrough and host-native Metal, Core ML, and MLX services are excluded from the accepted v0.0.2 scope.",
  },
];
