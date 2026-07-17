export * from "./types";
export * from "./alignment";
export * from "./timeup";

import { supabase } from "@/integrations/supabase/client";
import type { OntologyNode, FederationId, ThemeId, AbstractionLevel } from "./types";
import { evaluateAlignment } from "./alignment";
import { evaluateTimeUp } from "./timeup";

export interface OntologyQueryResult {
  node: OntologyNode | null;
  alignment: ReturnType<typeof evaluateAlignment>;
  timeUp: ReturnType<typeof evaluateTimeUp>;
  children: OntologyNode[];
  path: OntologyNode[];
}

export async function locateNode(
  query: string,
  targetFederationId: FederationId,
  targetThemeId: ThemeId,
): Promise<OntologyQueryResult> {
  const { data: node } = await supabase
    .from("isabella_ontology")
    .select("*")
    .ilike("node_name", `%${query}%`)
    .maybeSingle();

  if (!node) {
    const alignment = evaluateAlignment({ federationId: targetFederationId, themeId: targetThemeId, abstractionLevel: 1 as AbstractionLevel });
    return {
      node: null,
      alignment,
      timeUp: { allowed: false, reason: "Nodo no encontrado en la ontología", containedFederation: null, violatedRule: "node_not_found" },
      children: [],
      path: [],
    };
  }

  const mapped: OntologyNode = {
    nodeId: node.node_id,
    parentNodeId: node.parent_node_id,
    federationId: node.federation_id,
    themeId: node.theme_id,
    nodeName: node.node_name,
    chromaticHex: node.chromatic_hex,
    abstractionLevel: node.abstraction_level,
    semanticRules: node.semantic_rules,
    createdAt: node.created_at,
  };

  const alignment = evaluateAlignment({
    federationId: mapped.federationId,
    themeId: mapped.themeId,
    abstractionLevel: mapped.abstractionLevel,
  });

  const timeUp = evaluateTimeUp(mapped, targetFederationId, targetThemeId, { isExternal: false });

  const { data: children } = await supabase
    .from("isabella_ontology")
    .select("*")
    .eq("parent_node_id", mapped.nodeId);

  const { data: ancestors } = await supabase
    .rpc("get_ontology_ancestors" as never, { node_uuid: mapped.nodeId } as never);

  return {
    node: mapped,
    alignment,
    timeUp,
    children: (children ?? []).map(mapRow),
    path: (ancestors ?? []).map(mapRow).reverse(),
  };
}

function mapRow(row: Record<string, unknown>): OntologyNode {
  const semanticRules =
    typeof row.semantic_rules === "object" && row.semantic_rules !== null
      ? (row.semantic_rules as OntologyNode["semanticRules"])
      : { allowExternalInference: false };

  return {
    nodeId: String(row.node_id),
    parentNodeId: row.parent_node_id === null ? null : String(row.parent_node_id),
    federationId: Number(row.federation_id) as OntologyNode["federationId"],
    themeId: Number(row.theme_id) as OntologyNode["themeId"],
    nodeName: String(row.node_name),
    chromaticHex: String(row.chromatic_hex),
    abstractionLevel: Number(row.abstraction_level) as OntologyNode["abstractionLevel"],
    semanticRules,
    createdAt: String(row.created_at),
  };
}
