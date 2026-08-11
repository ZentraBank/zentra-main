const multer = require("multer");

const MAX_FILE_SIZE =
  10 * 1024 * 1024; // 10 MB

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const storage =
  multer.memoryStorage();

const fileFilter = (
  req,
  file,
  callback
) => {
  if (
    !allowedMimeTypes.has(
      file.mimetype
    )
  ) {
    const error =
      new Error(
        "Only JPG, PNG, WEBP and PDF files are allowed"
      );

    error.statusCode = 422;

    return callback(
      error,
      false
    );
  }

  return callback(
    null,
    true
  );
};

const upload =
  multer({
    storage,

    limits: {
      fileSize:
        MAX_FILE_SIZE,

      files: 1,
    },

    fileFilter,
  });

module.exports = {
  uploadSingleDocument:
    upload.single("file"),
};