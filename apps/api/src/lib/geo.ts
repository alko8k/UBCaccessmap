type Position = [number, number];

function walkCoordinates(value: unknown, visit: (position: Position) => void) {
  if (!Array.isArray(value) || value.length === 0) {
    return;
  }

  if (typeof value[0] === "number" && typeof value[1] === "number") {
    visit([value[0], value[1]]);
    return;
  }

  for (const child of value) {
    walkCoordinates(child, visit);
  }
}

export function centroidOfGeometry(geometry: { coordinates?: unknown } | null | undefined): {
  lat: number;
  lng: number;
} | null {
  const points: Position[] = [];
  walkCoordinates(geometry?.coordinates, (position) => points.push(position));

  if (points.length === 0) {
    return null;
  }

  const lng = points.reduce((sum, point) => sum + point[0], 0) / points.length;
  const lat = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  return { lat, lng };
}

export function rectangleFootprint(
  west: number,
  south: number,
  east: number,
  north: number,
) {
  return {
    type: "Polygon" as const,
    coordinates: [
      [
        [west, south],
        [east, south],
        [east, north],
        [west, north],
        [west, south],
      ],
    ],
  };
}
