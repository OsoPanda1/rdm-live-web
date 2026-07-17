import type { TimeUpVerdict, FederationId, ThemeId, OntologyNode, SemanticRules } from "./types";

export function evaluateTimeUp(
  node: OntologyNode,
  targetFederationId: FederationId,
  targetThemeId: ThemeId,
  context: { userId?: string; isExternal: boolean },
): TimeUpVerdict {
  if (node.federationId !== targetFederationId) {
    return {
      allowed: false,
      reason: `Cruce de federación bloqueado: nodo ${node.nodeName} pertenece a F${node.federationId}, consulta targetea F${targetFederationId}`,
      containedFederation: node.federationId,
      violatedRule: "federation_boundary",
    };
  }

  if (node.themeId !== targetThemeId) {
    return {
      allowed: false,
      reason: `Cruce de eje temático bloqueado: nodo ${node.nodeName} pertenece a T${node.themeId}, consulta targetea T${targetThemeId}`,
      containedFederation: node.federationId,
      violatedRule: "theme_boundary",
    };
  }

  if (!node.semanticRules.allowExternalInference && context.isExternal) {
    return {
      allowed: false,
      reason: `Inferencia externa denegada por reglas semánticas del nodo ${node.nodeName}`,
      containedFederation: node.federationId,
      violatedRule: "external_inference_blocked",
    };
  }

  return {
    allowed: true,
    reason: null,
    containedFederation: node.federationId,
    violatedRule: null,
  };
}

export function canNavigateChildren(
  parent: OntologyNode,
  children: OntologyNode[],
  targetFederationId: FederationId,
  targetThemeId: ThemeId,
): OntologyNode[] {
  return children.filter((child) => {
    if (child.federationId !== targetFederationId) return false;
    if (child.themeId !== targetThemeId) return false;
    return true;
  });
}
