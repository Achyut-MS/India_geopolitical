// ═══════════════════════════════════════════════════════════
// Bharat Lens — Map Utility Functions
// ═══════════════════════════════════════════════════════════

import { HEAT_COLOURS } from '../types';
import type { HeatColourKey, State } from '../types';
import partiesData from '../data/parties.json';

/**
 * Get the border colour and glow for a given heat score
 */
export function getHeatColour(score: number): { hex: string; glow: string; label: string } {
  if (score >= 75) return { ...HEAT_COLOURS.red, hex: HEAT_COLOURS.red.hex, glow: HEAT_COLOURS.red.glow };
  if (score >= 60) return { ...HEAT_COLOURS.orange, hex: HEAT_COLOURS.orange.hex, glow: HEAT_COLOURS.orange.glow };
  if (score >= 40) return { ...HEAT_COLOURS.amber, hex: HEAT_COLOURS.amber.hex, glow: HEAT_COLOURS.amber.glow };
  return { ...HEAT_COLOURS.green, hex: HEAT_COLOURS.green.hex, glow: HEAT_COLOURS.green.glow };
}

/**
 * Get the heat colour config for a given key
 */
export function getHeatColourByKey(key: HeatColourKey) {
  return HEAT_COLOURS[key] || HEAT_COLOURS.grey;
}

/**
 * Get party colour by party ID or abbreviation  
 */
export function getPartyColour(partyId: string): string {
  const party = partiesData.find(
    (p) => p.id === partyId || p.abbreviation === partyId
  );
  return party?.colour_hex || '#808080';
}

/**
 * Get party info by ID
 */
export function getPartyInfo(partyId: string) {
  return partiesData.find(
    (p) => p.id === partyId || p.abbreviation === partyId
  );
}

/**
 * Build a MapLibre style expression for border colours based on state data
 */
export function buildBorderColourExpression(
  states: State[],
  mode: 'sentiment' | 'party' = 'sentiment'
): maplibregl.ExpressionSpecification {
  if (mode === 'party') {
    const cases: (string | maplibregl.ExpressionSpecification)[] = ['match', ['get', 'st_nm']];
    states.forEach((state) => {
      const partyColour = getPartyColour(state.ruling_party);
      cases.push(state.geo_name, partyColour);
    });
    cases.push('#888888'); // default
    return cases as maplibregl.ExpressionSpecification;
  }

  // Sentiment mode: use heat_colour from state data
  const cases: (string | maplibregl.ExpressionSpecification)[] = ['match', ['get', 'st_nm']];
  states.forEach((state) => {
    const colour = getHeatColourByKey(state.heat_colour);
    cases.push(state.geo_name, colour.hex);
  });
  cases.push('#888888'); // default
  return cases as maplibregl.ExpressionSpecification;
}

/**
 * Build a MapLibre style expression for fill colours
 */
export function buildFillColourExpression(
  states: State[],
  mode: 'sentiment' | 'party' = 'sentiment'
): maplibregl.ExpressionSpecification {
  if (mode === 'party') {
    const cases: (string | maplibregl.ExpressionSpecification)[] = ['match', ['get', 'st_nm']];
    states.forEach((state) => {
      const partyColour = getPartyColour(state.ruling_party);
      cases.push(state.geo_name, partyColour);
    });
    cases.push('#888888');
    return cases as maplibregl.ExpressionSpecification;
  }

  const cases: (string | maplibregl.ExpressionSpecification)[] = ['match', ['get', 'st_nm']];
  states.forEach((state) => {
    const colour = getHeatColourByKey(state.heat_colour);
    cases.push(state.geo_name, colour.hex);
  });
  cases.push('#888888');
  return cases as maplibregl.ExpressionSpecification;
}

/**
 * Format relative time
 */
export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Get sentiment colour
 */
export function getSentimentColour(label: string): string {
  switch (label) {
    case 'positive': return '#00FF88';
    case 'negative': return '#FF2D2D';
    case 'volatile': return '#FFB800';
    default: return '#8B8FA8';
  }
}

/**
 * Fuzzy search helper
 */
export function fuzzyMatch(text: string, query: string): boolean {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < textLower.length && qi < queryLower.length; ti++) {
    if (textLower[ti] === queryLower[qi]) qi++;
  }
  return qi === queryLower.length;
}
