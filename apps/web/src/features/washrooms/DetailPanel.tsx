import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RATING_TAGS, type UpsertRatingInput } from "@ubc-access-map/shared";
import { createReport, fetchWashroom, upsertRating } from "../../api/client.ts";
import { factLabel, genderLabel } from "../../lib/filters.ts";
import { useAuth } from "../../lib/auth.tsx";

const attributeLabels: Record<string, string> = {
  stepFreeBuildingAccess: "Step-free building access",
  accessibleStall: "Accessible stall",
  grabBars: "Grab bars",
  transferSpace: "Transfer space",
  accessibleSink: "Accessible sink",
  automaticDoor: "Automatic / power door",
  changingTable: "Changing table",
  elevatorAccess: "Elevator to this floor",
};

type Props = {
  washroomId: string;
  onClose: () => void;
  onNeedAuth: () => void;
};

export function DetailPanel({ washroomId, onClose, onNeedAuth }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const detailQuery = useQuery({
    queryKey: ["washroom", washroomId],
    queryFn: () => fetchWashroom(washroomId),
  });
  const [rating, setRating] = useState<UpsertRatingInput>({
    cleanliness: 3,
    privacy: 3,
    availability: 3,
    overall: 3,
    tags: [],
  });
  const [reportMessage, setReportMessage] = useState("");
  const [reportType, setReportType] = useState("incorrect_access");
  const [notice, setNotice] = useState<string | null>(null);

  const vote = useMutation({
    mutationFn: (input: UpsertRatingInput) => upsertRating(washroomId, input),
    onSuccess: async () => {
      setNotice("Saved. You can update this vote any time.");
      await queryClient.invalidateQueries({ queryKey: ["washroom", washroomId] });
      await queryClient.invalidateQueries({ queryKey: ["map"] });
    },
  });

  const report = useMutation({
    mutationFn: () => createReport(washroomId, reportType, reportMessage),
    onSuccess: () => {
      setNotice("Thanks. A moderator will review that correction.");
      setReportMessage("");
    },
  });

  const washroom = detailQuery.data;

  return (
    <section className="panel" aria-labelledby="washroom-heading">
      <div className="panel-head">
        <button type="button" className="text-btn" onClick={onClose}>
          Close details
        </button>
      </div>

      {detailQuery.isLoading && <p>Loading washroom details…</p>}
      {detailQuery.isError && <p role="alert">Could not load that washroom.</p>}

      {washroom && (
        <>
          <p className="eyebrow">
            {washroom.buildingName}
            {washroom.buildingCode ? ` · ${washroom.buildingCode}` : ""}
          </p>
          <h2 id="washroom-heading">{washroom.name}</h2>
          <p>
            Floor {washroom.floor} · {genderLabel(washroom.genderType)}
          </p>
          <p className="directions">{washroom.directions}</p>
          {washroom.hours && <p>Hours: {washroom.hours}</p>}

          <div className="rank-box">
            <strong className={`rank rank-${washroom.rankLetter ?? "none"}`}>
              {washroom.rankLetter ?? "—"}
            </strong>
            <div>
              <p>Community experience rank</p>
              <p>
                {washroom.voteCount} vote{washroom.voteCount === 1 ? "" : "s"} · {washroom.confidence}{" "}
                confidence
              </p>
              <p className="hint">
                Rank is Bayesian-weighted so a single vote cannot produce an S. It is not an
                accessibility rating.
              </p>
            </div>
          </div>

          <h3>Accessibility facts</h3>
          <ul className="fact-list">
            {washroom.attributes.map((attribute) => (
              <li key={attribute.key}>
                <span>{attributeLabels[attribute.key] ?? attribute.key}</span>
                <b data-state={attribute.value}>{factLabel(attribute.value)}</b>
              </li>
            ))}
          </ul>
          <p className="hint">
            Source: {washroom.attributeSource ?? "Not recorded"}
            {washroom.lastVerifiedAt
              ? ` · last verified ${new Date(washroom.lastVerifiedAt).toLocaleDateString()}`
              : ""}
            . Unknown means we have not confirmed it.
          </p>

          <h3>Vote</h3>
          {user ? (
            <form
              className="vote-form"
              onSubmit={(event) => {
                event.preventDefault();
                vote.mutate(rating);
              }}
            >
              {(["cleanliness", "privacy", "availability", "overall"] as const).map((field) => (
                <label key={field}>
                  {field}
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={rating[field]}
                    onChange={(event) =>
                      setRating({ ...rating, [field]: Number(event.target.value) })
                    }
                  />
                  <span>{rating[field]}</span>
                </label>
              ))}
              <fieldset>
                <legend>Optional tags</legend>
                <div className="filter-checks">
                  {RATING_TAGS.map((tag) => (
                    <label key={tag} className="check">
                      <input
                        type="checkbox"
                        checked={rating.tags.includes(tag)}
                        onChange={(event) => {
                          setRating({
                            ...rating,
                            tags: event.target.checked
                              ? [...rating.tags, tag]
                              : rating.tags.filter((value) => value !== tag),
                          });
                        }}
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              </fieldset>
              <button type="submit" disabled={vote.isPending}>
                {washroom.viewerRating ? "Update my vote" : "Submit vote"}
              </button>
            </form>
          ) : (
            <p>
              <button type="button" onClick={onNeedAuth}>
                Verify a UBC email to vote
              </button>
            </p>
          )}

          <h3>Report a correction</h3>
          <form
            className="report-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!user) {
                onNeedAuth();
                return;
              }
              report.mutate();
            }}
          >
            <label>
              What is wrong?
              <select value={reportType} onChange={(event) => setReportType(event.target.value)}>
                <option value="incorrect_access">Accessibility fact is wrong</option>
                <option value="closed">Closed or unavailable</option>
                <option value="directions">Directions need an update</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Details
              <textarea
                required
                minLength={8}
                value={reportMessage}
                onChange={(event) => setReportMessage(event.target.value)}
              />
            </label>
            <button type="submit">Send report</button>
          </form>
          {notice && <p role="status">{notice}</p>}
        </>
      )}
    </section>
  );
}
