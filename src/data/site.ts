// Site-wide constants. Edit URLs here only.
//
// The links below point to the project's current public accounts.
export const site = {
  name: "Hostwright",
  domain: "hostwright.dev",
  url: "https://hostwright.dev",
  tagline: "Desired-state container control for Apple silicon Macs.",
  description:
    "Hostwright is a local control plane for Apple container workloads on one Apple silicon Mac. It uses Manifest v3, Control API 2.2, and SQLite schema v24. The v0.0.2 release is not GA-qualified.",
  cli: "hostwright",
  daemon: "hostwrightd",
  manifest: "hostwright.yaml",
  license: "Apache-2.0",
  links: {
    github: "https://github.com/hostwright",
    x: "https://x.com/hostwrightdev",
    reddit: "https://www.reddit.com/r/hostwright/",
    linkedin: "https://www.linkedin.com/company/hostwright",
    instagram: "https://www.instagram.com/hostwright.dev",
    docs: "https://docs.hostwright.dev/",
  },
} as const;

export type Site = typeof site;
