// ═══════════════════════════════════════════════════════════
// Bharat Lens — Type Definitions
// ═══════════════════════════════════════════════════════════

export interface State {
  id: string;
  name: string;
  name_hi: string;
  capital: string;
  type: 'state' | 'ut';
  cm_name: string;
  cm_party: string;
  governor_name: string;
  ruling_party: string;
  coalition_partners: string[];
  total_assembly_seats: number;
  ruling_seats: number;
  opposition_seats: number;
  other_seats: number;
  last_election_year: number;
  next_election_due: number;
  heat_score: number;
  heat_colour: HeatColourKey;
  centroid: [number, number]; // [lng, lat]
  geo_name: string; // GeoJSON feature property name match
}

export type HeatColourKey = 'green' | 'amber' | 'orange' | 'red' | 'blue' | 'purple' | 'grey';

export interface HeatColourConfig {
  hex: string;
  glow: string;
  label: string;
  description: string;
}

export interface Party {
  id: string;
  name: string;
  abbreviation: string;
  colour_hex: string;
  logo_emoji: string;
  alliance?: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  source_name: string;
  article_url: string;
  published_at: string;
  state_id: string;
  sentiment_score: number; // -1.0 to 1.0
  sentiment_label: 'positive' | 'neutral' | 'negative' | 'volatile';
  topic: 'election' | 'economy' | 'crime' | 'disaster' | 'policy' | 'development';
}

export interface BorderColour {
  state_id: string;
  colour_hex: string;
  glow_hex: string;
  heat_score: number;
  computed_at: string;
}

export interface District {
  id: string;
  name: string;
  state_id: string;
  hq: string;
  centroid?: [number, number];
}

export interface Representative {
  id: string;
  name: string;
  name_hi?: string;
  photo_url?: string;
  party_id: string;
  designation: 'CM' | 'Cabinet Minister' | 'MoS' | 'MLA' | 'MP' | 'Governor';
  constituency?: string;
  state_id: string;
  district_id?: string;
  votes_received?: number;
  vote_margin?: number;
  term_start?: number;
  criminal_cases?: number;
  assets_declared_inr?: number;
}

// Store types
export interface AppState {
  selectedState: State | null;
  selectedDistrict: District | null;
  zoomLevel: number;
  fullyVisibleStateCount: number;
  activeColourMode: 'sentiment' | 'party';
  activeMapStyle: 'political' | 'satellite' | 'hybrid';
  isPanelOpen: boolean;
  hoveredStateId: string | null;
  adminBreadcrumb: string[];
  cursorPosition: { lat: number; lng: number } | null;
  isLoading: boolean;

  // Actions
  selectState: (state: State | null) => void;
  selectDistrict: (district: District | null) => void;
  setZoomLevel: (zoom: number) => void;
  setFullyVisibleStateCount: (count: number) => void;
  setColourMode: (mode: 'sentiment' | 'party') => void;
  setMapStyle: (style: 'political' | 'satellite' | 'hybrid') => void;
  togglePanel: (open?: boolean) => void;
  setHoveredState: (id: string | null) => void;
  setBreadcrumb: (crumbs: string[]) => void;
  setCursorPosition: (pos: { lat: number; lng: number } | null) => void;
  setLoading: (loading: boolean) => void;
}

// Map helper types
export interface MapViewState {
  center: [number, number];
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export const HEAT_COLOURS: Record<HeatColourKey, HeatColourConfig> = {
  green: {
    hex: '#00FF88',
    glow: '#00FF8866',
    label: 'Stable',
    description: 'Positive sentiment, strong majority government',
  },
  amber: {
    hex: '#FFB800',
    glow: '#FFB80066',
    label: 'Mild Tension',
    description: 'Coalition govt, moderate news churn',
  },
  orange: {
    hex: '#FF6B00',
    glow: '#FF6B0066',
    label: 'Elevated',
    description: 'Political uncertainty, protests',
  },
  red: {
    hex: '#FF2D2D',
    glow: '#FF2D2D66',
    label: 'High Alert',
    description: "President's Rule, major unrest, disaster",
  },
  blue: {
    hex: '#4A9EFF',
    glow: '#4A9EFF66',
    label: 'Election Mode',
    description: 'Active election/results cycle',
  },
  purple: {
    hex: '#A855F7',
    glow: '#A855F766',
    label: 'Disputed',
    description: 'Special status / disputed region',
  },
  grey: {
    hex: '#888888',
    glow: '#88888844',
    label: 'No Data',
    description: 'Pending analysis',
  },
};

export const INDIA_CENTER: [number, number] = [78.9629, 20.5937];
export const INDIA_ZOOM = 4.5;
