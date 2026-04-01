// ═══════════════════════════════════════════════════════════
// Bharat Lens — Map Utility Functions
// ═══════════════════════════════════════════════════════════

import { HEAT_COLOURS } from '../types';
import type { HeatColourKey, State } from '../types';
import partiesData from '../data/parties.json';

// ═══════════════════════════════════════════════════════════
// 10-STOP HEAT COLOUR SPECTRUM
// Perceptual gradient from ice blue (0-10) to crisis violet (91-100)
// ═══════════════════════════════════════════════════════════

interface HeatColourStop {
  maxScore: number;
  hex: string;
  glow: string;
  label: string;
}

export const HEAT_SPECTRUM: HeatColourStop[] = [
  { maxScore: 10, hex: '#00E5FF', glow: '#00E5FF55', label: 'Ice Blue' },
  { maxScore: 20, hex: '#00FF88', glow: '#00FF8855', label: 'Emerald' },
  { maxScore: 30, hex: '#7BFF5E', glow: '#7BFF5E55', label: 'Lime' },
  { maxScore: 40, hex: '#C8FF00', glow: '#C8FF0055', label: 'Yellow-Green' },
  { maxScore: 50, hex: '#FFE600', glow: '#FFE60055', label: 'Golden Yellow' },
  { maxScore: 60, hex: '#FFB800', glow: '#FFB80055', label: 'Amber' },
  { maxScore: 70, hex: '#FF7A00', glow: '#FF7A0055', label: 'Burnt Orange' },
  { maxScore: 80, hex: '#FF3D00', glow: '#FF3D0055', label: 'Vermillion' },
  { maxScore: 90, hex: '#FF0033', glow: '#FF003355', label: 'Crimson' },
  { maxScore: 100, hex: '#CC00FF', glow: '#CC00FF55', label: 'Crisis Violet' },
];

// Special override colours (not score-based)
export const ELECTION_COLOUR = { hex: '#4A9EFF', glow: '#4A9EFF55', label: 'Election Blue' };
export const DISPUTED_COLOUR = { hex: '#A855F7', glow: '#A855F755', label: 'Disputed Purple' };

interface HeatColourResult {
  hex: string;
  glow: string;
  label: string;
}

interface HeatColourFlags {
  isElection?: boolean;
  isDisputed?: boolean;
}

/**
 * Get the border colour and glow for a given heat score (0-100)
 * Uses 10-stop perceptual gradient spectrum
 * Supports special override flags for election mode and disputed territories
 */
export function getHeatColour(
  score: number,
  flags?: HeatColourFlags
): HeatColourResult {
  // Check override flags first
  if (flags?.isElection) {
    return ELECTION_COLOUR;
  }
  if (flags?.isDisputed) {
    return DISPUTED_COLOUR;
  }

  // Clamp score to 0-100 range
  const clampedScore = Math.max(0, Math.min(100, score));

  // Find the first spectrum entry where score <= maxScore
  const stop = HEAT_SPECTRUM.find((s) => clampedScore <= s.maxScore);

  // Return the matched stop or fallback to the highest (Crisis Violet)
  return stop || HEAT_SPECTRUM[HEAT_SPECTRUM.length - 1];
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
 * Uses 10-stop perceptual gradient spectrum
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

  // Sentiment mode: use heat_score for 10-stop gradient
  const cases: (string | maplibregl.ExpressionSpecification)[] = ['match', ['get', 'st_nm']];
  states.forEach((state) => {
    // Check for special flags
    const isElection = state.heat_colour === 'blue';
    const isDisputed = state.heat_colour === 'purple';
    const colour = getHeatColour(state.heat_score, { isElection, isDisputed });
    cases.push(state.geo_name, colour.hex);
  });
  cases.push('#888888'); // default
  return cases as maplibregl.ExpressionSpecification;
}

/**
 * Build a MapLibre style expression for glow colours
 */
export function buildGlowColourExpression(
  states: State[],
  mode: 'sentiment' | 'party' = 'sentiment'
): maplibregl.ExpressionSpecification {
  if (mode === 'party') {
    const cases: (string | maplibregl.ExpressionSpecification)[] = ['match', ['get', 'st_nm']];
    states.forEach((state) => {
      const partyColour = getPartyColour(state.ruling_party);
      cases.push(state.geo_name, partyColour + '66');
    });
    cases.push('#88888844'); // default
    return cases as maplibregl.ExpressionSpecification;
  }

  // Sentiment mode: use heat_score for 10-stop gradient glow
  const cases: (string | maplibregl.ExpressionSpecification)[] = ['match', ['get', 'st_nm']];
  states.forEach((state) => {
    const isElection = state.heat_colour === 'blue';
    const isDisputed = state.heat_colour === 'purple';
    const colour = getHeatColour(state.heat_score, { isElection, isDisputed });
    cases.push(state.geo_name, colour.glow);
  });
  cases.push('#88888844'); // default
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

  // Sentiment mode: use heat_score for 10-stop gradient
  const cases: (string | maplibregl.ExpressionSpecification)[] = ['match', ['get', 'st_nm']];
  states.forEach((state) => {
    const isElection = state.heat_colour === 'blue';
    const isDisputed = state.heat_colour === 'purple';
    const colour = getHeatColour(state.heat_score, { isElection, isDisputed });
    cases.push(state.geo_name, colour.hex);
  });
  cases.push('#888888');
  return cases as maplibregl.ExpressionSpecification;
}

/**
 * Desaturate and darken a hex colour for district borders
 * Returns a muted version (40% desaturated, 20% darker)
 */
export function muteColour(hex: string, satFactor = 0.6, brightFactor = 0.8): string {
  // Parse hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Convert to HSL
  const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rNorm) h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
    else if (max === gNorm) h = ((bNorm - rNorm) / d + 2) / 6;
    else h = ((rNorm - gNorm) / d + 4) / 6;
  }

  // Apply desaturation and darkening
  const newS = s * satFactor;
  const newL = l * brightFactor;

  // Convert back to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let rOut: number, gOut: number, bOut: number;
  if (newS === 0) {
    rOut = gOut = bOut = newL;
  } else {
    const q = newL < 0.5 ? newL * (1 + newS) : newL + newS - newL * newS;
    const p = 2 * newL - q;
    rOut = hue2rgb(p, q, h + 1/3);
    gOut = hue2rgb(p, q, h);
    bOut = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (n: number) => Math.round(Math.min(255, Math.max(0, n * 255))).toString(16).padStart(2, '0');
  return `#${toHex(rOut)}${toHex(gOut)}${toHex(bOut)}`;
}

/**
 * Build a MapLibre style expression for district border colours
 * Districts inherit parent state heat colour but muted (desaturated + darkened)
 */
export function buildDistrictBorderColourExpression(
  states: State[],
  mode: 'sentiment' | 'party' = 'sentiment'
): maplibregl.ExpressionSpecification {
  const cases: (string | maplibregl.ExpressionSpecification)[] = ['match', ['get', 'st_nm']];
  states.forEach((state) => {
    let baseHex: string;
    if (mode === 'party') {
      baseHex = getPartyColour(state.ruling_party);
    } else {
      const isElection = state.heat_colour === 'blue';
      const isDisputed = state.heat_colour === 'purple';
      baseHex = getHeatColour(state.heat_score, { isElection, isDisputed }).hex;
    }
    cases.push(state.geo_name, muteColour(baseHex));
  });
  cases.push('#555555'); // default
  return cases as maplibregl.ExpressionSpecification;
}

/**
 * Build a MapLibre style expression for district glow colours
 */
export function buildDistrictGlowColourExpression(
  states: State[],
  mode: 'sentiment' | 'party' = 'sentiment'
): maplibregl.ExpressionSpecification {
  const cases: (string | maplibregl.ExpressionSpecification)[] = ['match', ['get', 'st_nm']];
  states.forEach((state) => {
    let baseHex: string;
    if (mode === 'party') {
      baseHex = getPartyColour(state.ruling_party);
    } else {
      const isElection = state.heat_colour === 'blue';
      const isDisputed = state.heat_colour === 'purple';
      baseHex = getHeatColour(state.heat_score, { isElection, isDisputed }).hex;
    }
    cases.push(state.geo_name, muteColour(baseHex) + '44');
  });
  cases.push('#55555522'); // default
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
