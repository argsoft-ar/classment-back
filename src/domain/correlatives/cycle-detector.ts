import { CorrelativeEdge, CycleDetectionResult } from "./types";

/**
 * Checks whether adding `newRule` (subject -> requiredSubject) to `rules` creates a cycle.
 * Since the existing graph is assumed acyclic, a cycle exists iff the required subject
 * can already reach the subject (DFS), or the rule is a self-reference.
 */
export function detectCycle(
  rules: readonly CorrelativeEdge[],
  newRule: CorrelativeEdge,
): CycleDetectionResult {
  const { subjectId, requiredSubjectId } = newRule;

  if (subjectId === requiredSubjectId) {
    return { hasCycle: true, path: [subjectId, subjectId] };
  }

  const graph = new Map<string, string[]>();
  for (const rule of rules) {
    const edges = graph.get(rule.subjectId) ?? [];
    edges.push(rule.requiredSubjectId);
    graph.set(rule.subjectId, edges);
  }

  const visited = new Set<string>();

  const dfs = (node: string, trail: string[]): string[] | null => {
    if (node === subjectId) return trail;
    if (visited.has(node)) return null;
    visited.add(node);
    for (const next of graph.get(node) ?? []) {
      const found = dfs(next, [...trail, next]);
      if (found) return found;
    }
    return null;
  };

  const trail = dfs(requiredSubjectId, [requiredSubjectId]);
  if (!trail) return { hasCycle: false, path: [] };

  return { hasCycle: true, path: [subjectId, ...trail] };
}
