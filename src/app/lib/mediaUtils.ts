export const DEFAULT_IMAGE_PLACEHOLDER = "/images/accommodation-placeholder.svg";

export const normalizeImageUrl = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const hasProtocol = /^(https?:\/\/|\/\/|data:)/i.test(trimmed);
  if (hasProtocol) {
    return trimmed;
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};
