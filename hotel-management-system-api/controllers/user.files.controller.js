// controllers/user.files.controller.js
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("../models");
const response = require("../helper/responses");

// Multer storage for avatars
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/avatars"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `user_${req.params.id}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Multer storage for documents
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/documents"));
  },
  filename: function (req, file, cb) {
    cb(null, `user_${req.params.id}_${Date.now()}_${file.originalname}`);
  },
});

const uploadAvatar = multer({ storage: avatarStorage }).single("avatar");
const uploadDocuments = multer({ storage: documentStorage }).array("documents");

// POST /users/:id/avatar
exports.uploadAvatar = async (req, res) => {
  uploadAvatar(req, res, async function (err) {
    if (err || !req.file) {
      return response.failedWithMessage("Avatar file is required", res);
    }
    const userId = req.params.id;
    const user = await db.User.findByPk(userId);
    if (!user) return response.failedWithMessage("User not found", res);
    // Remove old avatar if exists
    const oldAvatar = await db.Document.findOne({
      where: { userId, documentType: "profile_photo" },
    });
    if (oldAvatar) {
      try {
        fs.unlinkSync(oldAvatar.filePath);
      } catch {}
      await oldAvatar.destroy();
    }
    // Save new avatar
    const doc = await db.Document.create({
      userId,
      documentType: "profile_photo",
      fileName: req.file.filename,
      filePath: req.file.path,
    });
    return response.successWithMessage("Avatar uploaded", res, { avatar: doc });
  });
};

// DELETE /users/:id/avatar
exports.deleteAvatar = async (req, res) => {
  const userId = req.params.id;
  const avatar = await db.Document.findOne({
    where: { userId, documentType: "profile_photo" },
  });
  if (!avatar) return response.failedWithMessage("No avatar found", res);
  try {
    fs.unlinkSync(avatar.filePath);
  } catch {}
  await avatar.destroy();
  return response.successWithMessage("Avatar deleted", res);
};

// POST /users/:id/documents
exports.uploadDocuments = async (req, res) => {
  uploadDocuments(req, res, async function (err) {
    if (err || !req.files || req.files.length === 0) {
      return response.failedWithMessage("No documents uploaded", res);
    }
    const userId = req.params.id;
    const user = await db.User.findByPk(userId);
    if (!user) return response.failedWithMessage("User not found", res);
    const docs = await Promise.all(
      req.files.map((file) =>
        db.Document.create({
          userId,
          documentType: req.body.documentType || "other",
          fileName: file.filename,
          filePath: file.path,
        })
      )
    );
    return response.successWithMessage("Documents uploaded", res, {
      documents: docs,
    });
  });
};

// DELETE /users/:id/documents/:documentId
exports.deleteDocument = async (req, res) => {
  const userId = req.params.id;
  const documentId = req.params.documentId;
  const doc = await db.Document.findOne({ where: { id: documentId, userId } });
  if (!doc) return response.failedWithMessage("Document not found", res);
  try {
    fs.unlinkSync(doc.filePath);
  } catch {}
  await doc.destroy();
  return response.successWithMessage("Document deleted", res);
};
