import express from "express";
import "dotenv/config";
import connectDb from "./config/db.js";
import router from "./routes/agent.route.js";

const port = process.env.PORT;

const app = express();
app.use(express.json());
app.use("/", router);
app.get("/", (req, res) => {
  res.json({ message: "hello from agent" });
});

const startServer = async () => {
  await connectDb();
  app.listen(port, () => {
    console.log(`agent started at ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Agent service failed to start:", error);
  process.exitCode = 1;
});
