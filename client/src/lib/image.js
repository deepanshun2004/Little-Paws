export function getImageSrc(image, fallbackText = "Little Paws") {
  if (typeof image === "string" && image.trim()) {
    return image;
  }

  return `https://placehold.co/600x400?text=${encodeURIComponent(fallbackText)}`;
}
