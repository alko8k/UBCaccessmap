import { aggregateScores } from "@ubc-access-map/shared";
import type { PrismaClient } from "@prisma/client";

export async function refreshWashroomRank(prisma: PrismaClient, washroomId: string) {
  const ratings = await prisma.rating.findMany({
    where: { washroomId },
    select: {
      cleanliness: true,
      privacy: true,
      availability: true,
      overall: true,
    },
  });

  const rank = aggregateScores(ratings);

  return prisma.washroom.update({
    where: { id: washroomId },
    data: {
      voteCount: rank.voteCount,
      bayesianScore: rank.bayesianScore,
      rankLetter: rank.rankLetter,
    },
  });
}
