import express from "express";
import "dotenv/config";
import connectDb from "./config/db.js";
import routes from "./routes/chat.routes.js";

const port = process.env.PORT;

const app = express();
app.use(express.json());
app.use("/", routes);
app.get("/", (req, res) => {
  res.json({ message: "hello from chat" });
});

const startServer = async () => {
  await connectDb();
  app.listen(port, () => {
    console.log(`chat started at ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Chat service failed to start:", error);
  process.exitCode = 1;
});