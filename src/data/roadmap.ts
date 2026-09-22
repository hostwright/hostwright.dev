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
    title: "10 · Local scheduling",
    status: "in-progress",
    detail:
      "Single-host admission, reservations, placement stability, pressure deferral, and recovery qualification.",
  },
  {
    title: "13 · Narrow Compose import",
    status: "in-progress",
    detail:
      "Convert the documented Compose subset to Manifest v3, review the output, and run it through confirmed local lifecycle commands.",
  },
  {
    title: "14 · Native desktop",
    status: "in-progress",
    detail:
      "Qualify the signed local console, confirmed lifecycle actions, accessibility, and packaged upgrade and recovery.",
  },
  {
    title: "15 · v0.0.2 qualification",
    status: "in-progress",
    detail:
      "Complete the bounded single-Mac security, performance, recovery, documentation, and signed-artifact evidence before GA.",
  },
];
