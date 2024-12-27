const { default: axios } = require("axios");
const {
  USER_SERVICE_URL,
  TODO_SERVICE_URL,
  AUTH_TOKEN_COOKIE_NAME,
} = require("../constants");
const dotenv = require("dotenv");
dotenv.config();

const getUsersController = async (req, res) => {
  const url = `${USER_SERVICE_URL}/`;
  try {
    const response = await axios({
      method: req.method,
      url,
    });
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error(`Error in /users: ${error.message}`);
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || { message: "Internal Server Error" });
  }
};

const meController = async (req, res) => {
  const { user } = req;
  try {
    const userResponse = await axios({
      method: req.method,
      url: `${USER_SERVICE_URL}/me`,
      headers: {
        "x-user-id": user._id,
      },
    });

    const todoResponse = await axios({
      method: req.method,
      url: `${TODO_SERVICE_URL}/bulk-todos`,
      headers: {
        "x-user-id": user._id,
      },
    });
    const userTodos = todoResponse.data.filter((todo) =>
      userResponse.data.todos.includes(todo._id)
    );
    res
      .status(todoResponse.status)
      .send({ ...userResponse.data, todos: userTodos });
  } catch (error) {
    console.error(`Error in /users: ${error.message}`);
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || { message: "Internal Server Error" });
  }
};

const userUpdateController = async (req, res) => {
  const { user } = req;
  const url = `${USER_SERVICE_URL}/`;
  try {
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      headers: {
        "x-user-id": user._id,
      },
    });

    const PASSWORD_CHANGED_STATUS_CODE = 205;

    if (response.status === PASSWORD_CHANGED_STATUS_CODE) {
      res.clearCookie(AUTH_TOKEN_COOKIE_NAME);
    }
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error(`Error in /users: ${error.message}`);
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || { message: "Internal Server Error" });
  }
};

module.exports = { meController, userUpdateController, getUsersController };
