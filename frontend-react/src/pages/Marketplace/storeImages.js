export async function readStoreImage(file, maxKB = 400) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > maxKB * 1024) {
    throw new Error(`Choose a JPG, PNG or WebP image up to ${maxKB} KB.`);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(file);
  });
}
