// Site-wide constants. Edit URLs here only.
//
// NOTE: the name is "pre-screened", not yet reserved. The GitHub org, domain,
// and social handles below are the project's confirmed accounts.
export const site = {
  name: "Hostwright",
  domain: "hostwright.dev",
  url: "https://hostwright.dev",
  tagline: "Desired-state container control for Apple silicon Macs.",
  description:
    "Hostwright is a Mac-native, desired-state control plane for Apple's container runtime — declare a local stack in one manifest and plan changes safely. Open-source; runtime convergence in active development.",
  cli: "hostwright",
  daemon: "hostwrightd",
  manifest: "hostwright.yaml",
  license: "Apache-2.0",
  maturity: "Early design and implementation",
  links: {
    github: "https://github.com/hostwright",
    x: "https://x.com/hostwrightdev",
    reddit: "https://www.reddit.com/r/hostwright/",
    docs: "https://docs.hostwright.dev/",
  },
} as const;

export type Site = typeof site;
