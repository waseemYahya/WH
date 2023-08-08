
const express = require("express"); 
// יודע לקחת כתובת ולעשות עליה מנפלוציה
const path = require("path")
const http = require("http");
const cors = require("cors");

require("./db/mongoContact");
const {routesInit} = require("./routes/config_route");

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname,"public")));
app.use(cors());

routesInit(app);


const server = http.createServer(app);

let port = process.env.PORT || "3002"; 
server.listen(port);