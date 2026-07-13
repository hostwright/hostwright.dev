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
    title: "No unsafe quorum writes",
    detail: "A cluster without quorum remains useful for reads and recovery but stops mutation.",
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
    title: "Homebrew-core fallback",
    detail: "Core acceptance is external; a maintained Hostwright vendor tap is the guaranteed Phase 02 path.",
  },
  {
    title: "Accelerator fallback",
    detail: "Until Apple exposes public guest passthrough, Phase 10 delivers signed host-native Metal, Core ML, and MLX.",
  },
];
