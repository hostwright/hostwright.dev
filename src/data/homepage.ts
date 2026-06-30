// Homepage copy. Conservative by design: nothing here claims a finished feature.

export const hero = {
  title: "Desired-state container control for Apple silicon Macs.",
  subtitle:
    "Hostwright is a Mac-native control plane for Apple container workloads. Today it can initialize, validate, plan without mutation, show manifest-level status, and run safe doctor checks while the runtime control loop is built.",
  ctaPrimary: { label: "Read the docs", href: "/docs/" },
  ctaSecondary: { label: "View on GitHub", href: "https://github.com/hostwright/hostwright" },
  status: "Early design and implementation",
};

export const problem = {
  heading: "Apple container is a runtime. Local stacks still need a control plane.",
  body: [
    "Apple container gives the Mac a real, native container runtime surface — lightweight Linux VMs, an OCI image flow, and a command surface built for Apple silicon.",
    "But running a local multi-service stack is more than starting containers. You still need declared state, validation, health checks, restart policy, drift detection between what you asked for and what is actually running, and cleanup you can trust.",
    "Hostwright is the disciplined layer that sits above the runtime and owns that responsibility on a single Mac.",
  ],
};

export interface Capability {
  title: string;
  detail: string;
}

export const whatItIs = {
  heading: "What Hostwright does",
  intro:
    "A narrow, well-defined release direction: declare a stack, see the plan, then later converge to it through a single runtime boundary.",
  capabilities: [
    {
      title: "Declares services in hostwright.yaml",
      detail: "A readable manifest describes the local stack you want to exist.",
    },
    {
      title: "Plans changes before mutation",
      detail: "The current plan command is non-mutating and manifest-level. Runtime action planning comes after observation exists.",
    },
    {
      title: "Routes operations through a RuntimeAdapter",
      detail: "The boundary exists now. Real runtime calls are planned and must cross this typed boundary.",
    },
    {
      title: "Tracks local state",
      detail: "Durable desired state, events, and ownership are planned for the SQLite phase.",
    },
    {
      title: "Detects drift",
      detail: "Drift detection is planned after read-only runtime observation exists.",
    },
    {
      title: "Runs doctor checks",
      detail: "Runs safe local checks for OS, architecture, Swift, manifest presence, and `container` executable lookup.",
    },
    {
      title: "Treats destruction as explicit",
      detail: "Cleanup and teardown are not implemented yet; the release design requires dry-run and ownership checks first.",
    },
  ] satisfies Capability[],
};

// Exact command surface from the brief. The CLI is in design; these are the
// intended shapes, split into a core set and a clearly-planned set.
export const cliCore = `hostwright init
hostwright validate
hostwright plan
hostwright status
hostwright doctor`;

export const cliPlanned = `hostwright apply
hostwright down --dry-run`;

// Manifest example — kept verbatim. Document only the fields shown here.
export const manifestExample = `project: api-local

services:
  api:
    image: ghcr.io/example/api:latest
    ports:
      - "8080:8080"
    env:
      APP_ENV: development
    health:
      command: ["curl", "-f", "http://localhost:8080/health"]
      interval: 10s
    restart:
      policy: on-failure

  redis:
    image: redis:7
    ports:
      - "6379:6379"`;

export const safety = {
  heading: "Safety model",
  intro:
    "Infrastructure tooling earns trust by being predictable under failure. Hostwright's defaults are conservative.",
  principles: [
    { title: "Plan before mutation", detail: "Runtime changes are computed and reviewable before they run." },
    { title: "Dry-run for cleanup", detail: "Cleanup is planned to preview exactly what it would remove before it can remove anything." },
    { title: "Explicit destructive confirmation", detail: "Removing real resources requires an intentional, confirmed action." },
    { title: "Conservative validation", detail: "Unsafe or ambiguous manifests are refused, not guessed at." },
    { title: "No hidden runtime mutation", detail: "Current commands do not mutate runtime state. Future mutation must use the planned, recorded path." },
    { title: "Ownership-tracked cleanup", detail: "Cleanup is planned to touch only resources Hostwright can prove it owns." },
    { title: "No secret leakage in logs", detail: "Secrets and credentials are kept out of events and log output." },
  ] satisfies Capability[],
};

export const architecture = {
  heading: "Architecture",
  intro:
    "Hostwright currently owns manifest parsing, validation, non-mutating planning, and architecture boundaries. Apple container owns the runtime. The RuntimeAdapter is the boundary future runtime behavior must cross.",
};
