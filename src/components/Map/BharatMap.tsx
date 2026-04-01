// ═══════════════════════════════════════════════════════════
// Bharat Lens — BharatMap Component
// Multi-level zoom: Country → States → Districts
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { bbox } from '@turf/bbox';
import { useStore } from '../../store/useStore';
import statesData from '../../data/states.json';
import { buildBorderColourExpression, buildFillColourExpression, buildGlowColourExpression, buildDistrictBorderColourExpression, buildDistrictGlowColourExpression, getHeatColour } from '../../utils/mapStyles';
import type { State } from '../../types';
import { INDIA_CENTER, INDIA_ZOOM } from '../../types';

// ─── GeoJSON Sources ───
// State-level polygons (for country boundary + state borders)
const STATE_GEOJSON_URL =
  'https://raw.githubusercontent.com/adarshbiradar/maps-geojson/master/india.json';

// District-level polygons (for district borders + district labels)
const DISTRICT_GEOJSON_URL =
  'https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@ef25ebc/geojson/india.geojson';

const BASEMAP_STYLES = {
  political: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  satellite: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  hybrid: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
};

export default function BharatMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const {
    selectState,
    setZoomLevel,
    setCursorPosition,
    setHoveredState,
    activeColourMode,
    activeMapStyle,
    selectedState,
  } = useStore();

  const typedStates = statesData as unknown as State[];

  const findStateByGeoName = useCallback(
    (geoName: string): State | undefined => {
      return typedStates.find(
        (s) =>
          s.geo_name.toLowerCase() === geoName.toLowerCase() ||
          s.name.toLowerCase() === geoName.toLowerCase()
      );
    },
    [typedStates]
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: BASEMAP_STYLES[activeMapStyle],
      center: INDIA_CENTER,
      zoom: INDIA_ZOOM,
      minZoom: 3,
      maxZoom: 12,
      attributionControl: false,
      maxBounds: [
        [58, 2],   // SW
        [105, 42], // NE
      ],
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'bottom-right'
    );

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    );

    mapRef.current = map;

    // Create tooltip popup
    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'state-tooltip',
      offset: [0, -8],
    });

    // ═══════════════════════════════════════════════════════════
    // District Visibility Logic (Smart Zoom-Aware)
    // Show districts only when < 4 full states are visible
    // ═══════════════════════════════════════════════════════════
    const evaluateDistrictVisibility = () => {
      if (!map.isStyleLoaded()) return;

      const bounds = map.getBounds();
      const zoom = map.getZoom();

      // Fetch state features from the source
      const stateSource = map.getSource('india-states') as maplibregl.GeoJSONSource;
      if (!stateSource) return;

      // We need to count how many states are fully visible
      // A state is "fully visible" if all corners of its bounding box are within viewport
      let fullyVisibleCount = 0;

      // We'll use the state features from the source
      // Since we can't directly access features from GeoJSON source in MapLibre,
      // we'll use querySourceFeatures as a workaround
      try {
        const features = map.querySourceFeatures('india-states');
        const uniqueStates = new Map();

        features.forEach((feature) => {
          const stateName = feature.properties?.st_nm;
          if (!stateName || uniqueStates.has(stateName)) return;

          uniqueStates.set(stateName, feature);
        });

        uniqueStates.forEach((feature) => {
          if (!feature.geometry) return;
          
          try {
            const featureBbox = bbox(feature);
            const [minLng, minLat, maxLng, maxLat] = featureBbox;

            // Check if all 4 corners of the bbox are within the viewport
            const westOK = minLng >= bounds.getWest();
            const southOK = minLat >= bounds.getSouth();
            const eastOK = maxLng <= bounds.getEast();
            const northOK = maxLat <= bounds.getNorth();

            if (westOK && southOK && eastOK && northOK) {
              fullyVisibleCount++;
            }
          } catch (e) {
            // Skip features that can't be processed
          }
        });
      } catch (e) {
        // Fallback: use zoom level only
        const shouldShow = zoom >= 6.5;
        updateDistrictLayerVisibility(shouldShow);
        useStore.getState().setFullyVisibleStateCount(shouldShow ? 0 : 999);
        return;
      }

      // PRIMARY CONDITION: If >= 4 full states visible, hide districts
      // SECONDARY CONDITION: Fallback to zoom level if ambiguous
      let shouldShowDistricts = false;
      
      if (fullyVisibleCount === 0) {
        // No full states visible (edge case) - use zoom fallback
        shouldShowDistricts = zoom >= 6.5;
      } else {
        // Use state count as primary gate
        shouldShowDistricts = fullyVisibleCount < 4;
      }

      // Update store
      useStore.getState().setFullyVisibleStateCount(fullyVisibleCount);

      // Log in development
      if (import.meta.env.DEV) {
        console.log(`[District Visibility] States visible: ${fullyVisibleCount}, Zoom: ${zoom.toFixed(2)}, Districts: ${shouldShowDistricts ? 'SHOW' : 'HIDE'}`);
      }

      // Update layer visibility
      updateDistrictLayerVisibility(shouldShowDistricts);
    };

    const updateDistrictLayerVisibility = (shouldShow: boolean) => {
      if (!map.isStyleLoaded()) return;

      const layersToToggle = [
        'districts-fill',
        'districts-border-glow',
        'districts-border',
        'districts-labels',
      ];

      layersToToggle.forEach((layerId) => {
        if (map.getLayer(layerId)) {
          // Set opacity with transition
          const layerType = map.getLayer(layerId)?.type;
          
          if (layerType === 'fill') {
            map.setPaintProperty(layerId, 'fill-opacity', shouldShow ? 
              ['interpolate', ['linear'], ['zoom'], 6.5, 0, 7.5, 0.3, 8.5, 0.5] : 0
            );
          } else if (layerType === 'line') {
            map.setPaintProperty(layerId, 'line-opacity', shouldShow ? 
              (layerId.includes('glow') ? 
                ['interpolate', ['linear'], ['zoom'], 6.5, 0, 7, 0, 7.5, 0.15, 8, 0.3, 9, 0.4] :
                ['interpolate', ['linear'], ['zoom'], 6.5, 0, 7, 0, 7.5, 0.3, 8, 0.5, 9, 0.65]
              ) : 0
            );
          } else if (layerType === 'symbol') {
            map.setPaintProperty(layerId, 'text-opacity', shouldShow ? 
              ['interpolate', ['linear'], ['zoom'], 7, 0, 7.5, 0, 8, 0.4, 8.5, 0.7, 9, 0.85] : 0
            );
          }
        }
      });
    };

    // Wire up the visibility evaluator to map events
    const onMapMove = () => {
      evaluateDistrictVisibility();
    };

    map.on('load', () => {
      // ═══════════════════════════════════════════════════════
      // SOURCE 1: State-level polygons
      // ═══════════════════════════════════════════════════════
      map.addSource('india-states', {
        type: 'geojson',
        data: STATE_GEOJSON_URL,
        generateId: true,
      });

      // ═══════════════════════════════════════════════════════
      // SOURCE 2: District-level polygons
      // ═══════════════════════════════════════════════════════
      map.addSource('india-districts', {
        type: 'geojson',
        data: DISTRICT_GEOJSON_URL,
        generateId: true,
      });

      // ═══════════════════════════════════════════════════════
      // LAYER GROUP 1: Country boundary (always visible)
      // Uses the state-level source for clean outer edges
      // ═══════════════════════════════════════════════════════

      // Country boundary outer glow
      map.addLayer({
        id: 'country-boundary-glow',
        type: 'line',
        source: 'india-states',
        paint: {
          'line-color': 'rgba(74, 158, 255, 0.35)',
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            3, 4,
            5, 5,
            8, 3,
            10, 2,
          ],
          'line-blur': 6,
          'line-opacity': [
            'interpolate', ['linear'], ['zoom'],
            3, 0.6,
            5, 0.4,
            8, 0.2,
            10, 0.1,
          ],
        },
      });

      // Country boundary crisp line
      map.addLayer({
        id: 'country-boundary',
        type: 'line',
        source: 'india-states',
        paint: {
          'line-color': 'rgba(74, 158, 255, 0.7)',
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            3, 2,
            5, 2.5,
            8, 1.5,
            10, 1,
          ],
          'line-opacity': [
            'interpolate', ['linear'], ['zoom'],
            3, 0.8,
            5, 0.6,
            8, 0.3,
            10, 0.15,
          ],
        },
      });

      // ═══════════════════════════════════════════════════════
      // LAYER GROUP 2: State fills + borders + labels
      // Fade in at zoom ~4.5, fade out at zoom ~8+
      // ═══════════════════════════════════════════════════════

      // State fill (for hover/coloring)
      map.addLayer({
        id: 'states-fill',
        type: 'fill',
        source: 'india-states',
        paint: {
          'fill-color': buildFillColourExpression(typedStates, activeColourMode),
          'fill-opacity': [
            'interpolate', ['linear'], ['zoom'],
            3, 0.02,
            4.5, 0.05,
            5.5, 0.15,
            7, 0.12,
            9, 0.05,
          ],
        },
      });

      // State border glow
      map.addLayer({
        id: 'states-border-glow',
        type: 'line',
        source: 'india-states',
        paint: {
          'line-color': buildGlowColourExpression(typedStates, activeColourMode),
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            4, 6,
            6, 8,
            8, 6,
          ],
          'line-blur': 6,
          'line-opacity': [
            'interpolate', ['linear'], ['zoom'],
            3, 0,
            4.5, 0,
            5, 0.3,
            6, 0.5,
            7.5, 0.4,
            9, 0.15,
            10, 0.08,
          ],
        },
      });

      // State borders (crisp line)
      map.addLayer({
        id: 'states-border',
        type: 'line',
        source: 'india-states',
        paint: {
          'line-color': buildBorderColourExpression(typedStates, activeColourMode),
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            4, 0.8,
            6, 1.8,
            8, 1.2,
            10, 0.6,
          ],
          'line-opacity': [
            'interpolate', ['linear'], ['zoom'],
            3, 0,
            4.5, 0,
            5, 0.5,
            6, 0.8,
            7.5, 0.6,
            9, 0.25,
            10, 0.1,
          ],
        },
      });

      // State labels
      map.addLayer({
        id: 'states-labels',
        type: 'symbol',
        source: 'india-states',
        layout: {
          'text-field': ['get', 'st_nm'],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            4, 8,
            6, 12,
            8, 14,
          ],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.08,
          'text-max-width': 8,
          'text-allow-overlap': false,
          'text-ignore-placement': false,
          'symbol-sort-key': ['get', 'st_code'],
        },
        paint: {
          'text-color': '#C8CAD0',
          'text-halo-color': 'rgba(13, 15, 20, 0.9)',
          'text-halo-width': 1.5,
          'text-opacity': [
            'interpolate', ['linear'], ['zoom'],
            3, 0,
            4.5, 0,
            5, 0.5,
            5.5, 0.8,
            7, 0.8,
            8, 0.3,
            9, 0,
          ],
        },
      });

      // ═══════════════════════════════════════════════════════
      // LAYER GROUP 3: District fills + borders + labels
      // Fade in at zoom ~7, fully visible at zoom ~8+
      // ═══════════════════════════════════════════════════════

      // District fill (subtle differentiation)
      map.addLayer({
        id: 'districts-fill',
        type: 'fill',
        source: 'india-districts',
        paint: {
          'fill-color': 'rgba(255, 255, 255, 0.03)',
          'fill-opacity': [
            'interpolate', ['linear'], ['zoom'],
            6.5, 0,
            7.5, 0.3,
            8.5, 0.5,
          ],
        },
      });

      // District border glow (subtle outer glow)
      map.addLayer({
        id: 'districts-border-glow',
        type: 'line',
        source: 'india-districts',
        paint: {
          'line-color': buildDistrictGlowColourExpression(typedStates, activeColourMode),
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            7, 1,
            8, 2,
            10, 2.5,
          ],
          'line-blur': 3,
          'line-opacity': [
            'interpolate', ['linear'], ['zoom'],
            6.5, 0,
            7, 0,
            7.5, 0.15,
            8, 0.3,
            9, 0.4,
          ],
        },
      });

      // District border crisp lines
      map.addLayer({
        id: 'districts-border',
        type: 'line',
        source: 'india-districts',
        paint: {
          'line-color': buildDistrictBorderColourExpression(typedStates, activeColourMode),
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            7, 0.3,
            8, 0.6,
            9, 0.9,
            11, 1.2,
          ],
          'line-dasharray': [3, 2],
          'line-opacity': [
            'interpolate', ['linear'], ['zoom'],
            6.5, 0,
            7, 0,
            7.5, 0.3,
            8, 0.5,
            9, 0.65,
          ],
        },
      });

      // District labels — individual district names!
      map.addLayer({
        id: 'districts-labels',
        type: 'symbol',
        source: 'india-districts',
        layout: {
          'text-field': ['get', 'district'],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            7, 7,
            8, 9,
            9, 10,
            10, 12,
          ],
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-letter-spacing': 0.04,
          'text-max-width': 7,
          'text-allow-overlap': false,
          'text-ignore-placement': false,
        },
        paint: {
          'text-color': 'rgba(180, 195, 220, 0.85)',
          'text-halo-color': 'rgba(13, 15, 20, 0.85)',
          'text-halo-width': 1.2,
          'text-opacity': [
            'interpolate', ['linear'], ['zoom'],
            7, 0,
            7.5, 0,
            8, 0.4,
            8.5, 0.7,
            9, 0.85,
          ],
        },
      });

      // Evaluate district visibility after all layers are added
      setTimeout(() => {
        evaluateDistrictVisibility();
      }, 500);
    });

    // Wire district visibility to map movement and zoom
    map.on('moveend', onMapMove);
    map.on('zoomend', onMapMove);

    // ─── Hover interactions (state-level) ───
    let hoveredId: number | null = null;

    map.on('mousemove', 'states-fill', (e) => {
      if (e.features && e.features.length > 0) {
        map.getCanvas().style.cursor = 'pointer';

        // Clear previous hover
        if (hoveredId !== null) {
          map.setFeatureState(
            { source: 'india-states', id: hoveredId },
            { hover: false }
          );
        }

        hoveredId = e.features[0].id as number;
        map.setFeatureState(
          { source: 'india-states', id: hoveredId },
          { hover: true }
        );

        const geoName = e.features[0].properties?.st_nm || '';
        const stateInfo = findStateByGeoName(geoName);
        setHoveredState(stateInfo?.id || null);

        // Show tooltip
        if (stateInfo && popupRef.current) {
          const isElection = stateInfo.heat_colour === 'blue';
          const isDisputed = stateInfo.heat_colour === 'purple';
          const heatColour = getHeatColour(stateInfo.heat_score, { isElection, isDisputed });
          const html = `
            <div class="state-tooltip-name">${stateInfo.name}</div>
            <div class="state-tooltip-meta">${stateInfo.capital} · ${stateInfo.type === 'ut' ? 'Union Territory' : 'State'}</div>
            <div class="state-tooltip-heat">
              <span class="state-tooltip-heat-dot" style="background:${heatColour.hex}"></span>
              <span class="state-tooltip-heat-label" style="color:${heatColour.hex}">${heatColour.label.toUpperCase()} · ${stateInfo.heat_score}</span>
            </div>
          `;
          popupRef.current.setLngLat(e.lngLat).setHTML(html).addTo(map);
        }
      }
    });

    map.on('mouseleave', 'states-fill', () => {
      map.getCanvas().style.cursor = '';
      if (hoveredId !== null) {
        map.setFeatureState(
          { source: 'india-states', id: hoveredId },
          { hover: false }
        );
      }
      hoveredId = null;
      setHoveredState(null);
      popupRef.current?.remove();
    });

    // ─── Click interaction ───
    map.on('click', 'states-fill', (e) => {
      if (e.features && e.features.length > 0) {
        const geoName = e.features[0].properties?.st_nm || '';
        const stateInfo = findStateByGeoName(geoName);
        if (stateInfo) {
          selectState(stateInfo);
          popupRef.current?.remove();

          // Fly to state at a zoom level where districts become visible
          map.flyTo({
            center: stateInfo.centroid as [number, number],
            zoom: 7.5,
            duration: 1200,
            essential: true,
          });
        }
      }
    });

    // ─── Track zoom & cursor ───
    map.on('zoom', () => {
      setZoomLevel(map.getZoom());
    });

    map.on('mousemove', (e) => {
      setCursorPosition({
        lat: parseFloat(e.lngLat.lat.toFixed(4)),
        lng: parseFloat(e.lngLat.lng.toFixed(4)),
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update colours when mode changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    try {
      if (map.getLayer('states-fill')) {
        map.setPaintProperty(
          'states-fill',
          'fill-color',
          buildFillColourExpression(typedStates, activeColourMode)
        );
      }
      if (map.getLayer('states-border')) {
        map.setPaintProperty(
          'states-border',
          'line-color',
          buildBorderColourExpression(typedStates, activeColourMode)
        );
      }
      if (map.getLayer('states-border-glow')) {
        map.setPaintProperty(
          'states-border-glow',
          'line-color',
          buildGlowColourExpression(typedStates, activeColourMode)
        );
      }
      // Update district colours to match parent state colours
      if (map.getLayer('districts-border')) {
        map.setPaintProperty(
          'districts-border',
          'line-color',
          buildDistrictBorderColourExpression(typedStates, activeColourMode)
        );
      }
      if (map.getLayer('districts-border-glow')) {
        map.setPaintProperty(
          'districts-border-glow',
          'line-color',
          buildDistrictGlowColourExpression(typedStates, activeColourMode)
        );
      }
    } catch {
      // Style not ready yet, will update on next render
    }
  }, [activeColourMode, typedStates]);

  // Fly back to India when state is deselected
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!selectedState) {
      map.flyTo({
        center: INDIA_CENTER,
        zoom: INDIA_ZOOM,
        duration: 1000,
        essential: true,
      });
    }
  }, [selectedState]);

  return <div ref={mapContainer} className="map-container" id="bharat-map" />;
}
