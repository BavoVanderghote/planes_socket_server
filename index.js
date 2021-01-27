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
  res.send({ response: "I am alive" }).status(200);
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

http.listen(port, () => {
  console.log(`listening on ${port}`);
});
