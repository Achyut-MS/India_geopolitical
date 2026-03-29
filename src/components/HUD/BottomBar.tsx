// ═══════════════════════════════════════════════════════════
// Bharat Lens — BottomBar HUD Component
// ═══════════════════════════════════════════════════════════

import { useStore } from '../../store/useStore';

export default function BottomBar() {
  const { cursorPosition, zoomLevel, adminBreadcrumb } = useStore();

  return (
    <footer className="bottom-bar" id="bottom-bar">
      {/* Left: Coordinates */}
      <div className="bottom-bar-section">
        <span className="bottom-bar-coord">
          {cursorPosition
            ? `${cursorPosition.lat.toFixed(4)}°N  ${cursorPosition.lng.toFixed(4)}°E`
            : '—.——°N  —.——°E'}
        </span>
      </div>

      {/* Center: Breadcrumb */}
      <div className="bottom-bar-section">
        <div className="bottom-bar-breadcrumb">
          {adminBreadcrumb.map((crumb, i) => (
            <span key={crumb}>
              {i > 0 && <span className="breadcrumb-separator"> › </span>}
              <span
                className={`breadcrumb-item ${i === adminBreadcrumb.length - 1 ? 'active' : ''}`}
              >
                {crumb}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Right: Zoom + Freshness */}
      <div className="bottom-bar-section">
        <span className="zoom-badge">Z{zoomLevel.toFixed(1)}</span>
        <span className="freshness-badge">
          <span className="freshness-dot" style={{ background: 'var(--accent-success)' }} />
          GEO
        </span>
        <span className="freshness-badge">
          <span className="freshness-dot" style={{ background: 'var(--accent-success)' }} />
          NEWS
        </span>
        <span className="attribution-footer">
          Data: ECI · Datameet · TCPD · Myneta
        </span>
      </div>
    </footer>
  );
}
