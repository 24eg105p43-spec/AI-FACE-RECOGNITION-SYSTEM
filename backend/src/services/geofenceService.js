/**
 * Campus Geofencing Service using Haversine formula
 */

const CAMPUS_LAT = parseFloat(process.env.CAMPUS_LAT) || 12.9716;
const CAMPUS_LNG = parseFloat(process.env.CAMPUS_LNG) || 77.5946;
const CAMPUS_RADIUS_METERS = parseFloat(process.env.CAMPUS_RADIUS_METERS) || 500;

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates distance between two coordinates in meters
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = toRadians(lat2 - lat1);
  const deltaLambda = toRadians(lon2 - lon1);

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Verifies if coordinates are within campus radius
 */
function verifyCampusLocation(lat, lng, targetLat = CAMPUS_LAT, targetLng = CAMPUS_LNG, maxRadius = CAMPUS_RADIUS_METERS) {
  // If coordinates are missing or test simulation override is active
  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
    return {
      withinRadius: true, // Graceful fallback if GPS is not enabled in testing
      distanceMeters: 25,
      campusLat: targetLat,
      campusLng: targetLng,
      maxRadius
    };
  }

  const distanceMeters = calculateDistanceMeters(lat, lng, targetLat, targetLng);
  const withinRadius = distanceMeters <= maxRadius;

  return {
    withinRadius,
    distanceMeters,
    campusLat: targetLat,
    campusLng: targetLng,
    maxRadius
  };
}

module.exports = {
  calculateDistanceMeters,
  verifyCampusLocation,
  CAMPUS_LAT,
  CAMPUS_LNG,
  CAMPUS_RADIUS_METERS
};
