const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.resolve(__dirname, "..", "uploads");
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 5 * 1024 * 1024;

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeExtension = extension || `.${String(file.mimetype || "").split("/")[1] || "jpg"}`;
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`;
    callback(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(new Error("Only JPEG, PNG, and WebP images are allowed."));
    }

    callback(null, true);
  },
});

function getBaseUrl(req) {
  const configuredUrl = process.env.PUBLIC_BASE_URL || process.env.RENDER_EXTERNAL_URL;
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return `${req.protocol}://${req.get("host")}`;
}

function getFileUrl(req, file) {
  if (!file?.filename) {
    return null;
  }

  return `${getBaseUrl(req)}/uploads/${file.filename}`;
}

function getFileUrls(req, files = []) {
  return files.map((file) => getFileUrl(req, file)).filter(Boolean);
}

async function deleteImageByUrl(url) {
  if (!url) {
    return;
  }

  try {
    const parsedUrl = new URL(url);
    const filename = path.basename(parsedUrl.pathname);
    const filePath = path.resolve(uploadDir, filename);
    const relativePath = path.relative(uploadDir, filePath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      return;
    }

    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("Unable to delete uploaded image:", error.message);
    }
  }
}

module.exports = {
  upload,
  uploadDir,
  getFileUrl,
  getFileUrls,
  deleteImageByUrl,
  allowedMimeTypes,
  maxFileSize,
};
