export const DEFAULT_PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80";

export const getImageUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return DEFAULT_PLACEHOLDER_IMAGE;
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const backendBase = 'http://localhost:8083';
  return trimmed.startsWith('/') ? `${backendBase}${trimmed}` : `${backendBase}/${trimmed}`;
};
