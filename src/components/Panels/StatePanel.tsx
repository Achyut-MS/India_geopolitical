// ═══════════════════════════════════════════════════════════
// Bharat Lens — StatePanel Component
// Glassmorphism side panel with full state political data
// ═══════════════════════════════════════════════════════════

import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import newsData from '../../data/news-seed.json';
import { getPartyColour, getPartyInfo, getHeatColourByKey, formatRelativeTime, getSentimentColour } from '../../utils/mapStyles';
import type { NewsItem, State } from '../../types';

export default function StatePanel() {
  const { selectedState, isPanelOpen, selectState } = useStore();
  const [isClosing, setIsClosing] = useState(false);

  const typedNews = newsData as unknown as NewsItem[];

  const stateNews = useMemo(() => {
    if (!selectedState) return [];
    return typedNews
      .filter((n) => n.state_id === selectedState.id)
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 5);
  }, [selectedState, typedNews]);

  if (!isPanelOpen || !selectedState) return null;

  const state = selectedState as State;
  const partyInfo = getPartyInfo(state.ruling_party);
  const heatColour = getHeatColourByKey(state.heat_colour);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      selectState(null);
      setIsClosing(false);
    }, 350);
  };

  const rulingPct = state.total_assembly_seats > 0
    ? (state.ruling_seats / state.total_assembly_seats) * 100
    : 0;
  const oppositionPct = state.total_assembly_seats > 0
    ? (state.opposition_seats / state.total_assembly_seats) * 100
    : 0;
  const otherPct = 100 - rulingPct - oppositionPct;

  return (
    <div className={`side-panel ${isClosing ? 'closing' : ''}`} id="state-panel">
      {/* ─── Header ─── */}
      <div className="panel-header">
        <div className="panel-header-top">
          <div>
            <div className="panel-state-name">{state.name}</div>
            <div className="panel-state-name-hi">{state.name_hi}</div>
          </div>
          <button className="panel-close-btn" onClick={handleClose} aria-label="Close panel">
            ✕
          </button>
        </div>

        {/* Party Strip */}
        {partyInfo && (
          <div className="party-strip" style={{ background: `${getPartyColour(state.ruling_party)}08` }}>
            <div className="party-colour-bar" style={{ background: getPartyColour(state.ruling_party) }} />
            <div className="party-info">
              <span className="party-name-label">
                {partyInfo.logo_emoji} {partyInfo.name}
              </span>
              {state.coalition_partners.length > 0 && (
                <span className="party-coalition">
                  + {state.coalition_partners.join(', ')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Scrollable Content ─── */}
      <div className="panel-content stagger-children">
        {/* Heat Score */}
        <div className="panel-section">
          <div className="heat-gauge">
            <div>
              <div className="heat-gauge-label">HEAT INDEX</div>
              <div className="heat-gauge-bar">
                <div
                  className="heat-gauge-fill"
                  style={{
                    width: `${state.heat_score}%`,
                    background: heatColour.hex,
                    boxShadow: `0 0 8px ${heatColour.glow}`,
                    '--gauge-fill': `${state.heat_score}%`,
                  } as React.CSSProperties}
                />
              </div>
            </div>
            <div className="heat-gauge-value" style={{ color: heatColour.hex }}>
              {state.heat_score}
            </div>
          </div>
        </div>

        {/* Chief Minister */}
        {state.cm_name !== '—' && (
          <div className="panel-section">
            <div className="panel-section-title">Chief Minister</div>
            <div className="cm-card">
              <div className="cm-avatar" style={{ background: `${getPartyColour(state.cm_party)}20`, borderColor: `${getPartyColour(state.cm_party)}40` }}>
                👤
              </div>
              <div className="cm-details">
                <span className="cm-name">{state.cm_name}</span>
                <span className="cm-role" style={{ color: getPartyColour(state.cm_party) }}>{state.cm_party}</span>
                <span className="cm-constituency">{state.capital}</span>
              </div>
            </div>
          </div>
        )}

        {/* Governor */}
        <div className="panel-section">
          <div className="governor-row">
            <span className="governor-icon">🏛️</span>
            <div className="governor-details">
              <span className="governor-label">
                {state.type === 'ut' ? 'Lt. Governor / Administrator' : 'Governor'}
              </span>
              <span className="governor-name">{state.governor_name}</span>
            </div>
          </div>
        </div>

        {/* Assembly Stats */}
        {state.total_assembly_seats > 0 && (
          <div className="panel-section">
            <div className="panel-section-title">Assembly Composition</div>
            <div className="assembly-bar-container">
              <div className="assembly-bar">
                <div
                  className="assembly-bar-segment"
                  style={{
                    width: `${rulingPct}%`,
                    background: getPartyColour(state.ruling_party),
                  }}
                />
                <div
                  className="assembly-bar-segment"
                  style={{
                    width: `${oppositionPct}%`,
                    background: '#8B8FA8',
                  }}
                />
                {otherPct > 0 && (
                  <div
                    className="assembly-bar-segment"
                    style={{
                      width: `${otherPct}%`,
                      background: '#4A4E63',
                    }}
                  />
                )}
              </div>
              <div className="assembly-bar-labels">
                <span className="assembly-label">
                  <span className="assembly-dot" style={{ background: getPartyColour(state.ruling_party) }} />
                  Ruling {state.ruling_seats}
                </span>
                <span className="assembly-label">
                  <span className="assembly-dot" style={{ background: '#8B8FA8' }} />
                  Opposition {state.opposition_seats}
                </span>
                {state.other_seats > 0 && (
                  <span className="assembly-label">
                    <span className="assembly-dot" style={{ background: '#4A4E63' }} />
                    Other {state.other_seats}
                  </span>
                )}
              </div>
            </div>

            <div className="stat-row">
              <span className="stat-label">Total Seats</span>
              <span className="stat-value">{state.total_assembly_seats}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Majority Mark</span>
              <span className="stat-value">{Math.floor(state.total_assembly_seats / 2) + 1}</span>
            </div>
          </div>
        )}

        {/* Key Info */}
        <div className="panel-section">
          <div className="panel-section-title">Key Information</div>
          <div className="stat-row">
            <span className="stat-label">Capital</span>
            <span className="stat-value">{state.capital}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Type</span>
            <span className="stat-value">{state.type === 'ut' ? 'Union Territory' : 'State'}</span>
          </div>
          {state.last_election_year > 0 && (
            <div className="stat-row">
              <span className="stat-label">Last Election</span>
              <span className="stat-value">{state.last_election_year}</span>
            </div>
          )}
          {state.next_election_due > 0 && (
            <div className="stat-row">
              <span className="stat-label">Next Election Due</span>
              <span className="stat-value" style={{
                color: state.next_election_due <= 2026 ? 'var(--accent-election)' : undefined,
              }}>
                {state.next_election_due}
                {state.next_election_due <= 2026 && ' ⚡'}
              </span>
            </div>
          )}
        </div>

        {/* News */}
        {stateNews.length > 0 && (
          <div className="panel-section">
            <div className="panel-section-title">Latest Headlines</div>
            {stateNews.map((item) => (
              <div key={item.id} className="news-item" onClick={() => window.open(item.article_url, '_blank')}>
                <div className="news-headline">
                  <span
                    className="news-sentiment-dot"
                    style={{ background: getSentimentColour(item.sentiment_label) }}
                  />
                  {item.headline}
                </div>
                <div className="news-meta">
                  <span className="news-source">{item.source_name}</span>
                  <span className="news-time">{formatRelativeTime(item.published_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
