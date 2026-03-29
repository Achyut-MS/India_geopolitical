// ═══════════════════════════════════════════════════════════
// Bharat Lens — TopBar HUD Component
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import newsData from '../../data/news-seed.json';
import { getSentimentColour } from '../../utils/mapStyles';
import type { NewsItem } from '../../types';

export default function TopBar() {
  const [time, setTime] = useState(getISTTime());
  const typedNews = newsData as unknown as NewsItem[];

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getISTTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pick top headlines for ticker
  const tickerItems = typedNews
    .sort((a, b) => Math.abs(b.sentiment_score) - Math.abs(a.sentiment_score))
    .slice(0, 8);

  return (
    <header className="top-bar" id="top-bar">
      {/* Left: Logo */}
      <div className="top-bar-left">
        <div className="app-logo">
          <span className="app-logo-accent">BHARAT</span> LENS
        </div>
        <div className="top-bar-divider" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="pulse-dot" />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            LIVE
          </span>
        </div>
      </div>

      {/* Center: Clock + Session */}
      <div className="top-bar-center">
        <div className="top-bar-divider" />
        <div className="clock-display">{time} IST</div>
        <div className="session-indicator">
          <span className="session-dot" />
          BUDGET SESSION
        </div>
        <div className="top-bar-divider" />
      </div>

      {/* Right: Ticker + Update */}
      <div className="top-bar-right">
        <div className="ticker-container">
          <div className="ticker-track">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <div key={`${item.id}-${i}`} className="ticker-item">
                <span
                  className="ticker-sentiment-dot"
                  style={{ background: getSentimentColour(item.sentiment_label) }}
                />
                <span className="ticker-headline">
                  {item.headline}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="update-indicator">
          <span className="spin" style={{ fontSize: '10px' }}>⟳</span>
          <span>2m ago</span>
        </div>
      </div>
    </header>
  );
}

function getISTTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}
