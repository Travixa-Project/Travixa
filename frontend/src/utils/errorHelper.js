/**
 * Safely extracts human-readable error messages from Axios / API response errors.
 */
export const getErrorMessage = (err, fallback = 'An error occurred') => {
  if (!err) return fallback;
  if (typeof err === 'string') return err;

  const data = err.response?.data;
  if (!data) return err.message || fallback;

  if (typeof data === 'string') return data;
  if (data.message && typeof data.message === 'string') return data.message;
  if (data.error && typeof data.error === 'string') return data.error;
  if (data.title && typeof data.title === 'string') return data.title;

  if (data.errors && typeof data.errors === 'object') {
    const messages = [];
    for (const key in data.errors) {
      if (Array.isArray(data.errors[key])) {
        messages.push(...data.errors[key]);
      } else if (typeof data.errors[key] === 'string') {
        messages.push(data.errors[key]);
      }
    }
    if (messages.length > 0) return messages.join(' ');
  }

  return err.message || fallback;
};
