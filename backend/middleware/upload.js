const path = require("path");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const fs = require("fs").promises;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "cubicle/clients",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        width: 500,
        height: 500,
        crop: "limit",
      },
    ],
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const fileExt = path.extname(file.originalname).toLowerCase().substring(1);
    const allowedExtensions = ["jpeg", "jpg", "png", "webp"];

    console.log("File upload attempt:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      extname: fileExt,
      hasValidMime: allowedTypes.includes(file.mimetype),
      hasValidExt: allowedExtensions.includes(fileExt),
    });

    const isValidMime = allowedTypes.includes(file.mimetype);
    const isValidExt = allowedExtensions.includes(fileExt);

    if (file.originalname === "blob" && isValidMime) {
      return cb(null, true);
    }

    if (isValidMime && isValidExt) {
      return cb(null, true);
    }

    cb(
      new Error(
        `File type not allowed. Please upload only ${allowedExtensions.join(
          ", "
        )} files.`
      )
    );
  },
});

const emailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "cubicle/emails/attachments",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "txt",
    ],
    resource_type: "auto",
  },
});

const uploadMultiple = multer({
  storage: emailStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpe?g|png|gif|bmp|pdf|docx?|xlsx?|pptx?|txt/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error(
        "Invalid file type. Only images, PDFs, and Office documents are allowed."
      )
    );
  },
});

const processUpload = (req, res, next) => {
  if (!req.files) return next();

  req.files = req.files.map((file) => ({
    ...file,

    url:
      file.location ||
      file.path ||
      (file.transformed ? file.transformed.secure_url : null),
  }));

  next();
};

const uploadProfileImage = (req, res, next) => {
  const uploadSingle = upload.single("profileImage");

  uploadSingle(req, res, function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size is 5MB.",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading file",
      });
    }
    next();
  });
};

const uploadCoverImage = (req, res, next) => {
  const uploadSingle = upload.single("coverImage");
  uploadSingle(req, res, function (err) {
    if (err) {
      return res
        .status(400)
        .json({ msg: err.message || "Error uploading file" });
    }
    next();
  });
};

const uploadEmailAttachments = (req, res, next) => {
  uploadMultiple.array("attachments", 5)(req, res, function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size too large. Max 10MB per file.",
        });
      } else if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          success: false,
          message: "Too many files. Maximum 5 files allowed.",
        });
      } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
        console.error(
          "Unexpected field in email attachments upload:",
          err.field
        );
        return res.status(400).json({
          success: false,
          message: "Unexpected field. Use 'attachments' as field name.",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading files",
      });
    }
    next();
  });
};

const taskCoverStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "cubicle/task-covers",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 630, crop: "fill" }],
  },
});

const uploadTaskCover = multer({
  storage: taskCoverStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
}).single("coverImage");

const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    console.log(`Deleted file: ${filePath}`);
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};

module.exports = {
  uploadFile: upload.single("profileImage"),
  uploadProfileImage,
  uploadCoverImage,
  uploadEmailAttachments: [uploadEmailAttachments, processUpload],
  uploadMultiple: uploadMultiple,
  processUpload,
  uploadTaskCover,
  deleteFile,
};
