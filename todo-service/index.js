const express = require("express");
const amqp = require("amqplib");

const { connectDb } = require("./db");
const TodoModel = require("./models/Todo");
const TagModel = require("./models/Tag");

const app = express();
connectDb();
app.use(express.json());

let channel;

async function connectRabbitMQ() {
  const connection = await amqp.connect("amqp://127.0.0.1");
  channel = await connection.createChannel();
  await channel.assertQueue("todoQueue");
  console.log("Todo-Service RabbitMQ'ya bağlı");
}

connectRabbitMQ();

app.get("/detail", async (req, res) => {
  const { todoId } = req.query;
  if (todoId) {
    const todo = await TodoModel.findById(todoId).populate("tags", "name");
    if (todo) {
      res.send(todo);
    }
  } else {
    res.status(404).json({ error: "Todo not found" });
    return;
  }
});

app.get("/bulk-todos", async (req, res) => {
  try {
    const todos = await TodoModel.find({
      isDelete: false,
    }).populate("tags", "name");
    res.send(todos);
  } catch (error) {
    console.error("Todo'lar alınırken hata:", error);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

app.get("/", async (req, res) => {
  const { assigneId } = req.query;
  try {
    let todos;

    if (assigneId) {
      todos = await TodoModel.find({
        assignees: { $in: [assigneId] },
        isDelete: false,
      }).populate("tags", "name");
    } else {
      todos = await TodoModel.find({ isDelete: false }).populate(
        "tags",
        "name"
      );
    }

    res.json(todos);
  } catch (error) {
    console.error("Todo'lar alınırken hata:", error);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

app.get("/tags", async (req, res) => {
  try {
    const tags = await TagModel.find();
    res.json(tags);
  } catch (error) {
    console.error("Todo'lar alınırken hata:", error);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

app.post("/", async (req, res) => {
  const todoData = req.body;

  try {
    const todo = new TodoModel(todoData);
    const savedTodo = await todo.save();

    if (channel) {
      const message = JSON.stringify({
        action: "CREATE_TODO",
        data: savedTodo,
        creatorUserId: req.headers["x-user-id"],
      });
      channel.sendToQueue("todoQueue", Buffer.from(message));
      channel.sendToQueue("updateQueue", Buffer.from(""));
    }

    res.status(201).json(savedTodo);
  } catch (error) {
    console.error("Todo creation error:", error);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

app.put("/", async (req, res) => {
  const { todoId } = req.query;

  try {
    const todoData = req.body;
    const todo = await TodoModel.findByIdAndUpdate(todoId, todoData, {
      new: true,
    });
    if (!todo) {
      return res.status(404).json({ error: "Todo bulunamadı" });
    }
    channel.sendToQueue("updateQueue", Buffer.from(""));
    res.json({ todo });
  } catch (error) {
    console.error("Todo güncellenirken hata:", error);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

app.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Todo ID gerekli" });
    }

    const todo = await TodoModel.findByIdAndUpdate(
      id,
      { isDelete: true },
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({ error: "Todo bulunamadı" });
    }
    channel.sendToQueue("updateQueue", Buffer.from(""));
    res.send({ message: "Delete Success" });
  } catch (error) {
    console.error("Todo silinirken hata:", error);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log("Todo-Service working -> ", PORT);
});
