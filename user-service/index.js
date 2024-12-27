const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const amqp = require("amqplib");

const User = require("./models/User");
const { connectDb } = require("./db");

const app = express();
app.use(express.json());

let channel;

async function connectRabbitMQ() {
  const connection = await amqp.connect("amqp://127.0.0.1");
  channel = await connection.createChannel();
  await channel.assertQueue("todoQueue");
  console.log("Connected to rabbitmq");

  channel.consume("todoQueue", async (message) => {
    const { action, data, creatorUserId } = JSON.parse(
      message.content.toString()
    );
    console.log(`RabbitMq message recieved: ${action}`, data);

    if (action === "CREATE_TODO") {
      const { _id } = data;
      await updateUserTodos(creatorUserId, _id);
    }

    channel.ack(message);
  });
}

async function updateUserTodos(creatorId, todoId) {
  try {
    const updateResult = await User.findByIdAndUpdate(
      creatorId,
      {
        $addToSet: { todos: todoId },
      },
      { new: true }
    );
  } catch (error) {
    console.error("Update user error:", error);
  }
}

connectRabbitMQ();
connectDb();

app.get("/", async (req, res) => {
  try {
    const user = await User.find();
    res.json({ user });
  } catch (error) {
    res.status(500).send("Hata oluştu");
  }
});
app.get("/bulk-user", async (req, res) => {
  const { userIds } = req.query;
  const splitedUserIds = userIds.split(",");
  if (!userIds?.length) {
    return res.json([]);
  }
  try {
    const users = await User.find({ _id: { $in: splitedUserIds } }).select(
      "-password -todos"
    );
    res.json({ users });
  } catch (error) {
    res.status(500).send("Hata oluştu");
  }
});

app.get("/me", async (req, res) => {
  try {
    const user = await User.findById(req.headers["x-user-id"]);
    res.send(user);
  } catch (error) {
    res.status(500).send("Hata oluştu");
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ user });
  } catch (error) {
    console.log("error.message :>> ", error.message);
    res.status(500).send("Hata oluştu");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(404).send({ message: "Kullanıcı bulunamadı." });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).send("Hata oluştu");
  }
});

app.put("/", async (req, res) => {
  const { newPassword, oldPassword, ...updateData } = req.body;

  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı kimliği bulunamadı" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    if (newPassword && oldPassword) {
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Eski şifre hatalı" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    const passwordChangedStatusCodeLogic = !!updateData.password ? 205 : 200;

    res.status(passwordChangedStatusCodeLogic).json({
      updatedUser,
      message: "Kullanıcı bilgileri başarıyla güncellendi",
    });
  } catch (error) {
    console.error("Kullanıcı güncellenirken hata:", error);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("User-Service working -> ", PORT);
});
