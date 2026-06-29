// What Hostwright deliberately does not do (yet). Shown openly, not buried.
// Each item is a hard boundary for the first supported release.
export interface NonGoal {
  title: string;
  detail: string;
}

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
  {
    title: "Not a tunnel manager",
    detail:
      "No tunnels, no DNS service, no Cloudflare, Tailscale, or WireGuard integration. Research-only.",
  },
  {
    title: "Not a GPU scheduler",
    detail:
      "No Apple GPU/ANE scheduling and no Metal, Core ML, or MLX container support. Research-only.",
  },
  {
    title: "Not production-ready",
    detail:
      "This is an early infrastructure project under active design. Do not depend on it for production work.",
  },
];
