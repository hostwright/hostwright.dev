// Current state. Honest by default: nothing is marked "implemented" except the
// design itself. The source design record places the project at the start of the
// Foundation track — repository creation and build work are still ahead.
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
    title: "Design locked",
    status: "implemented",
    detail: "Architecture, boundaries, and the first-release contract are written down.",
  },
  {
    title: "Repo scaffold",
    status: "planned",
    detail: "Swift package layout, module boundaries, tests, CI, and decision records.",
  },
  {
    title: "CLI skeleton",
    status: "planned",
    detail: "Argument parsing and command dispatch for the hostwright command surface.",
  },
  {
    title: "Manifest validation",
    status: "planned",
    detail: "Schema and semantic checks for hostwright.yaml before any runtime action.",
  },
  {
    title: "RuntimeAdapter",
    status: "planned",
    detail: "The typed runtime boundary plus a mock adapter for testing the reconciler.",
  },
  {
    title: "Apple container adapter",
    status: "planned",
    detail: "First concrete adapter over the Apple container CLI with structured output.",
  },
  {
    title: "Reconciler",
    status: "planned",
    detail: "Observe, diff, plan, apply, observe — idempotent and deterministic.",
  },
  {
    title: "State store",
    status: "planned",
    detail: "Durable desired state, events, and ownership ledger in SQLite.",
  },
  {
    title: "Doctor checks",
    status: "planned",
    detail: "Host, macOS, architecture, and Apple container readiness diagnostics.",
  },
  {
    title: "Safe cleanup",
    status: "planned",
    detail: "Ownership-aware teardown with dry-run and explicit destructive confirmation.",
  },
];
