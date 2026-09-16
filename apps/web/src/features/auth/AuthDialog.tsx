import { useState, type FormEvent } from "react";
import { fetchDevMagicLink } from "../../api/client.ts";
import { useAuth } from "../../lib/auth.tsx";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AuthDialog({ open, onClose }: Props) {
  const { requestLink } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) {
    return null;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await requestLink(email);
      setMessage("Check your inbox for a single-use sign-in link. It expires in 15 minutes.");
      if (import.meta.env.DEV) {
        // Returns a link only while the API is falling back to the in-memory
        // adapter; once SMTP is configured the mail is really sent.
        const inbox = await fetchDevMagicLink(email);
        setDevUrl(inbox.url);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send that link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="auth-title">Verify a UBC email</h2>
        <p>
          Voting is limited to <code>@student.ubc.ca</code> and <code>@ubc.ca</code> addresses. This
          checks affiliation, not current enrolment, and we never collect student numbers or ID
          photos.
        </p>
        <form onSubmit={onSubmit}>
          <label>
            UBC email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <div className="dialog-actions">
            <button type="submit" disabled={busy}>
              Email me a link
            </button>
            <button type="button" className="text-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
        {message && <p role="status">{message}</p>}
        {devUrl && (
          <p className="notice">
            <a href={devUrl}>Open sign-in link →</a>
          </p>
        )}
      </div>
    </div>
  );
}
