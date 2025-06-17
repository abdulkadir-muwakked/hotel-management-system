const checkRole = require("../middlewares/checkRole");
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const isAuth = require("../middlewares/isAuth");

router.get("/", isAuth, userController.index);
router.get("/all", isAuth, userController.getAllUsers);
router.get("/:id", isAuth, userController.getUser);
router.post(
  "/",
  isAuth,
  checkRole.isAdminOrReceptionist,
  userController.createUser
);
module.exports = router;
