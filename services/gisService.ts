import { GeoPoint, GisFeature } from '../types';

// Helper to calculate Geodesic Distance (Haversine Formula)
// Returns distance in meters
export const calculateGeodesicDistance = (p1: GeoPoint, p2: GeoPoint): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (p1.lat * Math.PI) / 180;
  const φ2 = (p2.lat * Math.PI) / 180;
  const Δφ = ((p2.lat - p1.lat) * Math.PI) / 180;
  const Δλ = ((p2.lng - p1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return parseFloat((R * c).toFixed(2));
};

// Calculate Area of Polygon (Shoelace Formula on projected coords)
// Returns area in square meters
export const calculatePolygonArea = (points: GeoPoint[]): number => {
  if (points.length < 3) return 0;

  const R = 6371e3; // Earth Radius
  const centerLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  
  // Convert Lat/Lng to approx meters (Equirectangular projection relative to center)
  // This is sufficient for small areas like substations or city blocks
  const meters = points.map(p => {
    const x = (p.lng - points[0].lng) * (Math.PI / 180) * R * Math.cos(centerLat * (Math.PI / 180));
    const y = (p.lat - points[0].lat) * (Math.PI / 180) * R;
    return { x, y };
  });

  // Shoelace Formula
  let area = 0;
  for (let i = 0; i < meters.length; i++) {
    const j = (i + 1) % meters.length;
    area += meters[i].x * meters[j].y;
    area -= meters[j].x * meters[i].y;
  }
  
  return parseFloat((Math.abs(area) / 2).toFixed(2));
};

// Real Async Elevation Service (Simulates SRTM/LiDAR API)
export const getElevationAsync = async (lat: number, lng: number): Promise<number> => {
  // In production, this would be: await fetch(`https://api.opentopodata.org/v1/srtm30m?locations=${lat},${lng}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock logic: generate a somewhat consistent elevation based on coords
      // Simulating a hilly terrain
      const baseAlt = 760; 
      const variation = (Math.sin(lat * 5000) * 20) + (Math.cos(lng * 5000) * 15);
      resolve(parseFloat((baseAlt + variation).toFixed(1)));
    }, 600); // Simulate network latency
  });
};

// Legacy sync helper for mock initialization only
export const getElevationSync = (lat: number, lng: number): number => {
  const baseAlt = 760; 
  const variation = (Math.sin(lat * 5000) * 20) + (Math.cos(lng * 5000) * 15);
  return parseFloat((baseAlt + variation).toFixed(1));
};

export const calculateSpanMetrics = (p1: GeoPoint, p2: GeoPoint) => {
  const horizontalDist = calculateGeodesicDistance(p1, p2);
  
  // Use existing altitude if available, otherwise fallback to sync mock
  const ele1 = p1.alt ?? getElevationSync(p1.lat, p1.lng);
  const ele2 = p2.alt ?? getElevationSync(p2.lat, p2.lng);
  const heightDiff = Math.abs(ele2 - ele1);
  
  // 3D Distance (Real conductor path approximation)
  const realDist = Math.sqrt(Math.pow(horizontalDist, 2) + Math.pow(heightDiff, 2));

  return {
    horizontalDist,
    heightDiff: parseFloat(heightDiff.toFixed(2)),
    realDist: parseFloat(realDist.toFixed(2)),
    isCriticalSpan: horizontalDist > 80 // Normative check example
  };
};

export const calculateSpanMetricsAsync = async (p1: GeoPoint, p2: GeoPoint) => {
  const horizontalDist = calculateGeodesicDistance(p1, p2);
  
  // Fetch elevation if missing or to confirm accuracy
  const ele1 = p1.alt ?? await getElevationAsync(p1.lat, p1.lng);
  const ele2 = p2.alt ?? await getElevationAsync(p2.lat, p2.lng);
  
  const heightDiff = Math.abs(ele2 - ele1);
  
  // 3D Distance (Real conductor path approximation)
  const realDist = Math.sqrt(Math.pow(horizontalDist, 2) + Math.pow(heightDiff, 2));

  return {
    horizontalDist,
    heightDiff: parseFloat(heightDiff.toFixed(2)),
    realDist: parseFloat(realDist.toFixed(2)),
    isCriticalSpan: horizontalDist > 80,
    elevations: [ele1, ele2]
  };
};

// Enrich feature with SRTM data
export const enrichFeatureWithElevation = async (feature: GisFeature): Promise<GisFeature> => {
  if (feature.type === 'POLE' && !Array.isArray(feature.coordinates)) {
    const coords = feature.coordinates as GeoPoint;
    const altitude = await getElevationAsync(coords.lat, coords.lng);
    return {
      ...feature,
      coordinates: { ...coords, alt: altitude }
    };
  }
  return feature;
};

// Mock Import Parsers
export const parseImportFile = async (type: 'DXF' | 'KML' | 'SHP', fileName: string): Promise<GisFeature[]> => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      // Return some mock features around a central point
      const centerLat = -23.5878;
      const centerLng = -46.6590;
      const features: GisFeature[] = [];

      for (let i = 0; i < 5; i++) {
        const lat = centerLat + (Math.random() - 0.5) * 0.005;
        const lng = centerLng + (Math.random() - 0.5) * 0.005;
        
        // Auto-enrich with elevation during import simulation
        const alt = await getElevationAsync(lat, lng);

        features.push({
          id: `imp-${type}-${Date.now()}-${i}`,
          type: 'POLE',
          coordinates: { lat, lng, alt },
          properties: { importedFrom: fileName, layer: 'Imported', autoElevated: true },
          layer: 'PROJECTED',
          source: type,
          audit: {
            userId: 'SYSTEM',
            timestamp: new Date().toISOString(),
            action: 'IMPORT'
          }
        });
      }
      resolve(features);
    }, 1500); // Simulate processing time
  });
};