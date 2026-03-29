// ═══════════════════════════════════════════════════════════
// Bharat Lens — MapControls Component
// Floating controls: layer toggle, colour mode, search
// ═══════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import statesData from '../../data/states.json';
import type { State } from '../../types';
import { fuzzyMatch } from '../../utils/mapStyles';

export default function MapControls() {
  const {
    activeColourMode,
    setColourMode,
    isPanelOpen,
    selectState,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const typedStates = statesData as unknown as State[];

  const searchResults = useCallback(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    return typedStates.filter(
      (s) =>
        fuzzyMatch(s.name, searchQuery) ||
        fuzzyMatch(s.capital, searchQuery) ||
        fuzzyMatch(s.cm_name, searchQuery)
    ).slice(0, 8);
  }, [searchQuery, typedStates]);

  const handleResultClick = (state: State) => {
    selectState(state);
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div className={`map-controls ${isPanelOpen ? 'panel-open' : ''}`} id="map-controls">
      {/* Search */}
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          type="text"
          placeholder="Search state, city, leader..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          id="search-input"
        />
        {showResults && searchResults().length > 0 && (
          <div className="search-results">
            {searchResults().map((state) => (
              <div
                key={state.id}
                className="search-result-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleResultClick(state)}
              >
                <span>{state.name}</span>
                <span className="search-result-type">{state.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Colour Mode Toggle */}
      <div className="pill-toggle">
        <button
          className={`pill-option ${activeColourMode === 'sentiment' ? 'active' : ''}`}
          onClick={() => setColourMode('sentiment')}
          id="btn-sentiment-mode"
        >
          Sentiment
        </button>
        <button
          className={`pill-option ${activeColourMode === 'party' ? 'active' : ''}`}
          onClick={() => setColourMode('party')}
          id="btn-party-mode"
        >
          Party
        </button>
      </div>

      {/* Map Style Toggle (placeholder for Phase 1) */}
      <div className="pill-toggle">
        <button className="pill-option active" id="btn-political-map">
          Political
        </button>
        <button className="pill-option" disabled style={{ opacity: 0.4 }} id="btn-satellite-map">
          Satellite
        </button>
      </div>
    </div>
  );
}
