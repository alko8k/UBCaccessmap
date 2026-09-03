import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { fetchMap } from "../api/client.ts";
import { AuthDialog } from "../features/auth/AuthDialog.tsx";
import { CampusMap } from "../features/map/CampusMap.tsx";
import { FilterBar } from "../features/map/FilterBar.tsx";
import { DetailPanel } from "../features/washrooms/DetailPanel.tsx";
import { genderLabel, filtersFromSearch, mapQueryString, searchFromFilters } from "../lib/filters.ts";

export function HomePage() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => filtersFromSearch(params.toString()), [params]);
  const selectedId = params.get("washroom") ?? undefined;
  const [authOpen, setAuthOpen] = useState(false);
  const [locateRequest, setLocateRequest] = useState(0);
  const [view, setView] = useState<"map" | "list">("map");

  const mapQuery = useQuery({
    queryKey: ["map", mapQueryString(filters)],
    queryFn: () => fetchMap(mapQueryString(filters)),
  });

  function updateFilters(next: typeof filters) {
    const search = new URLSearchParams(searchFromFilters(next));
    if (selectedId) {
      search.set("washroom", selectedId);
    }
    setParams(search);
  }

  function selectWashroom(id: string) {
    const search = new URLSearchParams(searchFromFilters(filters));
    search.set("washroom", id);
    setParams(search);
  }

  function clearWashroom() {
    setParams(new URLSearchParams(searchFromFilters(filters)));
  }

  const washrooms = mapQuery.data?.washrooms ?? [];
  const buildings = mapQuery.data?.buildings ?? [];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#results">
        Skip to results
      </a>
      <aside className="sidebar">
        <FilterBar filters={filters} onChange={updateFilters} resultCount={washrooms.length} />
        <div className="view-toggle">
          <button type="button" aria-pressed={view === "map"} onClick={() => setView("map")}>
            Map
          </button>
          <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>
            List
          </button>
          <button type="button" onClick={() => setLocateRequest((value) => value + 1)}>
            Use my location
          </button>
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
          onSelectWashroom={selectWashroom}
          locateRequest={locateRequest}
        />
        {selectedId && (
          <DetailPanel
            washroomId={selectedId}
            onClose={clearWashroom}
            onNeedAuth={() => setAuthOpen(true)}
          />
        )}
      </section>

      <AuthDialog
        open={authOpen || params.get("signin") === "1"}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}
