// Homepage copy reflects currently implemented capabilities.

export const hero = {
  title: "Desired-state container control for Apple silicon Macs.",
  subtitle:
    "Declare services in one manifest. Hostwright validates it, computes a deterministic plan, records state in a local SQLite ledger, and changes the Apple container runtime only through confirmation-gated operations.",
  ctaPrimary: { label: "Read the docs", href: "https://docs.hostwright.dev/" },
  ctaSecondary: {
    label: "View on GitHub",
    href: "https://github.com/hostwright",
  },
};

export const problem = {
  heading:
    "Apple container is a runtime. Local stacks still need a control plane.",
  body: [
    "Apple container gives the Mac a native container runtime: lightweight Linux VMs, an OCI image flow, and a command surface built for Apple silicon.",
    "Running a multi-service stack requires more than starting containers: declared state, validation, health checks, restart policy, drift detection between declared and observed state, and ownership-checked cleanup.",
    "Hostwright is that layer. It targets a single Mac first; the same identity, fencing, recovery, and policy model is designed to extend across Macs.",
  ],
};

export interface Capability {
  title: string;
  detail: string;
}

export const whatItIs = {
  heading: "What Hostwright does",
  intro: "Current capabilities of the CLI and daemon.",
  capabilities: [
    {
      title: "Declares services in hostwright.yaml",
      detail:
        "An explicit Manifest v2 subset describes local desired state; legacy v1/versionless input has a deterministic migration preview.",
    },
    {
      title: "Plans changes before mutation",
      detail:
        "Plans are deterministic and reviewable; live mutation remains bound to exact confirmation, identity, provider, and state gates.",
    },
    {
      title: "Routes operations through a RuntimeAdapter",
      detail:
        "Apple container observation and narrow lifecycle calls cross one typed boundary; no other code path reaches the runtime.",
    },
    {
      title: "Tracks local state",
      detail:
        "SQLite schema v7 records desired/observed state, events, operations, ownership UUIDs, provider binding, fencing, and recovery.",
    },
    {
      title: "Detects drift",
      detail:
        "Typed deterministic drift and plan actions compare declared and observed state without guessing unsupported runtime shapes.",
    },
    {
      title: "Runs doctor checks",
      detail:
        "Runs safe local checks for OS, architecture, Swift, manifest presence, and `container` executable lookup.",
    },
    {
      title: "Treats destruction as explicit",
      detail:
        "Cleanup is dry-run first and token-confirmed, limited to exact owned eligible containers. Broad garbage collection is not implemented.",
    },
  ] satisfies Capability[],
};

// Exact command surface from the brief. The CLI is in design; these are the
// intended shapes, split into a core set and a clearly-planned set.
export const cliCore = `hostwright init
hostwright capabilities --json
hostwright migrate preview hostwright.yaml
hostwright validate
hostwright plan
hostwright status --state-db /tmp/hostwright.sqlite
hostwright doctor`;

export const cliPlanned = `hostwright up
hostwright down --dry-run
hostwright cluster status`;

// Manifest example — kept verbatim. Document only the fields shown here.
export const manifestExample = `version: 2
project: api-local

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
  intro: "Defaults are conservative and mutation is always explicit.",
  principles: [
    {
      title: "Plan before mutation",
      detail: "Runtime changes are computed and reviewable before they run.",
    },
    {
      title: "Dry-run for cleanup",
      detail:
        "Cleanup previews exact identity and eligibility before a separately confirmed owned-resource deletion.",
    },
    {
      title: "Explicit destructive confirmation",
      detail:
        "Removing real resources requires an intentional, confirmed action.",
    },
    {
      title: "Conservative validation",
      detail: "Unsafe or ambiguous manifests are refused, not guessed at.",
    },
    {
      title: "No hidden runtime mutation",
      detail:
        "Mutation exists only behind explicit plan/cleanup confirmation and the typed, recorded provider path.",
    },
    {
      title: "Ownership-tracked cleanup",
      detail:
        "Cleanup can touch only resources Hostwright can prove it owns; unmanaged resources are never inferred from names.",
    },
    {
      title: "No secret leakage in logs",
      detail: "Secrets and credentials are kept out of events and log output.",
    },
  ] satisfies Capability[],
};

export const architecture = {
  heading: "Architecture",
  intro:
    "Hostwright owns versioned intent, UUID identity, SQLite ledgers, planning, policy, and recovery state. Apple container owns execution. The Runtime Provider API is the only mutation boundary.",
};
