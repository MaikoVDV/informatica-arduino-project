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
let highscore = 0;

board.on("ready", () => {
  let flashlight = new jf.Led(9);
  let piezo = new jf.Piezo(3);
  let button = new jf.Button(2);
  let potMeter = new jf.Sensor("A3");

  app.get("/on", (req, res) => {
    flashlight.on()
    res.send("Turned on the led.")
  })
  app.get("/off", (req, res) => {
    flashlight.off()
    res.send("Turned off the led.")
  })

  io.on("connection", socket => {
    console.log("Client connected to websocket!")
    socket.emit("current_highscore", highscore);

    socket.on("challenge_mode", (args) => {
      if (args == "start_challenge") {
        flashlight.strobe(25);
      } else {
        flashlight.stop();
        flashlight.off();
      }
    })
    socket.on("new_highscore", (new_highscore) => {
      highscore = new_highscore;
    })
    socket.on("play_music", (track) => {
      switch (track) {
        case "mario":
          piezo.play({
            song: [
              ["E5", 1/4],
              [null, 1/4],
              ["E5", 1/4],
              [null, 3/4],
              ["E5", 1/4],
              [null, 3/4],
              ["C5", 1/4],
              [null, 1/4],
              ["E5", 1/4],
              [null, 3/4],
              ["G5", 1/4],
              [null, 7/4],
              ["G4", 1/4],
              [null, 7/4]
            ],
            tempo: 200
          })
          break;
        case "dead":
          piezo.play({
            tempo: 500,
            song: [
              ["c4", 1],
              [null, 1],
              ["c4", 1],
              [null, 1],

              ["f5", 1],
              [null, 4],

              ["b2", 1],
              [null, 1],
              ["b2", 1],
              [null, 1]
            ]
          })
          break;
      }
    })
    button.on("press", () => {
      socket.emit("input_jump");
    });
    potMeter.on("change", () => {
      const { value, raw } = potMeter;
      socket.emit("background_change", value);
    })
  })
})
app.listen(port, () => {
  console.log("Express listening on port" + port);
})
