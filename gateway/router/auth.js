const { Router } = require("express");
const {
  loginController,
  registerController,
  logoutController,
} = require("../controller/auth");

const router = Router();

router.post("/login", loginController);
router.post("/register", registerController);
router.post("/logout", logoutController);

module.exports = { authRouter: router };
