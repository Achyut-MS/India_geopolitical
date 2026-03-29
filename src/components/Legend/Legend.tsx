// ═══════════════════════════════════════════════════════════
// Bharat Lens — Legend Component
// Collapsible colour key (bottom-left)
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { HEAT_COLOURS } from '../../types';

const legendItems = [
  { key: 'green', ...HEAT_COLOURS.green },
  { key: 'amber', ...HEAT_COLOURS.amber },
  { key: 'orange', ...HEAT_COLOURS.orange },
  { key: 'red', ...HEAT_COLOURS.red },
  { key: 'blue', ...HEAT_COLOURS.blue },
  { key: 'purple', ...HEAT_COLOURS.purple },
  { key: 'grey', ...HEAT_COLOURS.grey },
];

export default function Legend() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="legend-container" id="legend">
      <div className="legend-panel">
        <button className="legend-toggle" onClick={() => setIsOpen(!isOpen)}>
          <span>GEOPOLITICAL STATUS</span>
          <span className={`legend-chevron ${isOpen ? 'open' : ''}`}>▾</span>
        </button>
        {isOpen && (
          <div className="legend-content">
            {legendItems.map((item) => (
              <div key={item.key} className="legend-item">
                <span
                  className="legend-colour"
                  style={{
                    background: item.hex,
                    '--legend-glow': item.glow,
                  } as React.CSSProperties}
                />
                <span className="legend-label">
                  <strong>{item.label}</strong> — {item.description}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
