// What Hostwright deliberately does not do, shown openly rather than buried
// — split by how permanent the boundary actually is.
export interface NonGoal {
  title: string;
  detail: string;
}

// Hard architectural boundaries. These define what Hostwright is — a
// single-host, controller-first tool — not gaps expected to close later.
export const nonGoals: NonGoal[] = [
  {
    title: "Not a CRI shim",
    detail:
      "The Container Runtime Interface is studied as design inspiration for the adapter boundary, not implemented.",
  },
  {
    title: "Not a Kubernetes replacement",
    detail:
      "No scheduler, no API server, no kubelet. Single-host desired state, not cluster orchestration.",
  },
  {
    title: "Not full Docker Compose parity",
    detail:
      "A readable local stack format, deliberately narrower than Compose — not a drop-in clone.",
  },
  {
    title: "Not a Docker API shim",
    detail:
      "Existing projects already cover Docker API emulation. Hostwright stays controller-first.",
  },
  {
    title: "Not a cloud control plane",
    detail:
      "No remote control plane, no multi-Mac orchestration, no hosted service.",
  },
];

// Open questions under active research — not ruled out, just not committed.
// These could become real scope later.
export const underResearch: NonGoal[] = [
  {
    title: "Tunnel and DNS integration",
    detail: "Cloudflare, Tailscale, or WireGuard integration. Research-only — no commitment yet.",
  },
  {
    title: "GPU-aware scheduling",
    detail: "Apple GPU/ANE scheduling, plus Metal, Core ML, or MLX container support. Research-only.",
  },
];
