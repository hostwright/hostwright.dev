// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";

export default defineConfig({
  site: "https://docs.hostwright.dev",
  integrations: [
    starlight({
      title: "Hostwright",
      description:
        "Desired-state container control for Apple silicon Macs. Source-only alpha documentation.",
      logo: { src: "./src/assets/hostwright-mark.png", alt: "Hostwright" },
      favicon: "/favicon.ico",
      customCss: ["./src/styles/theme.css"],
      plugins: [starlightLinksValidator()],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/hostwright/hostwright",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/hostwright/hostwright.dev/edit/main/docs/",
      },
      lastUpdated: true,
      expressiveCode: {
        themes: ["github-dark", "github-light"],
      },
      sidebar: [
        {
          label: "Overview",
          items: [
            { label: "What Hostwright is", link: "/" },
            { label: "Why Hostwright", slug: "overview/why-hostwright" },
            { label: "Non-goals", slug: "overview/non-goals" },
          ],
        },
        {
          label: "Getting started",
          items: [
            {
              label: "Install from source",
              slug: "getting-started/install-from-source",
            },
            { label: "Quick start", slug: "getting-started/quick-start" },
          ],
        },
        {
          label: "Concepts",
          items: [
            { label: "Desired state", slug: "concepts/desired-state" },
            { label: "Runtime adapter", slug: "concepts/runtime-adapter" },
            {
              label: "Apple container boundary",
              slug: "concepts/apple-container-boundary",
            },
            { label: "Reconciliation", slug: "concepts/reconciliation" },
            { label: "State store", slug: "concepts/state-store" },
            { label: "Policy engine", slug: "concepts/policy-engine" },
            { label: "Safety model", slug: "concepts/safety-model" },
            {
              label: "Secrets and Keychain",
              slug: "concepts/secrets-and-keychain",
            },
          ],
        },
        {
          label: "Tasks",
          items: [
            {
              label: "Source install and doctor",
              slug: "tasks/source-install-and-doctor",
            },
            {
              label: "Plan a single service",
              slug: "tasks/single-service-plan",
            },
            { label: "Review an app suite", slug: "tasks/app-suite-review" },
            {
              label: "Operations and recovery",
              slug: "tasks/operations-and-recovery",
            },
            { label: "Import a stack file", slug: "tasks/stack-import" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "CLI", slug: "reference/cli" },
            { label: "hostwright.yaml", slug: "reference/manifest" },
            { label: "Error and exit codes", slug: "reference/error-codes" },
            { label: "Policy", slug: "reference/policy" },
            { label: "Doctor checks", slug: "reference/doctor-checks" },
            { label: "Limitations", slug: "reference/limitations" },
            { label: "Compatibility", slug: "reference/compatibility" },
            { label: "Testing evidence", slug: "reference/testing-evidence" },
            { label: "Using an AI assistant", slug: "reference/ai-agents" },
          ],
        },
        {
          label: "Operations",
          items: [
            {
              label: "Security and safety",
              slug: "operations/security-and-safety",
            },
            { label: "Team workflow", slug: "operations/team-workflow" },
            { label: "Daemon", slug: "operations/daemon" },
            {
              label: "Events and diagnostics",
              slug: "operations/events-and-diagnostics",
            },
          ],
        },
        {
          label: "Release",
          items: [
            { label: "Release process", slug: "release/process" },
            { label: "v0.1.0-alpha.1", slug: "release/v0-1-0-alpha-1" },
          ],
        },
        {
          label: "Roadmap and research",
          items: [
            { label: "Roadmap", slug: "roadmap" },
            { label: "Research areas", slug: "roadmap/research" },
          ],
        },
      ],
    }),
  ],
});
