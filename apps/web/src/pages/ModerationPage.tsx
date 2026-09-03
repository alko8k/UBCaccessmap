import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchReports, updateReport } from "../api/client.ts";
import { useAuth } from "../lib/auth.tsx";

export function ModerationPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const reportsQuery = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
    enabled: user?.role === "ADMIN",
  });
  const moderate = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "reviewed" | "dismissed" }) =>
      updateReport(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  if (!user) {
    return (
      <main className="page">
        <h1>Moderation</h1>
        <p>Sign in with an admin UBC email to review reports.</p>
      </main>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className="page">
        <h1>Moderation</h1>
        <p>Your verified account does not have moderator access.</p>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>Open reports</h1>
      {reportsQuery.isLoading && <p>Loading reports…</p>}
      {reportsQuery.data?.reports.length === 0 && <p>No reports yet.</p>}
      <ul className="report-list">
        {reportsQuery.data?.reports.map((report) => (
          <li key={report.id}>
            <p>
              <strong>
                {report.buildingName}: {report.washroomName}
              </strong>
            </p>
            <p>
              {report.type} · {report.status}
            </p>
            <p>{report.message}</p>
            {report.status === "open" && (
              <div className="dialog-actions">
                <button
                  type="button"
                  onClick={() => moderate.mutate({ id: report.id, status: "reviewed" })}
                >
                  Mark reviewed
                </button>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => moderate.mutate({ id: report.id, status: "dismissed" })}
                >
                  Dismiss
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
