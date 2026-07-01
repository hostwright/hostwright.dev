// Docs information architecture. Single source of truth for sidebar order,
// grouping, and prev/next. `slug` matches the content collection entry id.
export interface NavLink {
  title: string;
  slug: string;
  href: string;
}

export interface NavGroup {
  label: string;
  items: NavLink[];
}

function link(title: string, slug: string): NavLink {
  return { title, slug, href: slug === "index" ? "/docs/" : `/docs/${slug}/` };
}

export const navGroups: NavGroup[] = [
  {
    label: "Start here",
    items: [
      link("Overview", "index"),
      link("Getting started", "getting-started"),
    ],
  },
  {
    label: "Concepts",
    items: [
      link("Desired state", "concepts/desired-state"),
      link("Runtime adapter", "concepts/runtime-adapter"),
      link("Apple container boundary", "concepts/apple-container-boundary"),
      link("Reconciliation", "concepts/reconciliation"),
      link("Safety model", "concepts/safety-model"),
    ],
  },
  {
    label: "Reference",
    items: [
      link("CLI", "reference/cli"),
      link("hostwright.yaml", "reference/hostwright-yaml"),
      link("For AI agents", "reference/ai-agents"),
      link("Limitations", "reference/limitations"),
      link("Compatibility", "reference/compatibility"),
    ],
  },
  {
    label: "Design",
    items: [
      link("Why Hostwright", "design/why-hostwright"),
      link("Non-goals", "design/non-goals"),
      link("Name and identity", "design/name-and-identity"),
    ],
  },
];

// Flattened, ordered list for prev/next navigation.
export const navFlat: NavLink[] = navGroups.flatMap((g) => g.items);

export function siblings(slug: string): { prev?: NavLink; next?: NavLink } {
  const i = navFlat.findIndex((l) => l.slug === slug);
  if (i === -1) return {};
  return { prev: navFlat[i - 1], next: navFlat[i + 1] };
}
