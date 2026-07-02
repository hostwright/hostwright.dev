import { DECK_HALF_HEIGHT, SHELF_Y_TOP, SHELF_Y_BOTTOM } from "../HBridge";

// Shared geometry/data for the 3 finale prototypes, mirroring the constants
// used in the real film's HeroScene.tsx so each prototype places containers
// exactly where they'd land in the actual dock→disperse sequence.

export const CONTAINER_HALF = 0.75;
export const FEATURE_REST_SCALE = 1.12;
export const SHELF_SLOT_XS = [-2.6, 0, 2.6];
const REST_GAP = 0.05;
export const REST_Y_TOP =
  SHELF_Y_TOP +
  DECK_HALF_HEIGHT +
  CONTAINER_HALF * FEATURE_REST_SCALE +
  REST_GAP;
export const REST_Y_BOTTOM =
  SHELF_Y_BOTTOM +
  DECK_HALF_HEIGHT +
  CONTAINER_HALF * FEATURE_REST_SCALE +
  REST_GAP;

export const STATIONS = [
  { label: "Declare", note: "one manifest" },
  { label: "Plan", note: "before mutation" },
  { label: "Reconcile", note: "desired vs actual" },
  { label: "Detect drift", note: "and correct" },
  { label: "Doctor", note: "safe checks" },
  { label: "Clean up", note: "dry-run first" },
];

export function slotPosition(i: number): [number, number, number] {
  const onTop = i < 3;
  const x = SHELF_SLOT_XS[i % 3];
  const y = onTop ? REST_Y_TOP : REST_Y_BOTTOM;
  return [x, y, 0];
}

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
