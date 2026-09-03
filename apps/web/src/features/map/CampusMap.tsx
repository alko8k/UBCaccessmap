import { useEffect, useRef } from "react";
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from "maplibre-gl";
import { UBC_CAMPUS, type BuildingSummary, type WashroomSummary } from "@ubc-access-map/shared";
import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  buildings: BuildingSummary[];
  washrooms: WashroomSummary[];
  selectedWashroomId?: string;
  onSelectWashroom: (id: string) => void;
  locateRequest: number;
};

const rankColor: Record<string, string> = {
  S: "#c9a227",
  A: "#1f7a4d",
  B: "#215a8e",
  C: "#b45309",
  D: "#6b7280",
};

export function CampusMap({
  buildings,
  washrooms,
  selectedWashroomId,
  onSelectWashroom,
  locateRequest,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onSelectRef = useRef(onSelectWashroom);

  useEffect(() => {
    onSelectRef.current = onSelectWashroom;
  }, [onSelectWashroom]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [UBC_CAMPUS.center.lng, UBC_CAMPUS.center.lat],
      zoom: UBC_CAMPUS.defaultZoom,
      maxBounds: [
        [UBC_CAMPUS.bounds.west - 0.02, UBC_CAMPUS.bounds.south - 0.02],
        [UBC_CAMPUS.bounds.east + 0.02, UBC_CAMPUS.bounds.north + 0.02],
      ],
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      "top-right",
    );

    map.on("load", () => {
      map.addSource("buildings", {
        type: "geojson",
        data: emptyCollection(),
      });
      map.addSource("washrooms", {
        type: "geojson",
        data: emptyCollection(),
      });

      map.addLayer({
        id: "building-fill",
        type: "fill",
        source: "buildings",
        paint: {
          "fill-color": "#1d4f73",
          "fill-opacity": 0.18,
        },
      });
      map.addLayer({
        id: "building-line",
        type: "line",
        source: "buildings",
        paint: {
          "line-color": "#16364f",
          "line-width": 1.2,
        },
      });
      map.addLayer({
        id: "washroom-dots",
        type: "circle",
        source: "washrooms",
        paint: {
          "circle-radius": ["case", ["==", ["get", "selected"], 1], 10, 7],
          "circle-color": ["get", "color"],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });
    });

    map.on("click", "washroom-dots", (event) => {
      const id = event.features?.[0]?.properties?.id;
      if (typeof id === "string") {
        onSelectRef.current(id);
      }
    });

    map.on("mouseenter", "washroom-dots", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "washroom-dots", () => {
      map.getCanvas().style.cursor = "";
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getSource("buildings")) {
      const handleLoad = () => updateSources(mapRef.current, buildings, washrooms, selectedWashroomId);
      map?.once("load", handleLoad);
      return;
    }

    updateSources(map, buildings, washrooms, selectedWashroomId);
  }, [buildings, washrooms, selectedWashroomId]);

  useEffect(() => {
    if (locateRequest === 0 || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      mapRef.current?.flyTo({
        center: [position.coords.longitude, position.coords.latitude],
        zoom: 16.5,
        essential: true,
      });
    });
  }, [locateRequest]);

  return (
    <div className="map-shell">
      <div ref={containerRef} className="map-canvas" role="application" aria-label="UBC Vancouver campus map" />
    </div>
  );
}

type Geometry = {
  type: string;
  coordinates: unknown;
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, string | number>;
    geometry: Geometry;
  }>;
};

function emptyCollection(): FeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

function updateSources(
  map: MapLibreMap | null,
  buildings: BuildingSummary[],
  washrooms: WashroomSummary[],
  selectedWashroomId?: string,
) {
  if (!map) return;
  const buildingSource = map.getSource("buildings") as GeoJSONSource | undefined;
  const washroomSource = map.getSource("washrooms") as GeoJSONSource | undefined;
  if (!buildingSource || !washroomSource) return;

  buildingSource.setData({
    type: "FeatureCollection",
    features: buildings.flatMap((building) => {
      const geometry = building.footprint as Geometry | null;
      if (!geometry || !("type" in geometry)) {
        return [];
      }
      return [
        {
          type: "Feature" as const,
          properties: { id: building.id, name: building.name },
          geometry,
        },
      ];
    }),
  });

  washroomSource.setData({
    type: "FeatureCollection",
    features: washrooms.map((washroom, index) => ({
      type: "Feature" as const,
      properties: {
        id: washroom.id,
        selected: washroom.id === selectedWashroomId ? 1 : 0,
        color: rankColor[washroom.rankLetter ?? ""] ?? "#334155",
      },
      geometry: {
        type: "Point",
        coordinates: [
          washroom.longitude + index * 0.00004,
          washroom.latitude + index * 0.00003,
        ],
      },
    })),
  });
}
