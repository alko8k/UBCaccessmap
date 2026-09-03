import type { Prisma } from "@prisma/client";
import {
  ACCESSIBILITY_KEYS,
  aggregateScores,
  type WashroomDetail,
  type WashroomSummary,
} from "@ubc-access-map/shared";

type WashroomWithRelations = Prisma.WashroomGetPayload<{
  include: {
    building: true;
    attributes: true;
    ratings: true;
  };
}>;

function attributeMap(washroom: WashroomWithRelations) {
  return washroom.attributes.map((attribute) => ({
    key: attribute.key as (typeof ACCESSIBILITY_KEYS)[number],
    value: attribute.value,
    source: attribute.source,
    confidence: attribute.confidence,
    lastVerifiedAt: attribute.lastVerifiedAt.toISOString(),
  }));
}

export function toWashroomSummary(washroom: WashroomWithRelations): WashroomSummary {
  const rank = aggregateScores(washroom.ratings);

  return {
    id: washroom.id,
    buildingId: washroom.buildingId,
    buildingName: washroom.building.name,
    buildingCode: washroom.building.code,
    name: washroom.name,
    floor: washroom.floor,
    directions: washroom.directions,
    genderType: washroom.genderType,
    hours: washroom.hours,
    latitude: washroom.building.centroidLat,
    longitude: washroom.building.centroidLng,
    voteCount: rank.voteCount,
    bayesianScore: rank.bayesianScore,
    rankLetter: rank.rankLetter,
    confidence: rank.confidence,
    attributes: attributeMap(washroom),
  };
}

export function toWashroomDetail(
  washroom: WashroomWithRelations,
  viewerUserId?: string,
): WashroomDetail {
  const summary = toWashroomSummary(washroom);
  const rank = aggregateScores(washroom.ratings);
  const viewer = washroom.ratings.find((rating) => rating.userId === viewerUserId);
  const newestAttribute = washroom.attributes
    .slice()
    .sort((left, right) => right.lastVerifiedAt.getTime() - left.lastVerifiedAt.getTime())[0];

  return {
    ...summary,
    buildingStepFreeAccess: washroom.building.stepFreeAccess,
    buildingHours: washroom.building.hours,
    lastVerifiedAt: newestAttribute?.lastVerifiedAt.toISOString() ?? null,
    attributeSource: newestAttribute?.source ?? null,
    breakdown: rank.breakdown,
    viewerRating: viewer
      ? {
          cleanliness: viewer.cleanliness,
          privacy: viewer.privacy,
          availability: viewer.availability,
          overall: viewer.overall,
          tags: viewer.tags.filter((tag): tag is NonNullable<WashroomDetail["viewerRating"]>["tags"][number] =>
            [
              "clean",
              "private",
              "usually-available",
              "well-stocked",
              "quiet",
              "busy",
              "needs-maintenance",
            ].includes(tag),
          ),
        }
      : null,
  };
}
