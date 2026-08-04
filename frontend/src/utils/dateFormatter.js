/**
 * Formats date string or object to DD-MM-YYYY format
 * Examples: 02-08-2026, 15-12-2026
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return dateInput;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};
