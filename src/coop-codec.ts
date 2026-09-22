/** Reference-preserving data codec. No constructors, prototypes or executable data cross the wire. */
type Value = null | boolean | number | string | { r: number };
type Node = { t: "object" | "array" | "set" | "map"; v: any };
export type Graph = { root: Value; nodes: Node[] };
const forbidden = new Set(["__proto__", "prototype", "constructor"]);
export function encodeGraph(root: unknown): Graph {
  const nodes: Node[] = [],
    seen = new Map<object, number>();
  const visit = (v: any): Value => {
    if (v === undefined || v === null) return null;
    if (typeof v === "string" || typeof v === "boolean") return v;
    if (typeof v === "number") return Number.isFinite(v) ? v : 0;
    if (typeof v !== "object") throw Error("Non-data value in snapshot");
    const old = seen.get(v);
    if (old !== undefined) return { r: old };
    const id = nodes.length;
    seen.set(v, id);
    const n: Node = { t: "object", v: null };
    nodes.push(n);
    if (Array.isArray(v)) {
      n.t = "array";
      n.v = v.map(visit);
    } else if (v instanceof Set) {
      n.t = "set";
      n.v = [...v].map(visit);
    } else if (v instanceof Map) {
      n.t = "map";
      n.v = [...v].map(([k, val]) => [visit(k), visit(val)]);
    } else {
      n.v = {};
      for (const [k, val] of Object.entries(v))
        if (!forbidden.has(k) && val !== undefined) n.v[k] = visit(val);
    }
    return { r: id };
  };
  return { root: visit(root), nodes };
}
export function decodeGraph(g: Graph): any {
  if (!g || !Array.isArray(g.nodes) || g.nodes.length > 45000)
    throw Error("Invalid snapshot graph");
  const objects = g.nodes.map((n) =>
    n.t === "array"
      ? []
      : n.t === "set"
        ? new Set()
        : n.t === "map"
          ? new Map()
          : n.t === "object"
            ? {}
            : null,
  );
  if (objects.includes(null)) throw Error("Invalid snapshot node");
  const read = (v: Value): any => {
    if (v !== null && typeof v === "object") {
      if (!Number.isInteger(v.r) || v.r < 0 || v.r >= objects.length)
        throw Error("Invalid reference");
      return objects[v.r];
    }
    if (typeof v === "number" && !Number.isFinite(v))
      throw Error("Invalid number");
    return v;
  };
  g.nodes.forEach((n, i) => {
    const target: any = objects[i];
    if (n.t === "array") for (const v of n.v) target.push(read(v));
    else if (n.t === "set") for (const v of n.v) target.add(read(v));
    else if (n.t === "map")
      for (const [k, v] of n.v) target.set(read(k), read(v));
    else
      for (const [k, v] of Object.entries(n.v)) {
        if (forbidden.has(k)) throw Error("Invalid property");
        target[k] = read(v as Value);
      }
  });
  return read(g.root);
}
