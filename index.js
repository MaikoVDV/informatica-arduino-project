var jf = require("johnny-five");
let express = require("express");
let path = require("path");
const app = express();
const port = 3000;

// Making the client available on localhost:xxxx/
app.use(express.static(path.join(__dirname, 'arduino-control')))

// Creating a websocket server on port 8080.
// Since this is meant to be ran locally, CORS is disabled.
const { Server } = require("socket.io");
const io = new Server(8080, {
  cors: {
    origin: "*"
  }
});

// Connecting to the Arduino
// CHANGE PORT IF THERE IS A CONNECTION ERROR WITH THE ARDUINO
var board = new jf.Board({port: "COM3"});

let highscore = 0;

// After the board has connected, register endpoints for the express server and the websocket server.
board.on("ready", () => {
  // Registering johnny-five components. These all provide higher-level api's than just digitalWrite like you would have in the Arduino programming language.
  let flashlight = new jf.Led(9);
  let piezo = new jf.Piezo(3);
  let button = new jf.Button(2);
  let potMeter = new jf.Sensor("A3"); // Potentiometer is analog (value from 0-1023).

  // These express endpoints are mostly legacy debugging code, but they are still useful for testing.
  app.get("/on", (req, res) => {
    flashlight.on()
    res.send("Turned on the led.")
  })
  app.get("/off", (req, res) => {
    flashlight.off()
    res.send("Turned off the led.")
  })

  // After a websocket connection has been made, add eventlisteners for recieving client input and receiving data from the Arduino.
  io.on("connection", socket => {
    console.log("Client connected to websocket!")
    // Sending the highscore to the client that just connected.
    socket.emit("current_highscore", highscore);

    // When the client pressed C, challenge mode is toggled. This causes the LED to flash.
    socket.on("challenge_mode", (args) => {
      if (args == "start_challenge") {
        console.log("Challenge mode started!")
        flashlight.strobe(25); // Flashing at 25ms intervals.
      } else {
        // Strobing needs to stop, then the flashlight can be turned off. Otherwise it could remain on.
        flashlight.stop();
        flashlight.off();
      }
    })
    // Updating the highscore. This is not secure.
    socket.on("new_highscore", (new_highscore) => {
      highscore = new_highscore;
    })
    // When the websocket receives the play_music message, it plays the appropriate track.
    // The track is passed as a socket.io argument.
    socket.on("play_music", (track) => {
      switch (track) {
        case "mario":
          // Taken from https://github.com/julianduque/j5-songs
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
          // Masterfully composed by yours truly.
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
    // Makes the player jump when the button is pressed.
    button.on("press", () => {
      socket.emit("input_jump");
    });
    // The potentiometer sends very noisy signals, which need to be cleaned up on the client-side.
    // The potentiometer controls the two backgrounds the client can see.
    potMeter.on("change", () => {
      const { value, raw } = potMeter;
      socket.emit("background_change", value);
    })
  })
})
// Running the express server.
app.listen(port, () => {
  console.log("Express listening on port" + port);
})
