var jf = require("johnny-five");
let express = require("express");
let path = require("path");
const app = express();
const port = 3000;
app.use(express.static(path.join(__dirname, 'arduino-control')))

const { Server } = require("socket.io");
const io = new Server(8080, {
  cors: {
    origin: "*"
  }
});

var board = new jf.Board({port: "COM3"});

board.on("ready", () => {
  let led = new jf.Led(9)
  let button = new jf.Button(2);

  app.get("/on", (req, res) => {
    led.on();
    res.send("Turned on the led.")
  })
  app.get("/off", (req, res) => {
    led.off();
    res.send("Turned off the led.")
  })

  io.on("connection", socket => {
    console.log("Client connected to websocket!")

    socket.on("led_toggle", (args) => {
      led.toggle();
    })
    button.on("press", () => {
      console.log("holding button")
      socket.emit("input_jump");
    });
  })
})
app.listen(port, () => {
  console.log("Express listening on port" + port);
})
