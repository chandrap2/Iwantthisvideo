const Twit = require("twitter-lite");
var T;

const fs = require("fs");
const token_path = "./twit_auth2.txt";

const express = require("express");
const cookieParser = require("cookie-parser");
const app = express()
const port = 3001

app.set("views", __dirname)
app.use(express.static(__dirname + "/../client_scripts"))
app.use(express.static(__dirname + "/../styles"))
app.use(cookieParser())

let user;
// let accs = [];

// let accessToken;
let accessTknAuthorized = false;

// Listen on port 3001
app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
	init();
});

// Home page
app.get("/", (request, response) => {
	// response.clearCookie("naaame");
	// console.log("signin page");
	// console.log(request.headers);
	let cks = request.cookies;
	console.log(cks);
	
	if (cks.accToken &&
			cks.accToken != "undefined" && cks.accTokenSec != "undefined") {
		let auth_tokens = readAppToken(token_path);
		auth_tokens.access_token_key = request.cookies.accToken;
		auth_tokens.access_token_secret = request.cookies.accTokenSec;
		// console.log(auth_tokens);
		T = new Twit(auth_tokens);

		T.get("account/verify_credentials").then(res => {
			user = res;
			response.sendFile("index.html", { root: __dirname + "/../views" });
			accessTknAuthorized = true;
			// console.log("AUTHORIZED");
		}).catch(err => console.log("after access token", err));
	} else {
		response.sendFile("index.html", { root: __dirname + "/../views" });
	}
});

// Get Twitter user access token
app.get("/oauth1", (request, response) => {
	T.getRequestToken("http://localhost:3001/redir").then(res => {
		// console.log(res);
		response.json(res);
	}).catch("console.error");
});

app.get("/redir", (request, response) => {
	let user_auth = request.query;
	// accessTknAuthorized = false;
	T.getAccessToken(user_auth).then(res => {
		// console.log(res);

		let auth_tokens = readAppToken(token_path);
		auth_tokens.access_token_key = res.oauth_token;
		auth_tokens.access_token_secret = res.oauth_token_secret;

		// console.log(auth_tokens);
		T = new Twit(auth_tokens);

		T.get("account/verify_credentials").then(res => {
			// console.log("after access token succ", res);
			user = res;
			response.sendFile("test.html", { root: __dirname + "/../views" });
			response.cookie("accToken", auth_tokens.access_token_key, { sameSite: true });
			response.cookie("accTokenSec", auth_tokens.access_token_secret, { sameSite: true });
			// console.log(auth_tokens.access_token_key);

			accessTknAuthorized = true;
			// console.log("AUTHORIZED");
		}).catch(err => console.log("after access token", err));

	}).catch(console.error);
});

app.get("/close_auth", (requeest, response) => {
	T.get("account/verify_credentials");

	if (accessTknAuthorized) {
		accessTknAuthorized = false;

		// Rate limits: 15/15mins
		T.get("friends/list", { skip_status: true, include_user_entities: false, count: 200 })
			.then(results => {
				response.json(user);
			})
			.catch(err => console.log(T));
	}
});

app.get("/logout", (request, response) => {
	init();
	response.json();
});

// Verifies account list has been assembled
app.get("/check_accs", (request, response) => {
	response.json({ accs: accs });
});

// Send results
app.get("/getvids", (request, response) => {
	let name = request.query.acc_name;
	// let acc = accs[i];

	// Rate limits: 900/15mins, 100k/day
	T.get("statuses/user_timeline",
		{ screen_name: name, exclude_replies: true, trim_user: true, count: 20 })
		.then(results => {
			let final = getVids(results);
			// final.id = i;
			response.json(final);
		}).catch(err => {
			console.log(err);
			err = {};
			// err.id = i;
			response.json(err);
		});
});

// Twitter authorization (user auth, lower rate limits)
function init() {
	let auth_tokens = readAppToken(token_path);
	// if (accessToken) auth_tokens = {...auth_tokens, ...accessToken};

	T = new Twit(auth_tokens);
}

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

function test(results) {
	console.log(results[0].entities.media[0])
	// console.log(results[0]);
}

// init();
// T.get("statuses/user_timeline",
// {screen_name: "VideosFolder", exclude_replies: true, count: 5, trim_user: true}).then((results) => {
// 	test(results);
// });
// T.get("friends/list", {skip_status: true, include_user_entities: true, count: 200})
// 	.then(results => console.log(results.users[0]));

// T.get("statuses/user_timeline", {screen_name: "brendohare", exclude_replies: true, count: 20}, (err, data, response) => getVids(err, data, response));
// getVids(friendsList);
