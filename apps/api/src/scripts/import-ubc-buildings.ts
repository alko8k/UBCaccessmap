import "dotenv/config";
import type { Prisma } from "@prisma/client";
import { BUILDING_SOURCE_URL } from "@ubc-access-map/shared";
import { loadEnv } from "../env.ts";
import { centroidOfGeometry } from "../lib/geo.ts";
import { prisma } from "../prisma.ts";

type BuildingFeature = {
  type: "Feature";
  properties: {
    BLDG_UID?: string;
    NAME?: string;
    BLDG_CODE?: string | null;
    BLDG_USAGE?: string | null;
    BLDG_STATE?: string | null;
  };
  geometry: {
    type: string;
    coordinates: unknown;
  } | null;
};

type BuildingCollection = {
  features: BuildingFeature[];
};

async function importBuildings() {
  loadEnv();
  const response = await fetch(BUILDING_SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to download UBC buildings: ${response.status}`);
  }

  const collection = (await response.json()) as BuildingCollection;
  let upserted = 0;

  for (const feature of collection.features) {
    const sourceId = feature.properties.BLDG_UID;
    const name = feature.properties.NAME;
    const geometry = feature.geometry;
    if (!sourceId || !name || !geometry) {
      continue;
    }

    if (feature.properties.BLDG_STATE && feature.properties.BLDG_STATE !== "Occupied") {
      continue;
    }

    const centroid = centroidOfGeometry(geometry);
    if (!centroid) {
      continue;
    }

    await prisma.building.upsert({
      where: { sourceId },
      update: {
        name,
        code: feature.properties.BLDG_CODE ?? undefined,
        centroidLat: centroid.lat,
        centroidLng: centroid.lng,
        footprint: geometry as Prisma.InputJsonValue,
        sourceUrl: BUILDING_SOURCE_URL,
        importedAt: new Date(),
      },
      create: {
        sourceId,
        name,
        code: feature.properties.BLDG_CODE,
        centroidLat: centroid.lat,
        centroidLng: centroid.lng,
        footprint: geometry as Prisma.InputJsonValue,
        sourceUrl: BUILDING_SOURCE_URL,
        importedAt: new Date(),
      },
    });
    upserted += 1;
  }

  await prisma.dataImport.create({
    data: {
      sourceUrl: BUILDING_SOURCE_URL,
      featureCount: upserted,
    },
  });

  console.log(`Imported or updated ${upserted} UBC buildings.`);
}

importBuildings()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
