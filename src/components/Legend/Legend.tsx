// ═══════════════════════════════════════════════════════════
// Bharat Lens — Legend Component
// 10-stop perceptual gradient legend (bottom-left)
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { HEAT_SPECTRUM, ELECTION_COLOUR, DISPUTED_COLOUR } from '../../utils/mapStyles';

export default function Legend() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="legend-container" id="legend">
      <div className="legend-panel">
        <button className="legend-toggle" onClick={() => setIsOpen(!isOpen)}>
          <span>HEAT INDEX SPECTRUM</span>
          <span className={`legend-chevron ${isOpen ? 'open' : ''}`}>▾</span>
        </button>
        {isOpen && (
          <div className="legend-content">
            {/* 10-stop gradient bar */}
            <div className="legend-gradient-bar">
              {HEAT_SPECTRUM.map((stop, index) => (
                <div
                  key={index}
                  className="legend-gradient-stop"
                  style={{
                    background: stop.hex,
                    boxShadow: `0 0 6px ${stop.glow}`,
                    flex: 1,
                  }}
                  title={`${stop.maxScore - 9}-${stop.maxScore}: ${stop.label}`}
                />
              ))}
            </div>

            {/* Labels for key stops */}
            <div className="legend-labels">
              <div className="legend-label-item">
                <span className="legend-label-value">0</span>
                <span className="legend-label-text">Stable</span>
              </div>
              <div className="legend-label-item">
                <span className="legend-label-value">50</span>
                <span className="legend-label-text">Elevated</span>
              </div>
              <div className="legend-label-item">
                <span className="legend-label-value">100</span>
                <span className="legend-label-text">Crisis</span>
              </div>
            </div>

            {/* Special states */}
            <div className="legend-special">
              <div className="legend-item">
                <span
                  className="legend-colour"
                  style={{
                    background: ELECTION_COLOUR.hex,
                    boxShadow: `0 0 6px ${ELECTION_COLOUR.glow}`,
                  }}
                />
                <span className="legend-label">
                  <strong>{ELECTION_COLOUR.label}</strong> — Active election cycle
                </span>
              </div>
              <div className="legend-item">
                <span
                  className="legend-colour"
                  style={{
                    background: DISPUTED_COLOUR.hex,
                    boxShadow: `0 0 6px ${DISPUTED_COLOUR.glow}`,
                  }}
                />
                <span className="legend-label">
                  <strong>{DISPUTED_COLOUR.label}</strong> — Special status region
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
