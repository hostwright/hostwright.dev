export type Status = "planned" | "in-progress" | "implemented" | "blocked" | "deferred";

export const statusLabel: Record<Status, string> = {
  deferred: "Deferred",
  planned: "Planned",
  "in-progress": "In progress",
  implemented: "Implemented",
  blocked: "Blocked",
};

export interface RoadmapItem {
  title: string;
  status: Status;
  detail: string;
}

export const roadmap: RoadmapItem[] = [
  {
    title: "01 · Truth and contracts",
    status: "in-progress",
    detail:
      "Manifest/API/provider/plugin/state versions, UUID identity, saga state, migration, capability truth, and governance.",
  },
  {
    title: "02 · Trusted foundation",
    status: "implemented",
    detail:
      "Vendor tap, signed/notarized packages, secure state/defaults, doctor, upgrade, rollback, uninstall, SBOM/provenance.",
  },
  {
    title: "03 · Apple providers",
    status: "implemented",
    detail:
      "Conformant Apple CLI and pinned Containerization providers with capability negotiation and safe migration.",
  },
  {
    title: "04 · Complete local lifecycle",
    status: "implemented",
    detail:
      "Maintained YAML, Manifest v3, durable operation DAG, dependencies, probes, updates, rollback, and lifecycle commands.",
  },
  {
    title: "05 · Images and trust",
    status: "implemented",
    detail:
      "OCI lifecycle, registries, Keychain/providers, signatures, SBOM, vulnerability policy, provenance, and cache GC.",
  },
  {
    title: "06 · Persistent storage",
    status: "implemented",
    detail:
      "Volumes, snapshots, online backup/restore, quotas, fencing, reclaim, and orphan garbage collection.",
  },
  {
    title: "07 · Networking",
    status: "implemented",
    detail:
      "Networks, DNS, dual stack, ingress, TLS/mTLS, policy, secure tunnels, and provider SPI.",
  },
  {
    title: "08 · Autonomous operations",
    status: "implemented",
    detail:
      "LaunchAgent, reconciliation, rollout/recovery, finalizers/GC, OSLog, events, metrics, traces, and support bundles.",
  },
  {
    title: "09 · Secure control and plugins",
    status: "implemented",
    detail:
      "Persistent API, identity, RBAC, admission, tamper-evident audit, workload profiles, WASI, and signed XPC.",
  },
  {
    title: "10 · Local capacity admission",
    status: "in-progress",
    detail:
      "Authenticated local admission, durable CPU/memory reservations, recovery, and fresh pressure observations. Optimization and accelerators are deferred.",
  },
  {
    title: "11 · Multi-Mac HA",
    status: "deferred",
    detail:
      "Cluster CA, managed etcd, node agents, fencing, remote placement/storage/discovery, failover, upgrades, and DR.",
  },
  {
    title: "12 · Kubernetes",
    status: "deferred",
    detail:
      "Real pod-sandbox VM, CRI/CNI/CSI, kubelet, resource/Helm translation, scheduler/device integration, and conformance.",
  },
  {
    title: "13 · Local Compose import",
    status: "in-progress",
    detail:
      "Narrow resource-aware Compose conversion and confirmed local execution. Docker API/client and IDE integrations are deferred.",
  },
  {
    title: "14 · Native local control",
    status: "in-progress",
    detail:
      "Authenticated SwiftUI up/down/restart, confirmation, cancellation, disconnect handling, and supported packaging. Team/MDM/cloud controls are deferred.",
  },
  {
    title: "15 · GA qualification",
    status: "in-progress",
    detail:
      "Current-source security, fuzzing, sanitizers, live cycles, a 30-minute soak, VM recovery, documentation, signed release, and vendor tap. Homebrew core is deferred.",
  },
];
