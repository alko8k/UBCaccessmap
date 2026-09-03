import type { FilterState } from "../../lib/filters.ts";

const checkboxFilters: Array<{ key: keyof FilterState; label: string }> = [
  { key: "stepFreeBuildingAccess", label: "Step-free building" },
  { key: "accessibleStall", label: "Accessible stall" },
  { key: "grabBars", label: "Grab bars" },
  { key: "automaticDoor", label: "Automatic door" },
  { key: "elevatorAccess", label: "Elevator access" },
  { key: "changingTable", label: "Changing table" },
];

type Props = {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
};

export function FilterBar({ filters, onChange, resultCount }: Props) {
  return (
    <form className="filter-bar" onSubmit={(event) => event.preventDefault()}>
      <div className="filter-search">
        <label htmlFor="campus-search">Search campus</label>
        <input
          id="campus-search"
          type="search"
          value={filters.q}
          placeholder="Building name or code, e.g. Nest or IBLC"
          onChange={(event) => onChange({ ...filters, q: event.target.value })}
        />
      </div>

      <div className="filter-selects">
        <label>
          Community rank
          <select
            value={filters.rank}
            onChange={(event) =>
              onChange({ ...filters, rank: event.target.value as FilterState["rank"] })
            }
          >
            <option value="">Any rank</option>
            <option value="S">S</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </label>
        <label>
          Room type
          <select
            value={filters.genderType}
            onChange={(event) =>
              onChange({
                ...filters,
                genderType: event.target.value as FilterState["genderType"],
              })
            }
          >
            <option value="">Any type</option>
            <option value="all_gender">All-gender</option>
            <option value="private">Private / single occupancy</option>
            <option value="womens">Women’s</option>
            <option value="mens">Men’s</option>
          </select>
        </label>
      </div>

      <fieldset>
        <legend>Accessibility facts</legend>
        <p className="hint">These filters use documented attributes, not community scores.</p>
        <div className="filter-checks">
          {checkboxFilters.map((filter) => (
            <label key={filter.key} className="check">
              <input
                type="checkbox"
                checked={Boolean(filters[filter.key])}
                onChange={(event) =>
                  onChange({ ...filters, [filter.key]: event.target.checked })
                }
              />
              {filter.label}
            </label>
          ))}
        </div>
      </fieldset>

      <p className="result-count" aria-live="polite">
        {resultCount} matching washroom{resultCount === 1 ? "" : "s"}
      </p>
    </form>
  );
}
