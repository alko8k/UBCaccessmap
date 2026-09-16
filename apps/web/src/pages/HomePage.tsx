import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { fetchMap } from "../api/client.ts";
import { AuthDialog } from "../features/auth/AuthDialog.tsx";
import { BuildingPanel } from "../features/buildings/BuildingPanel.tsx";
import { CampusMap } from "../features/map/CampusMap.tsx";
import { FilterBar } from "../features/map/FilterBar.tsx";
import { DetailPanel } from "../features/washrooms/DetailPanel.tsx";
import { genderLabel, filtersFromSearch, mapQueryString, searchFromFilters } from "../lib/filters.ts";

export function HomePage() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => filtersFromSearch(params.toString()), [params]);
  const selectedId = params.get("washroom") ?? undefined;
  const selectedBuildingId = params.get("building") ?? undefined;
  const [authOpen, setAuthOpen] = useState(false);
  const [locateRequest, setLocateRequest] = useState(0);
  const [view, setView] = useState<"map" | "list">("map");

  const mapQuery = useQuery({
    queryKey: ["map", mapQueryString(filters)],
    queryFn: () => fetchMap(mapQueryString(filters)),
  });

  function updateFilters(next: typeof filters) {
    const search = new URLSearchParams(searchFromFilters(next));
    if (selectedBuildingId) {
      search.set("building", selectedBuildingId);
    }
    if (selectedId) {
      search.set("washroom", selectedId);
    }
    setParams(search);
  }

  function selectWashroom(id: string) {
    const search = new URLSearchParams(searchFromFilters(filters));
    if (selectedBuildingId) {
      search.set("building", selectedBuildingId);
    }
    search.set("washroom", id);
    setParams(search);
  }

  function selectBuilding(id: string) {
    const search = new URLSearchParams(searchFromFilters(filters));
    search.set("building", id);
    setParams(search);
  }

  /** Closing a washroom steps back to its building rather than all the way out. */
  function clearWashroom() {
    const search = new URLSearchParams(searchFromFilters(filters));
    if (selectedBuildingId) {
      search.set("building", selectedBuildingId);
    }
    setParams(search);
  }

  function clearBuilding() {
    setParams(new URLSearchParams(searchFromFilters(filters)));
  }

  const washrooms = mapQuery.data?.washrooms ?? [];
  const buildings = mapQuery.data?.buildings ?? [];
  const selectedBuilding = buildings.find((building) => building.id === selectedBuildingId);
  const mappedBuildings = buildings.filter((building) => building.washroomCount > 0).length;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#results">
        Skip to results
      </a>
      <aside className="sidebar">
        <FilterBar filters={filters} onChange={updateFilters} />

        {buildings.length > 0 && (
          <div className="coverage">
            <div className="coverage-head">
              <span className="group-label">Coverage</span>
              <strong>
                {mappedBuildings} / {buildings.length}
              </strong>
            </div>
            <div
              className="tier-meter"
              role="progressbar"
              aria-label="Buildings shown that have mapped washrooms"
              aria-valuemin={0}
              aria-valuemax={buildings.length}
              aria-valuenow={mappedBuildings}
            >
              <i style={{ width: `${(mappedBuildings / buildings.length) * 100}%` }} />
            </div>
            <p className="hint">Buildings in view with at least one mapped washroom.</p>
          </div>
        )}

        <div className="results-head">
          <p className="result-count" aria-live="polite">
            {washrooms.length} washroom{washrooms.length === 1 ? "" : "s"}
          </p>
          <div className="view-toggle" role="group" aria-label="View">
            <button type="button" aria-pressed={view === "map"} onClick={() => setView("map")}>
              Map
            </button>
            <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>
              List
            </button>
            <button type="button" onClick={() => setLocateRequest((value) => value + 1)}>
              Locate me
            </button>
          </div>
        </div>

        <div id="results">
          {mapQuery.isLoading && <p>Loading campus data…</p>}
          {mapQuery.isError && <p role="alert">Could not load the map. Is the API running?</p>}
          {mapQuery.isSuccess && washrooms.length === 0 && (
            <p>No curated washrooms match those filters.</p>
          )}
          <ul className="result-list">
            {washrooms.map((washroom) => (
              <li key={washroom.id}>
                <button
                  type="button"
                  className={washroom.id === selectedId ? "selected" : undefined}
                  onClick={() => selectWashroom(washroom.id)}
                >
                  <span className={`rank rank-${washroom.rankLetter ?? "none"}`}>
                    {washroom.rankLetter ?? "—"}
                  </span>
                  <span>
                    <strong>{washroom.name}</strong>
                    <em>
                      {washroom.buildingName} · Floor {washroom.floor} · {genderLabel(washroom.genderType)}
                    </em>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className={view === "map" ? "map-area" : "map-area list-only"}>
        <CampusMap
          buildings={buildings}
          washrooms={washrooms}
          selectedWashroomId={selectedId}
          selectedBuildingId={selectedBuildingId}
          onSelectWashroom={selectWashroom}
          onSelectBuilding={selectBuilding}
          locateRequest={locateRequest}
        />
        {selectedId ? (
          <DetailPanel
            washroomId={selectedId}
            onClose={clearWashroom}
            onNeedAuth={() => setAuthOpen(true)}
          />
        ) : (
          selectedBuilding && (
            <BuildingPanel
              building={selectedBuilding}
              washrooms={washrooms.filter(
                (washroom) => washroom.buildingId === selectedBuilding.id,
              )}
              selectedWashroomId={selectedId}
              onSelectWashroom={selectWashroom}
              onClose={clearBuilding}
            />
          )
        )}
      </section>

      <AuthDialog
        open={authOpen || params.get("signin") === "1"}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}
