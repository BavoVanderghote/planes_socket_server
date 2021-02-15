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

// sockets
const clientSockets = []; // store client sockets
const rooms = []; // store rooms

const deleteRoom = (socketId) => {
  const app = rooms.find((e) => e.app.id == socketId);
  const client = rooms.find((e) => e.client.id == socketId);
  let partnerId = null;
  if (app) {
    console.log("app disconnected", app.app.id);
    partnerId = app.client.id;
    const index = rooms.indexOf(app);
    rooms.splice(index, 1);
  } else if (client) {
    console.log("client disconnected", client.client.id);
    partnerId = client.app.id;
    const index = rooms.indexOf(client);
    rooms.splice(index, 1);
  }
  console.log("room destroyed");
  if (partnerId != null) {
    return partnerId;
  }
};

const findClient = (socketId) => {
  if (rooms.find((e) => e.app.id == socketId)) {
    return rooms.find((e) => e.app.id == socketId).client.id;
  } else {
    return undefined;
  }
};

io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);
  if (socket.handshake.auth.token) {
    clientSockets.push(socket);
    console.log(
      "clientSocket",
      clientSockets[clientSockets.length - 1].id,
      clientSockets[clientSockets.length - 1].handshake.auth.token
    );
  }

  socket.on("connectToClient", (code) => {
    if (rooms.some((e) => e.code == code)) {
      console.log(`code already used`);
    } else {
      clientSockets.forEach((s) => {
        if (s.handshake.auth.token == code) {
          rooms.push({
            room: rooms.length,
            code: code,
            client: s,
            app: socket,
          });
        }
      });
      console.log("joined room", rooms[rooms.length - 1].room);
      socket.emit("clientConnection", true);
      io.to(rooms[rooms.length - 1].client.id).emit("clientConnection", true);
    }
  });

  socket.on("accelerometerData", (data) => {
    io.to(findClient(socket.id)).emit("accelerometerData", data); // send to partner
    // socket.broadcast.emit("accelerometerData", data);
  });

  socket.on("tap", (e) => {
    io.to(findClient(socket.id)).emit("tap", e);
    // socket.broadcast.emit("tap", e);
  });

  socket.on("orientation", (angles) => {
    io.to(findClient(socket.id)).emit("orientation", angles);
    // socket.broadcast.emit("orientation", angles);
  });

  socket.on("controlMode", (bool) => {
    io.to(findClient(socket.id)).emit("controlMode", bool);
    // socket.broadcast.emit("controlMode", bool);
  });

  socket.on("disconnect", (reason) => {
    console.log(`${socket.id} disconnected [${reason}]`);
    io.to(deleteRoom(socket.id)).emit("clientConnection", false);
  });
});

http.listen(port, () => {
  console.log(`listening on ${port}`);
});
