import { describe, expect, it } from "vitest";
import { defaultFilters, filtersFromSearch, searchFromFilters } from "./filters.ts";

describe("filter URL state", () => {
  it("round-trips selected filters through the query string", () => {
    const filters = {
      ...defaultFilters,
      q: "nest",
      accessibleStall: true,
      genderType: "all_gender" as const,
    };

    expect(filtersFromSearch(searchFromFilters(filters))).toEqual(filters);
  });

  it("treats an empty search as the default filter set", () => {
    expect(filtersFromSearch("")).toEqual(defaultFilters);
  });
});
