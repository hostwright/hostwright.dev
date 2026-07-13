export type Status = "planned" | "in-progress" | "implemented" | "blocked";

export const statusLabel: Record<Status, string> = {
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
    detail: "Manifest/API/provider/plugin/state versions, UUID identity, saga state, migration, capability truth, and governance.",
  },
  {
    title: "02 · Trusted foundation",
    status: "planned",
    detail: "Vendor tap, signed/notarized packages, secure state/defaults, doctor, upgrade, rollback, uninstall, SBOM/provenance.",
  },
  {
    title: "03 · Apple providers",
    status: "planned",
    detail: "Conformant Apple CLI and pinned Containerization providers with capability negotiation and safe migration.",
  },
  {
    title: "04 · Complete local lifecycle",
    status: "planned",
    detail: "Maintained YAML, full Manifest v2, durable operation DAG, dependencies, probes, updates, rollback, and lifecycle commands.",
  },
  {
    title: "05 · Images and trust",
    status: "planned",
    detail: "OCI lifecycle, registries, Keychain/providers, signatures, SBOM, vulnerability policy, provenance, and cache GC.",
  },
  {
    title: "06 · Persistent storage",
    status: "planned",
    detail: "Volumes, snapshots, online backup/restore, quotas, fencing, reclaim, and orphan garbage collection.",
  },
  {
    title: "07 · Networking",
    status: "planned",
    detail: "Networks, DNS, dual stack, ingress, TLS/mTLS, policy, secure tunnels, and provider SPI.",
  },
  {
    title: "08 · Autonomous operations",
    status: "planned",
    detail: "LaunchAgent, reconciliation, rollout/recovery, finalizers/GC, OSLog, events, metrics, traces, and support bundles.",
  },
  {
    title: "09 · Secure control and plugins",
    status: "planned",
    detail: "Persistent API, identity, RBAC, admission, tamper-evident audit, workload profiles, WASI, and signed XPC.",
  },
  {
    title: "10 · Scheduling and accelerators",
    status: "planned",
    detail: "Fair deterministic placement, topology/disruption/hysteresis, pressure/energy, and host-native Metal/Core ML/MLX.",
  },
  {
    title: "11 · Multi-Mac HA",
    status: "planned",
    detail: "Cluster CA, managed etcd, node agents, fencing, remote placement/storage/discovery, failover, upgrades, and DR.",
  },
  {
    title: "12 · Kubernetes",
    status: "planned",
    detail: "Real pod-sandbox VM, CRI/CNI/CSI, kubelet, resource/Helm translation, scheduler/device integration, and conformance.",
  },
  {
    title: "13 · Docker ecosystem",
    status: "planned",
    detail: "Docker API/context, Compose, Podman, Testcontainers, GitHub Actions, Xcode, VS Code, and JetBrains.",
  },
  {
    title: "14 · Native and team control",
    status: "planned",
    detail: "Accessible SwiftUI app, parity, team/MDM, optional offline-safe cloud, OIDC, outbound agents, and remote audit.",
  },
  {
    title: "15 · GA qualification",
    status: "planned",
    detail: "Security, fuzzing, sanitizers, soaks, conformance, performance, DR, docs, support, signed v0.0.2, and Homebrew core.",
  },
];
