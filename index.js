var jf = require("johnny-five");
let express = require("express");
let path = require("path");
const app = express();
const port = 3000;
app.use(express.static(path.join(__dirname, 'arduino-control')))
var board = new jf.Board();

board.on("ready", () => {
  let led = new jf.Led(9)
  app.get("/on", (req, res) => {
    led.on();
    res.send("Turned on the led.")
  })
  app.get("/off", (req, res) => {
    led.off();
    res.send("Turned off the led.")
  })
  app.get("/toggle", (req, res) => {
    led.toggle();
    res.send("Toggled the led.")
  })

})

app.listen(port, () => {
  console.log("Express listening on port" + port);
})
