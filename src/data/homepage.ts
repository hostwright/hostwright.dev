// Homepage copy. Conservative by design: nothing here claims a finished feature.

export const hero = {
  title: "Desired-state container control for Apple silicon Macs.",
  subtitle:
    "Hostwright is a Mac-native control plane for Apple container workloads. Define a local stack once, inspect the plan, and let a local reconciler keep runtime state honest.",
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
    "A narrow, well-defined contract: declare a stack, see the plan, converge to it, and observe the result.",
  capabilities: [
    {
      title: "Declares services in hostwright.yaml",
      detail: "A readable manifest describes the local stack you want to exist.",
    },
    {
      title: "Plans changes before mutation",
      detail: "Every runtime change is computed and shown before anything is applied.",
    },
    {
      title: "Routes operations through a RuntimeAdapter",
      detail: "All runtime calls cross one typed boundary, never ad-hoc shell commands.",
    },
    {
      title: "Tracks local state",
      detail: "Desired state, events, and resource ownership are recorded durably.",
    },
    {
      title: "Detects drift",
      detail: "Compares declared state against observed runtime state and reports the difference.",
    },
    {
      title: "Runs doctor checks",
      detail: "Validates Apple container, macOS, architecture, and runtime assumptions up front.",
    },
    {
      title: "Treats destruction as explicit",
      detail: "Cleanup and teardown are deliberate operations, never silent side effects.",
    },
  ] satisfies Capability[],
};

// Exact command surface from the brief. The CLI is in design; these are the
// intended shapes, split into a core set and a clearly-planned set.
export const cliCore = `hostwright init
hostwright validate
hostwright plan
hostwright doctor`;

export const cliPlanned = `hostwright apply
hostwright status
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
    { title: "Dry-run for cleanup", detail: "Destructive operations preview exactly what they would remove first." },
    { title: "Explicit destructive confirmation", detail: "Removing real resources requires an intentional, confirmed action." },
    { title: "Conservative validation", detail: "Unsafe or ambiguous manifests are refused, not guessed at." },
    { title: "No hidden runtime mutation", detail: "Nothing changes the runtime outside the planned, recorded path." },
    { title: "Ownership-tracked cleanup", detail: "No broad garbage collection — only resources Hostwright can prove it owns." },
    { title: "No secret leakage in logs", detail: "Secrets and credentials are kept out of events and log output." },
  ] satisfies Capability[],
};

export const architecture = {
  heading: "Architecture",
  intro:
    "Hostwright owns declared state, planning, reconciliation, health, drift, events, and cleanup policy. Apple container owns the runtime. The RuntimeAdapter is the boundary between them.",
};
