const Twit = require("twitter-lite");
let T;

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
// const port = 3001;

const AWS = require("aws-sdk");
AWS.config.update({ region: "us-west-2" });
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const fileParams = { Bucket: "twit-stuff", Key: "twit_auth2.txt" };

app.use(cors({ origin: 'https://master.drw0o7cx6sm26.amplifyapp.com', credentials: true }));
// app.use(cors({ origin: 'https://master.drw0o7cx6sm26.amplifyapp.com', credentials: true }));
app.use(cookieParser());

// app.get("/", (req, res1) => {
//     res1.send("hello");
//     // res1.status(200).send('hello world!');
// });

app.get("/clear_cookies", (req, res1) => {
    res1.clearCookie("accToken");
    res1.clearCookie("accTokenSec");
    res1.json({});
});

app.get("/verify", (req, res1) => {
    // console.log(req);
    // console.log(res1);

    let cks = req.cookies;
    // console.log(cks);

    if (cks.accToken &&
        cks.accToken != "undefined" && cks.accTokenSec != "undefined") {
        let auth_tokens = readAppToken();
        auth_tokens.access_token_key = req.cookies.accToken;
        auth_tokens.access_token_secret = req.cookies.accTokenSec;
        console.log(auth_tokens);

        T = new Twit(auth_tokens);
        T.get("account/verify_credentials")
            .then(res2 => res1.json(res2))
            .catch(err => console.log(err));
    } else {
        res1.json({});
    }
});

// app.use(cors({ origin: 'https://master.drw0o7cx6sm26.amplifyapp.com', credentials: true }));
app.get("/get_req_token", async (req, res1) => {
    // console.log(req);
    // console.log(res1);
    let consumer_auth = await readAppToken();
    T = new Twit(consumer_auth);
    // readAppToken()
    console.log("twitter:", T);
    console.log("token:", consumer_auth);

    // res1.json({ });
    let req_token = await T.getRequestToken("https://1poxidle5i.execute-api.us-west-2.amazonaws.com/production/redir");
    console.log("req:", req_token);
    res1.json(req_token);
});

app.get("/redir", (req, res1) => {
    T = new Twit(readAppToken());

    let access_auth = req.query;
    T.getAccessToken(access_auth)
        .then(res2 => {
            access_auth = readAppToken();
            access_auth.access_token_key = res2.oauth_token;
            access_auth.access_token_secret = res2.oauth_token_secret;
            T = new Twit(access_auth);

            res1.sendFile("test.html", { root: __dirname + "/../views" });
            res1.cookie("accToken", res2.oauth_token, { sameSite: true });
            res1.cookie("accTokenSec", res2.oauth_token_secret, { sameSite: true });
        })
        .catch(console.error);
});

app.get("/get_accs", (req, res1) => {
    let cks = req.cookies;

    if (cks.accToken &&
        cks.accToken != "undefined" && cks.accTokenSec != "undefined") {
        let auth_tokens = readAppToken();
        auth_tokens.access_token_key = req.cookies.accToken;
        auth_tokens.access_token_secret = req.cookies.accTokenSec;
        T = new Twit(auth_tokens);

        T.get("friends/list", { skip_status: true, include_user_entities: false, count: 200 })
            .then(res3 => res1.json({ accs: res3.users }))
            .catch(console.error)
    }
});

app.get("/get_vids", (req, res1) => {
    let name = req.query.acc_name;
    console.log(name);

    let cks = req.cookies;

    if (cks.accToken &&
        cks.accToken != "undefined" && cks.accTokenSec != "undefined") {
        let auth_tokens = readAppToken();
        auth_tokens.access_token_key = req.cookies.accToken;
        auth_tokens.access_token_secret = req.cookies.accTokenSec;
        T = new Twit(auth_tokens);

        T.get("statuses/user_timeline",
            { screen_name: name, exclude_replies: true, trim_user: true, count: 20 })
            .then(res3 => {
                let final = getVids(res3);
                final.id = parseInt(req.query.id);
                res1.json(final);
            })
            .catch(err => res1.json({}));
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
                } // for (j in varirify_credentials")
                vid_obj.vid = vid.url;
                output.vids.push(vid_obj);
            } // if (entities != undefined && ...
        } // for (i in data)
    }

    return output;
}

async function readAppToken() {
    let file = await s3.getObject(fileParams).promise();
    let result = JSON.parse(file.Body.toString("utf8"));
    console.log("data", result);

    return result;
}

module.exports = app;
