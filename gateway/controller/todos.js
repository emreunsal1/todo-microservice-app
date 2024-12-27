const axios = require("axios");
const { TODO_SERVICE_URL, USER_SERVICE_URL } = require("../constants");

const getTodoController = async (req, res) => {
  const { todoId } = req.query;

  try {
    const todoResponse = await axios({
      method: "GET",
      params: { todoId },
      url: TODO_SERVICE_URL + "/detail",
    });

    const todos = Array.isArray(todoResponse.data.todo)
      ? todoResponse.data
      : [todoResponse.data];

    const userIds = todos.reduce((prev, todo) => {
      todo.assignees.forEach((assignee) => prev.add(assignee));
      return prev;
    }, new Set());

    const userResponse = await axios({
      method: "GET",
      params: {
        userIds: Array.from(userIds).join(","),
      },
      url: `${USER_SERVICE_URL}/bulk-user`,
    });

    const populatedTodos = todos.map((todo) => {
      const newAssignees = todo.assignees
        .map((_userId) => {
          return (
            userResponse.data.users.find((user) => user._id === _userId) || null
          );
        })
        .filter((user) => user !== null);

      return { ...todo, assignees: newAssignees };
    });

    res.send(populatedTodos[0]);
  } catch (error) {
    console.error(`Error in /todos: ${error.message}`);
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || { message: "Internal Server Error" });
  }
};

const getTodosController = async (req, res) => {
  const { assignedToMe } = req.query;
  const { _id } = req.user;

  try {
    const todoParams = {};
    if (assignedToMe) {
      todoParams.assigneId = _id;
    }
    const todoResponse = await axios({
      method: "GET",
      params: todoParams,
      url: TODO_SERVICE_URL,
    });
    const userIds = todoResponse.data.reduce((prev, todo) => {
      todo.assignees.forEach((_userId) => {
        prev.add(_userId);
      });
      return prev;
    }, new Set());

    const userResponse = await axios({
      method: "GET",
      params: {
        userIds: Array.from(userIds).join(","),
      },
      url: USER_SERVICE_URL + "/bulk-user",
    });

    const populatedTodos = todoResponse.data.map((todo) => {
      const newAssignees = [];
      todo.assignees.forEach((_userId) => {
        const foundUser = userResponse.data.users.find(
          (user) => user._id == _userId
        );
        if (foundUser) {
          newAssignees.push(foundUser);
        }
      });
      return { ...todo, assignees: newAssignees };
    });

    res.send(populatedTodos);
  } catch (error) {
    console.error(`Error in /todos: ${error.message}`);
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || { message: "Internal Server Error" });
  }
};

const getTagsController = async (req, res) => {
  const url = `${TODO_SERVICE_URL}/tags`;
  try {
    const response = await axios({
      method: "GET",
      url,
    });
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error(`Error in /todos/tags: ${error.message}`);
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || { message: "Internal Server Error" });
  }
};

const createTodoController = async (req, res) => {
  const { user } = req;
  const url = `${TODO_SERVICE_URL}/`;
  try {
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      headers: {
        "x-user-id": user._id,
      },
    });
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error(`Error in /todos: ${error.message}`);
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || { message: "Internal Server Error" });
  }
};

const deleteTodoController = async (req, res) => {
  const { id } = req.params;
  const url = `${TODO_SERVICE_URL}/${id}`;
  try {
    const response = await axios({
      method: req.method,
      url,
    });
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error(`Error in /todos: ${error.message}`);
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || { message: "Internal Server Error" });
  }
};

const updateTodoController = async (req, res) => {
  const { user } = req;
  const { todoId } = req.query;
  const url = `${TODO_SERVICE_URL}/`;
  try {
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      params: {
        todoId,
      },
      headers: {
        "x-user-id": user._id,
      },
    });
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error(`Error in /todos: ${error.message}`);
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || { message: "Internal Server Error" });
  }
};

module.exports = {
  getTodosController,
  getTagsController,
  createTodoController,
  deleteTodoController,
  updateTodoController,
  getTodoController,
};
