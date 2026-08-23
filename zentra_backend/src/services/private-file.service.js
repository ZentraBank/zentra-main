const fs =
  require("fs/promises");

const path =
  require("path");

const crypto =
  require("crypto");

const STORAGE_ROOT =
  path.resolve(
    process.cwd(),
    "storage",
    "private"
  );

const extensionMap = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

const ensureDirectory =
  async (directory) => {
    await fs.mkdir(
      directory,
      {
        recursive: true,
      }
    );
  };

const storePrivateFile =
  async ({
    tenantId,
    userId,
    module,
    documentType,
    file,
  }) => {
    if (!file) {
      const error =
        new Error(
          "A document file is required"
        );

      error.statusCode = 422;

      throw error;
    }

    const extension =
      extensionMap[
        file.mimetype
      ];

    if (!extension) {
      const error =
        new Error(
          "Unsupported document type"
        );

      error.statusCode = 422;

      throw error;
    }

    const fileId =
      crypto.randomUUID();

    const storedName =
      `${fileId}${extension}`;

    const relativeDirectory =
      path.join(
        tenantId,
        module,
        userId
      );

    const absoluteDirectory =
      path.join(
        STORAGE_ROOT,
        relativeDirectory
      );

    await ensureDirectory(
      absoluteDirectory
    );

    const absolutePath =
      path.join(
        absoluteDirectory,
        storedName
      );

    await fs.writeFile(
      absolutePath,
      file.buffer
    );

    return {
      id: fileId,

      originalName:
        file.originalname,

      storedName,

      mimeType:
        file.mimetype,

      sizeBytes:
        file.size,

      storagePath:
        path.join(
          relativeDirectory,
          storedName
        ),

      documentType,
    };
  };

const readPrivateFile =
  async ({
    storagePath,
  }) => {
    const absolutePath =
      path.resolve(
        STORAGE_ROOT,
        storagePath
      );

    const relativePath =
      path.relative(
        STORAGE_ROOT,
        absolutePath
      );

    if (
      relativePath.startsWith("..") ||
      path.isAbsolute(
        relativePath
      )
    ) {
      const error =
        new Error(
          "Invalid file path"
        );

      error.statusCode = 400;

      throw error;
    }

    return fs.readFile(
      absolutePath
    );
  };
module.exports = {
  storePrivateFile,
  readPrivateFile,
};