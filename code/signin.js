const Twit = require("twitter-lite");
var T;

const fs = require("fs");

const express = require("express")
const app = express()
const port = 3001
app.set("views", __dirname)
app.use(express.static(__dirname + "/../client_scripts"))
app.use(express.static(__dirname + "/../styles"))

var stuff;

// Listen on port 3001
app.listen(port, () => {
    init();
    console.log(`Server listening at http://localhost:${port}`);
});

// Home page
app.get("/", (request, response) => {
    response.sendFile("test.html", {root: __dirname + "/../views"});
});

// Get Twitter user access token
app.get("/oauth1", (request, response) => {
    console.log("oauth");
    response.json(stuff);
});

// Get Twitter user access token
app.get("/welcome", (request, response) => {
    response.sendFile("welcome.html", {root: __dirname + "/../views"});
});

// Twitter authorization (user auth, lower rate limits)
function init() {
    let auth_tokens = fs.readFileSync("./twit_auth2.txt", "utf8");
    auth_tokens = JSON.parse(auth_tokens);
    T = new Twit(auth_tokens);

    T.getRequestToken("http://localhost:3001/welcome").then(res => {
        stuff = res;
        // console.log(res);
    }).catch(console.error);
}