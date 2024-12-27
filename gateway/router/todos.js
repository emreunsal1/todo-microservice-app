const { Router } = require("express");
const {
  getTodosController,
  createTodoController,
  deleteTodoController,
  updateTodoController,
  getTodoController,
  getTagsController,
} = require("../controller/todos");
const { AUTH_REQUIRED_MIDDLEWARE } = require("../middlewares/auth");

const router = Router();
router.get("/detail", AUTH_REQUIRED_MIDDLEWARE, getTodoController);
router.get("/", AUTH_REQUIRED_MIDDLEWARE, getTodosController);
router.get("/tags", AUTH_REQUIRED_MIDDLEWARE, getTagsController);
router.post("/", AUTH_REQUIRED_MIDDLEWARE, createTodoController);
router.put("/", AUTH_REQUIRED_MIDDLEWARE, updateTodoController);
router.delete("/:id", AUTH_REQUIRED_MIDDLEWARE, deleteTodoController);

module.exports = { todosRouter: router };
