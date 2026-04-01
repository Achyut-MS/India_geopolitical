// ═══════════════════════════════════════════════════════════
// Bharat Lens — StatePanel Component
// Glassmorphism side panel with full state political data
// ═══════════════════════════════════════════════════════════

import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useWikipediaPhoto } from '../../hooks/useWikipediaPhoto';
import newsData from '../../data/news-seed.json';
import representativesData from '../../data/representatives.json';
import { getPartyColour, getPartyInfo, getHeatColour, formatRelativeTime, getSentimentColour } from '../../utils/mapStyles';
import type { NewsItem, State, Representative } from '../../types';

export default function StatePanel() {
  const { selectedState, isPanelOpen, selectState } = useStore();
  const [isClosing, setIsClosing] = useState(false);

  const typedNews = newsData as unknown as NewsItem[];
  const typedReps = representativesData as unknown as Representative[];

  const stateNews = useMemo(() => {
    if (!selectedState) return [];
    return typedNews
      .filter((n) => n.state_id === selectedState.id)
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 5);
  }, [selectedState, typedNews]);

  const cmRepresentative = useMemo(() => {
    if (!selectedState) return null;
    return typedReps.find((r) => r.state_id === selectedState.id && r.designation === 'CM') || null;
  }, [selectedState, typedReps]);

  if (!isPanelOpen || !selectedState) return null;

  const state = selectedState as State;
  const partyInfo = getPartyInfo(state.ruling_party);
  const isElection = state.heat_colour === 'blue';
  const isDisputed = state.heat_colour === 'purple';
  const heatColour = getHeatColour(state.heat_score, { isElection, isDisputed });

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
            {cmRepresentative ? (
              <div className="cm-card-new">
                <RepresentativeAvatar
                  representative={cmRepresentative}
                  size="large"
                  partyColour={getPartyColour(state.cm_party)}
                  heatColour={heatColour.hex}
                  showBadge={true}
                  badgeText="CM"
                />
                <div className="cm-details-new">
                  <span className="cm-name">{cmRepresentative.name}</span>
                  {cmRepresentative.name_hi && (
                    <span className="cm-name-hi">{cmRepresentative.name_hi}</span>
                  )}
                  <span className="cm-party" style={{ color: getPartyColour(state.cm_party) }}>
                    {partyInfo?.logo_emoji} {partyInfo?.name || state.cm_party}
                  </span>
                  {cmRepresentative.constituency && (
                    <span className="cm-constituency">
                      📍 {cmRepresentative.constituency}
                      {cmRepresentative.term_start && ` • Since ${cmRepresentative.term_start}`}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="cm-card">
                <div className="cm-avatar" style={{ background: `${getPartyColour(state.cm_party)}20`, borderColor: `${getPartyColour(state.cm_party)}40` }}>
                  {getInitials(state.cm_name)}
                </div>
                <div className="cm-details">
                  <span className="cm-name">{state.cm_name}</span>
                  <span className="cm-role" style={{ color: getPartyColour(state.cm_party) }}>{state.cm_party}</span>
                  <span className="cm-constituency">{state.capital}</span>
                </div>
              </div>
            )}
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

// ═══════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════

/**
 * Get initials from a name (first letter of first name + first letter of last name)
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * RepresentativeAvatar Component
 * Shows photo if available, otherwise initials avatar with party color
 */
interface RepresentativeAvatarProps {
  representative: { name: string; photo_url?: string | null; party_id: string };
  size?: 'small' | 'medium' | 'large';
  partyColour: string;
  heatColour?: string;
  showBadge?: boolean;
  badgeText?: string;
}

function RepresentativeAvatar({
  representative,
  size = 'medium',
  partyColour,
  heatColour,
  showBadge = false,
  badgeText,
}: RepresentativeAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Fetch photo from Wikipedia if no photo_url
  const { photoUrl: wikiPhotoUrl, loading: wikiLoading } = useWikipediaPhoto(
    representative.name,
    representative.photo_url,
    true
  );

  const resolvedPhotoUrl = representative.photo_url || wikiPhotoUrl;
  const isLoading = !representative.photo_url && wikiLoading;

  const sizeMap = {
    small: 44,
    medium: 72,
    large: 96,
  };
  const avatarSize = sizeMap[size];

  const initials = getInitials(representative.name);
  const hasPhoto = resolvedPhotoUrl && !imageError;
  const borderColor = heatColour || partyColour;

  return (
    <div className="representative-avatar-container" style={{ position: 'relative' }}>
      <div
        className={`representative-avatar ${size}`}
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: '50%',
          border: `2px solid ${borderColor}`,
          boxShadow: `0 0 12px ${borderColor}44`,
          overflow: 'hidden',
          background: hasPhoto ? '#1A1C24' : `${partyColour}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {(isLoading) && (
          <div className="avatar-shimmer" style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }} />
        )}
        {hasPhoto ? (
          <img
            src={resolvedPhotoUrl!}
            alt={representative.name}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={() => setImageError(true)}
          />
        ) : !isLoading ? (
          <div
            className="avatar-initials"
            style={{
              fontSize: size === 'large' ? 32 : size === 'medium' ? 24 : 16,
              fontWeight: 700,
              color: partyColour,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {initials}
          </div>
        ) : null}
      </div>
      {showBadge && badgeText && (
        <div
          className="representative-badge"
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            padding: '2px 6px',
            borderRadius: 'var(--radius-full)',
            background: borderColor,
            fontSize: 10,
            fontWeight: 700,
            color: '#000',
            fontFamily: 'var(--font-mono)',
            border: '1.5px solid #000',
          }}
        >
          {badgeText}
        </div>
      )}
    </div>
  );
}
