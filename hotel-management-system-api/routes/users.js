const checkRole = require("../middlewares/checkRole");
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const userFilesController = require("../controllers/user.files.controller");
const isAuth = require("../middlewares/isAuth");
const userService = require("../services/user.service");
const { userTransformer } = require("../utils/transformers");
const responses = require("../helper/responses");

router.get("/", isAuth, userController.index);
router.get("/all", isAuth, userController.getAllUsers);
router.get("/:id", isAuth, userController.getUser);
router.post(
  "/",
  isAuth,
  checkRole.isAdminOrReceptionist,
  userController.createUser
);
router.put(
  "/:id",
  isAuth,
  checkRole.isAdminReceptionistOrSelf,
  userController.updateUser
);
router.delete(
  "/:id",
  isAuth,
  checkRole.isAdminOrReceptionist,
  userController.deleteUser
);
// Avatar upload/delete
router.post(
  "/:id/avatar",
  isAuth,
  checkRole.isAdminReceptionistOrSelf,
  userFilesController.uploadAvatar
);
router.delete(
  "/:id/avatar",
  isAuth,
  checkRole.isAdminReceptionistOrSelf,
  userFilesController.deleteAvatar
);
// Documents upload/delete
router.post(
  "/:id/documents",
  isAuth,
  checkRole.isAdminReceptionistOrSelf,
  userFilesController.uploadDocuments
);
router.delete(
  "/:id/documents/:documentId",
  isAuth,
  checkRole.isAdminReceptionistOrSelf,
  userFilesController.deleteDocument
);
router.get("/:id/avatar", isAuth, userFilesController.getAvatar);

module.exports = router;
