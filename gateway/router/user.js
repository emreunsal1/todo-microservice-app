const { Router } = require("express");
const {
  meController,
  userUpdateController,
  getUsersController,
} = require("../controller/user");
const { AUTH_REQUIRED_MIDDLEWARE } = require("../middlewares/auth");

const router = Router();

router.get("/me", AUTH_REQUIRED_MIDDLEWARE, meController);
router.put("/", AUTH_REQUIRED_MIDDLEWARE, userUpdateController);
router.get("/", AUTH_REQUIRED_MIDDLEWARE, getUsersController);

module.exports = { userRouter: router };
