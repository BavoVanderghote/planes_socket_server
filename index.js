// const content = require("fs").readFileSync(__dirname + "/index.html", "utf8");

// const httpServer = require("http").createServer((req, res) => {
//   // serve the index.html file
//   res.setHeader("Content-Type", "text/html");
//   res.setHeader("Content-Length", Buffer.byteLength(content));
//   res.end(content);
// });

// const io = require("socket.io")(httpServer, {
//   cors: {
//     origin: "http://127.0.0.1:1234",
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log(socket.id);
// });

// httpServer.listen(3000, () => {
//   console.log("go to http://127.0.0.1:3000");
// });

const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

//Port from environment variable or default - 3000
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("<h1>Socket_server</h1>");
});

io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);
  // console.log(`auth: ${socket.handshake.auth.token}`); // pairing app and plane instances

  socket.on("accelerometerData", (data) => {
    socket.broadcast.emit("accelerometerData", data);
  });

  socket.on("tap", (e) => {
    socket.broadcast.emit("tap", e);
  });

  socket.on("orientation", (angles) => {
    socket.broadcast.emit("orientation", angles);
  });

  socket.on("controlMode", (bool) => {
    socket.broadcast.emit("controlMode", bool);
  });

  socket.on("disconnect", (reason) => {
    console.log(`${socket.id} disconnected [${reason}]`);
  });
});

http.listen(3000, () => {
  console.log("listening on http://127.0.0.1:3000");
});
