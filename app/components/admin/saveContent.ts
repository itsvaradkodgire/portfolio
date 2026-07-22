import toast from 'react-hot-toast';

/**
 * PUT content to an admin API route and show a meaningful toast.
 *
 * On failure it surfaces the real server error message (e.g. "Content storage
 * is not configured…") instead of a generic "Save failed", so misconfigured
 * deployments are obvious from the UI.
 *
 * Returns true on success, false otherwise.
 */
export async function saveContent(
  path: string,
  body: unknown,
  successMessage: string
): Promise<boolean> {
  try {
    const res = await fetch(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(successMessage);
      return true;
    }

    let message = `Save failed (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* non-JSON error body */
    }
    if (res.status === 401) message = 'Session expired. Please log in again.';
    toast.error(message, { duration: 6000 });
    return false;
  } catch {
    toast.error('Network error while saving.', { duration: 6000 });
    return false;
  }
}
