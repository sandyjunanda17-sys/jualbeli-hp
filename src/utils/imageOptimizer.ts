/**
 * Utility untuk memproses, mengompres, dan menyesuaikan ukuran gambar secara otomatis
 * Mendukung semua format gambar (JPG, PNG, WEBP, GIF, HEIC, BMP, dll.)
 * Mengubah gambar kamera resolusi tinggi menjadi format WebP/JPEG ringan yang tajam
 */
export function processImageFile(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validasi tipe file
    if (!file.type.startsWith("image/") && !file.name.match(/\.(jpe?g|png|webp|gif|bmp|heic|heif|svg)$/i)) {
      reject(new Error("File bukan format gambar yang valid."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        reject(new Error("Gagal membaca berkas gambar."));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let { width, height } = img;

          // Proporsional resize (menjaga aspek rasio asli)
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(src);
            return;
          }

          // Background putih halus untuk gambar transparan
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Coba simpan ke WebP, fallback ke JPEG jika browser lama
          let dataUrl: string;
          try {
            dataUrl = canvas.toDataURL("image/webp", quality);
            if (!dataUrl.startsWith("data:image/webp")) {
              dataUrl = canvas.toDataURL("image/jpeg", quality);
            }
          } catch {
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }

          resolve(dataUrl);
        } catch (err) {
          console.warn("Fallback to raw image:", err);
          resolve(src);
        }
      };

      img.onerror = () => reject(new Error("Format gambar tidak dapat dirender."));
      img.src = src;
    };

    reader.onerror = () => reject(new Error("Gagal membuka file dari perangkat."));
    reader.readAsDataURL(file);
  });
}
