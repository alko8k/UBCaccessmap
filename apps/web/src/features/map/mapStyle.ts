import type { StyleSpecification } from "maplibre-gl";

const TILES = "https://tiles.openfreemap.org/planet";
const GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";

/**
 * A deliberately sparse dark basemap.
 *
 * We used to load OpenFreeMap's `positron` style and invert the canvas in CSS
 * to darken it, which meant every overlay colour had to be pre-inverted too.
 * Drawing our own style instead keeps the rank colours honest and strips the
 * basemap down to ground, water, green space, roads, and building shapes — no
 * POIs, no road names, no boundaries. The only text on the map is ours.
 */
/** Shared with the overlay layers so the basemap and our features agree. */
export const MAP_INK = "#08070c";

export const darkCampusStyle: StyleSpecification = {
  version: 8,
  glyphs: GLYPHS,
  sources: {
    openmaptiles: { type: "vector", url: TILES },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#08070c" },
    },
    {
      id: "green",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "park",
      paint: { "fill-color": "#0e1410" },
    },
    {
      id: "water",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "water",
      filter: ["!=", ["get", "brunnel"], "tunnel"],
      paint: { "fill-color": "#0b1017" },
    },
    {
      id: "buildings",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "building",
      minzoom: 13,
      paint: { "fill-color": "#15121f" },
    },
    {
      id: "roads-minor",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 12,
      filter: ["match", ["get", "class"], ["minor", "service", "track", "path"], true, false],
      paint: {
        "line-color": "#1b1729",
        "line-width": ["interpolate", ["linear"], ["zoom"], 12, 0.5, 18, 6],
      },
    },
    {
      id: "roads-major",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: [
        "match",
        ["get", "class"],
        ["motorway", "trunk", "primary", "secondary", "tertiary"],
        true,
        false,
      ],
      paint: {
        "line-color": "#251f38",
        "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.8, 18, 10],
      },
    },
  ],
};
