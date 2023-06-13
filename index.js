import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const __dirname = process.cwd();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("server is up and running in port 3000");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is up and running" });
});

let messages = [];

const changeEvents = (req, res) => {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-control": "no-cache",
  };
  res.writeHead(200, headers);
  const messageId = uuidv4();
  const message = {
    id: messageId,
    res,
  };
  messages.push(message);
  req.on("close", () => {
    console.log("Connection closed");
    messages.filter((message) => message.id !== messageId);
  });
};

const sendEvent = (req, res) => {
  if (!req.body) return;
  const data = req.body;
  messages.forEach((message) =>
    message.res.write(`data:${JSON.stringify(data)}\n\n`)
  );
  res.status(200).send({ success: true });
};

app.get("/api/trigger", changeEvents);

app.post("/api/send-event", sendEvent);

app.get("/events/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});
