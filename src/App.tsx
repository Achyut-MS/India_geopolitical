// ═══════════════════════════════════════════════════════════
// Bharat Lens — Root App Component
// ═══════════════════════════════════════════════════════════

import BharatMap from './components/Map/BharatMap';
import TopBar from './components/HUD/TopBar';
import BottomBar from './components/HUD/BottomBar';
import StatePanel from './components/Panels/StatePanel';
import MapControls from './components/Controls/MapControls';
import Legend from './components/Legend/Legend';

import './styles/animations.css';
import './styles/map.css';
import './styles/panels.css';

export default function App() {
  return (
    <div id="bharat-lens-app" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Map fills the entire viewport */}
      <BharatMap />

      {/* Floating HUD overlays */}
      <TopBar />
      <BottomBar />

      {/* Controls (top-right) */}
      <MapControls />

      {/* Legend (bottom-left) */}
      <Legend />

      {/* Side panel (conditionally shown) */}
      <StatePanel />
    </div>
  );
}
