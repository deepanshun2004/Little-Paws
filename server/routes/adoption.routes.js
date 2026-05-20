const { Router } = require("express");
const { verifyUser } = require("../middlewares/auth.middleware");
const { createAdoption } = require("../controllers/user.controller");

const router = Router();

router.post("/", verifyUser, createAdoption);

module.exports = router;
