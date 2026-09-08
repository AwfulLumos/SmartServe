const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsDir = path.join(__dirname, "..", "uploads", "profiles");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const menuUploadsDir = path.join(__dirname, "..", "uploads", "menu");
if (!fs.existsSync(menuUploadsDir)) {
  fs.mkdirSync(menuUploadsDir, { recursive: true });
}

// -------------------------------------------------------------
// Whitelist Definitions
// -------------------------------------------------------------
const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const ALLOWED_MIMETYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".png";
    cb(null, `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const menuStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, menuUploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".jpg";
    cb(null, `menu-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = (file.mimetype || "").toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error("Invalid file extension. Only .png, .jpg, .jpeg, .webp, and .gif images are allowed."));
  }

  if (!ALLOWED_MIMETYPES.has(mimetype)) {
    return cb(new Error("Invalid file type. Only image files are allowed."));
  }

  cb(null, true);
};

const uploadProfileImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB maximum file size
});

const uploadMenuImage = multer({
  storage: menuStorage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB maximum file size
});

/**
 * Validates the file's initial magic bytes on disk to prevent spoofed/executable files disguised as images.
 */
const verifyImageMagicBytes = (filePath) => {
  if (!fs.existsSync(filePath)) return false;
  try {
    const buffer = Buffer.alloc(12);
    const fd = fs.openSync(filePath, "r");
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    // PNG signature: 89 50 4E 47
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    // JPEG signature: FF D8 FF
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    // GIF signature: 47 49 46 38 ("GIF8")
    const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
    // WebP signature: RIFF (bytes 0-3) ... WEBP (bytes 8-11)
    const isWebp =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;

    return isPng || isJpeg || isGif || isWebp;
  } catch {
    return false;
  }
};

/**
 * Express middleware wrapper to validate magic bytes and handle Multer errors cleanly.
 */
const handleProfileImageUpload = (req, res, next) => {
  const uploadSingle = uploadProfileImage.single("profileImage");

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File size limit exceeded. Maximum image size is 2MB." });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ message: err.message || "File upload failed" });
    }

    if (req.file) {
      const isValidMagicBytes = verifyImageMagicBytes(req.file.path);
      if (!isValidMagicBytes) {
        // Delete malicious or corrupted file from disk immediately
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: "Invalid image file format detected (magic byte verification failed)." });
      }
    }

    next();
  });
};

/**
 * Express middleware wrapper for menu image uploads.
 */
const handleMenuImageUpload = (req, res, next) => {
  const uploadSingle = uploadMenuImage.single("imageFile");

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File size limit exceeded. Maximum menu image size is 3MB." });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ message: err.message || "Menu image upload failed" });
    }

    if (req.file) {
      const isValidMagicBytes = verifyImageMagicBytes(req.file.path);
      if (!isValidMagicBytes) {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: "Invalid image file format detected (magic byte verification failed)." });
      }
    }

    next();
  });
};

module.exports = { uploadProfileImage, handleProfileImageUpload, uploadMenuImage, handleMenuImageUpload };
