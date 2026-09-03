export const ALLOWED_EMAIL_DOMAINS = ["student.ubc.ca", "ubc.ca"] as const;

export const UBC_CAMPUS = {
  center: { lat: 49.2648, lng: -123.2515 },
  defaultZoom: 15.2,
  bounds: {
    west: -123.27,
    south: 49.24,
    east: -123.22,
    north: 49.28,
  },
} as const;

export const BUILDING_SOURCE_URL =
  "https://raw.githubusercontent.com/UBCGeodata/ubc-geospatial-opendata/master/ubcv/locations/geojson/ubcv_buildings.geojson";

export const ACCESSIBILITY_KEYS = [
  "stepFreeBuildingAccess",
  "accessibleStall",
  "grabBars",
  "transferSpace",
  "accessibleSink",
  "automaticDoor",
  "changingTable",
  "elevatorAccess",
] as const;

export const GENDER_TYPES = ["mens", "womens", "all_gender", "private"] as const;

export const RANK_LETTERS = ["S", "A", "B", "C", "D"] as const;

export const RATING_TAGS = [
  "clean",
  "private",
  "usually-available",
  "well-stocked",
  "quiet",
  "busy",
  "needs-maintenance",
] as const;
