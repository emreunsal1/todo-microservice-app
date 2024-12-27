const express = require("express");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerConfig = require("./swagger");
const { router } = require("./router");
const { connectToRabbitMQ } = require("./rabbitmq");
const { Server } = require("socket.io");
const { createServer } = require("node:http");
const { AUTH_REQUIRED_MIDDLEWARE_REDIRECT } = require("./middlewares/auth");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/swagger", swaggerUi.serve, swaggerUi.setup(swaggerConfig));
app.use("/api", router);
app.get("/", AUTH_REQUIRED_MIDDLEWARE_REDIRECT);

app.use(express.static("./client"));

const server = createServer(app);
const io = new Server(server);

const listenRabbitMqEvents = async () => {
  const { channel } = await connectToRabbitMQ();
  await channel.assertQueue("updateQueue");
  channel.consume("updateQueue", async (message) => {
    io.emit("UPDATED");
  });
};

listenRabbitMqEvents();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Gateway started -> ", PORT);
});
