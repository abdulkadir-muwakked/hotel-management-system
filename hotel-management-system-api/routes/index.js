const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/rooms", require("./rooms"));
router.use("/reservations", require("./reservations"));
router.use("/payments", require("./payment.route"));

module.exports = router;
