// Homepage copy describes the current, not yet GA-qualified release candidate.

export const hero = {
  title: "Desired-state container control for Apple silicon Macs.",
  subtitle:
    "Declare local workloads in Manifest v3. Hostwright validates them, plans changes, records state in SQLite, and executes confirmed lifecycle actions through authenticated local control.",
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
    "A local stack needs more than a runtime command: declared state, capacity checks, health and restart policy, drift handling, and ownership-checked cleanup.",
    "Hostwright provides that local control plane on one Apple silicon Mac. Multi-Mac operation is outside the v0.0.2 release scope.",
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
        "Strict Manifest v3 describes local desired state and requires explicit CPU and memory requests and limits.",
    },
    {
      title: "Plans changes before mutation",
      detail:
        "Plans are deterministic and reviewable; live mutation remains bound to exact confirmation, identity, provider, and state gates.",
    },
    {
      title: "Uses authenticated local control",
      detail:
        "Control API 2.2 binds confirmed lifecycle actions to the selected manifest, local daemon authority, and provider boundary.",
    },
    {
      title: "Tracks local state",
      detail:
        "SQLite schema v24 records desired and observed state, reservations, ownership, operations, audit, and recovery evidence.",
    },
    {
      title: "Detects drift",
      detail:
        "Typed deterministic drift and plan actions compare declared and observed state without guessing unsupported runtime shapes.",
    },
    {
      title: "Imports a narrow Compose subset",
      detail:
        "The importer converts supported fields for review and rejects unsupported fields. It is not Docker Compose compatibility.",
    },
    {
      title: "Provides a native desktop console",
      detail:
        "The app supports authenticated local up, down, and restart with confirmation; signed-app and accessibility qualification remains in progress.",
    },
    {
      title: "Runs doctor checks",
      detail:
        "Runs safe local checks for OS, architecture, Swift, manifest presence, and `container` executable lookup.",
    },
    {
      title: "Treats destruction as explicit",
      detail:
        "Cleanup is dry-run first and token-confirmed, limited to exact Hostwright-owned resources proven eligible by current state.",
    },
  ] satisfies Capability[],
};

export const cliCore = `hostwright init
hostwright runtime providers --json
hostwright validate hostwright.yaml
hostwright up hostwright.yaml --dry-run
hostwright status hostwright.yaml
hostwright doctor --output json`;

export const cliLocalOps = `hostwright import-stack compose.yaml
hostwright up hostwright.yaml --dry-run
hostwright status hostwright.yaml`;

export const manifestExample = `version: 3
project: quickstart
imagePolicy: require-digest

services:
  web:
    image: docker.io/library/python@sha256:26730869004e2b9c4b9ad09cab8625e81d256d1ce97e72df5520e806b1709f92
    resources:
      requests:
        cpus: 1
        memory: 512MiB
      limits:
        cpus: 1
        memory: 512MiB
    command: ["python3", "-m", "http.server", "8080", "--bind", "0.0.0.0"]
    ports:
      - "18080:8080"
    restart:
      policy: unless-stopped`;

export const safety = {
  heading: "Safety model",
  intro: "The development release keeps mutation explicit and ownership-scoped.",
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
