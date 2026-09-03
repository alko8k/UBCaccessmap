import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../lib/auth.tsx";

export function VerifyPage() {
  const [params] = useSearchParams();
  const { verify } = useAuth();
  const token = params.get("token");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;
    verify(token)
      .then(() => {
        if (!cancelled) setDone(true);
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Could not verify that link.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, verify]);

  return (
    <main className="page">
      <h1>Signing you in</h1>
      {done && (
        <p>
          You are verified. <Link to="/">Back to the map</Link>
        </p>
      )}
      {!token && <p role="alert">That sign-in link is missing a token.</p>}
      {error && <p role="alert">{error}</p>}
      {token && !done && !error && <p>Checking your magic link…</p>}
    </main>
  );
}
