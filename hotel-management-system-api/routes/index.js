const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth"));
// router.use("/users", require("./users"));
// router.use("/rooms", require("./rooms"));

module.exports = router;
