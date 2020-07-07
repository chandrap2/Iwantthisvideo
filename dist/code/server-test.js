const Twit = require("twitter-lite");
let T;

const fs = require("fs");
const token_path = "./twit_auth2.txt";

const express = require("express");
const cookieParser = require("cookie-parser");
const { response } = require("express");
const app = express()
const port = 3001

app.set("views", __dirname)
app.use(express.static(__dirname + "/../client_scripts"))
app.use(express.static(__dirname + "/../styles"))
app.use(cookieParser())

// Listen on port 3001
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    init();
});

app.get("/", (req, res) => {
    response.sendFile("index.html", { root: __dirname + "/../views" });
});

app.get("/verify", (req, res1) => {
    let cks = req.cookies;

    if (cks.accToken &&
    cks.accToken != "undefined" && cks.accTokenSec != "undefined") {
        let auth_tokens = readAppToken(token_path);
        auth_tokens.access_token_key = request.cookies.accToken;
        auth_tokens.access_token_secret = request.cookies.accTokenSec;

        T = new Twit(auth_tokens);
        T.get("account/verify_credentials")
        .then(res2 => {
            res1.json(res2);
        })
        .catch(console.err);
    }
});

app.get("/get_req_token", (req, res1) => {
    T = new Twit(readAppToken(token_path));

    T.getRequestToken("http://localhost:3001/redir")
    .then(res2 => res1.json(res2))
    .catch(console.error);
});

app.get("/redir", (req, res1) => {
    let access_auth = req.query;
    resp1.sendFile("test.htl", { root: __dirname + "/../views" });
    resp1.cookie("accToken", auth_tokens.access_token_key, { sameSite: true });
    resp1.cookie("accTokenSec", auth_tokens.access_token_secret, { sameSite: true });
});

app.get("/get_accs", (req, res1) => {
    let cks = req.cookies;

    if (cks.accToken &&
        cks.accToken != "undefined" && cks.accTokenSec != "undefined") {
        let auth_tokens = readAppToken(token_path);
        auth_tokens.access_token_key = request.cookies.accToken;
        auth_tokens.access_token_secret = request.cookies.accTokenSec;
        T = new Twit(auth_tokens);

        T.get("account/verify_credentials")
        .then(res2 => 
            T.get("friends/list", { skip_status: true, include_user_entities: false, count: 200 })
            .then(res3 => response.json({ accs: res3.users }))
            .catch(console.error)
        )
        .catch(console.err);
    }
});

app.get("/get_vids", (req, res1) => {
    let name = request.query.acc_name;
    let cks = req.cookies;

    if (cks.accToken &&
        cks.accToken != "undefined" && cks.accTokenSec != "undefined") {
        let auth_tokens = readAppToken(token_path);
        auth_tokens.access_token_key = request.cookies.accToken;
        auth_tokens.access_token_secret = request.cookies.accTokenSec;
        T = new Twit(auth_tokens);

        T.get("account/verify_credentials")
        .then(res2 => 
            T.get("statuses/user_timeline",
                { screen_name: name, exclude_replies: true, trim_user: true, count: 20 })
            .then(res3 => response.json( getVids(res3) ))
            .catch(err => response.json({ }))
        )
        .catch(console.err);
    }
});

// Output video URL's from a user's most recent Tweets
function getVids(results) {
    let output = {};

    if (results.length > 0) { // if tweets were returned
        output.vids = []

        for (i in results) { // look at each tweet
            let entities = results[i].extended_entities
            if (entities != undefined &&
                entities.media[0].type == "video") { // if tweet contains video
                let thumbnail = results[i].entities.media[0].media_url_https;
                let vid_obj = { thumbnail: thumbnail };

                let variants = entities.media[0].video_info.variants; // parse through video metadata
                let max_bitrate = -1
                let vid = variants[0];
                for (j in variants) { // output highest quality video url
                    if (variants[j].content_type == "video/mp4" &&
                        variants[j].bitrate > max_bitrate) {
                        vid = variants[j];
                        max_bitrate = variants[j].bitrate;
                    }
                } // for (j in variants)
                vid_obj.vid = vid.url;
                output.vids.push(vid_obj);
            } // if (entities != undefined && ...
        } // for (i in data)
    }

    return output;
}

function readAppToken(path) {
    let auth_tokens = fs.readFileSync(path, "utf8");
    return JSON.parse(auth_tokens);
}
