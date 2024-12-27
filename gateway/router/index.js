const { Router } = require("express");
const { userRouter } = require("./user");
const { authRouter } = require("./auth");
const { todosRouter } = require("./todos");

const router = Router();

router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/todos", todosRouter);

module.exports = { router };
