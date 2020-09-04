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

// app.use(cors({ origin: 'https://cleanup.drw0o7cx6sm26.amplifyapp.com', credentials: true })); // beginner frontend
// app.use(cors({ origin: 'https://master.d3hzc83ckxw5ab.amplifyapp.com', credentials: true })); // react frontend
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // local test
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

app.get("/verify", async (req, res1) => {
    // console.log(req);
    // console.log(res1);

    let cks = req.cookies;
    // console.log(cks);

    if (isLoggedIn(cks)) {
        let auth_tokens = await readAppToken();
        auth_tokens.access_token_key = req.cookies.accToken;
        auth_tokens.access_token_secret = req.cookies.accTokenSec;
        // console.log(auth_tokens);
        T = new Twit(auth_tokens);

        let acc = await T.get("account/verify_credentials", { skip_status: true });
        res1.json(acc);
    } else {
        res1.json({});
    }
});

app.get("/get_req_token", async (req, res1) => {
    let consumer_auth = await readAppToken();
    T = new Twit(consumer_auth);

    // let req_token = await T.getRequestToken("https://master.drw0o7cx6sm26.amplifyapp.com/test.html"); // beginner frontend
    let req_token = await T.getRequestToken("http://localhost:3000/redir.html"); // local test
    // let req_token = await T.getRequestToken("https://master.d3hzc83ckxw5ab.amplifyapp.com/redir.html"); // react frontends
    res1.json(req_token);
});

app.get("/redir", async (req, res1) => {
    let consumer_auth = await readAppToken();
    T = new Twit(consumer_auth);

    let accessTokVerifier = req.query;
    let res2 = await T.getAccessToken(accessTokVerifier);

    consumer_auth.access_token_key = res2.oauth_token;
    consumer_auth.access_token_secret = res2.oauth_token_secret;
    T = new Twit(consumer_auth);

    res1.cookie("accToken", res2.oauth_token, { sameSite: "None", secure: true });
    res1.cookie("accTokenSec", res2.oauth_token_secret, { sameSite: "None", secure: true });
    res1.json({});
});

app.get("/is_logged_in", (req, res1) => {
    let cks = req.cookies;
    let response = (isLoggedIn(cks)) ? { signedIn: true } : { signedIn: false };
    res1.json(response);
});

app.get("/get_accs", async (req, res1) => {
    let cks = req.cookies;

    if (isLoggedIn(cks)) {
        let auth_tokens = await readAppToken();
        auth_tokens.access_token_key = req.cookies.accToken;
        auth_tokens.access_token_secret = req.cookies.accTokenSec;
        T = new Twit(auth_tokens);

        let list = await T.get("friends/list", { skip_status: true, include_user_entities: false, count: 200 });
        res1.json(list.users);
    }
});

app.get("/get_timeline", async (req, res1) => {
    let cks = req.cookies;

    if (isLoggedIn(cks)) {
        let auth_tokens = await readAppToken();
        auth_tokens.access_token_key = req.cookies.accToken;
        auth_tokens.access_token_secret = req.cookies.accTokenSec;
        T = new Twit(auth_tokens);

        // let list = await T.get("statuses/home_timeline", { count: 10, exclude_replies: true });
        // res1.json(list);

        try {
            let tweets = await T.get("statuses/home_timeline",
                { count: 200, exclude_replies: true });
            res1.json(getTweets(tweets));
        } catch (err) {
            console.log(`Something went wrong getting the timeline}`);
            console.log(`\t${err}`);
            res1.json([ ]);
        }
    }
});

app.get("/get_vids", async (req, res1) => {
    let cks = req.cookies;
    let name = req.query.acc_name;

    if (isLoggedIn(cks)) {
        let auth_tokens = await readAppToken();
        auth_tokens.access_token_key = req.cookies.accToken;
        auth_tokens.access_token_secret = req.cookies.accTokenSec;
        T = new Twit(auth_tokens);
        
        try {
            let tweets = await T.get("statuses/user_timeline",
                { screen_name: name, exclude_replies: true, trim_user: true, count: 20 });
            let final = { vids: getTweets(tweets) };
            final.id = parseInt(req.query.id);
            res1.json(final);
        } catch (err) {
            console.log(`Something went wrong getting tweets by ${name}`);
            console.log(`\t${err}`);
            res1.json({ vids: [] });
        }
    }
});

app.get("/array_test", (req, res) => {
    res.json(["chandra", "pand"]);
});

function getTweets(results) {
    let vidTweets = [];

    if (results.length > 0) { // if tweets were returned
        results.forEach(result => {
            let entities = result.extended_entities;
            if (entities && entities.media[0].type == "video") vidTweets.push(result);
        });
    }

    return vidTweets;
}

async function readAppToken() {
    let file = await s3.getObject(fileParams).promise();
    let result = JSON.parse(file.Body.toString("utf8"));
    return result;
}

function isLoggedIn(cks) {
    return cks.accToken &&
        cks.accToken != "undefined" && cks.accTokenSec != "undefined";
}

module.exports = app;
