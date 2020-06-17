const Twit = require("twitter-lite");
var T;

const fs = require("fs");

const express = require("express")
const app = express()
const port = 3001
app.set("views", __dirname)
app.use(express.static(__dirname + "/../client_scripts"))
app.use(express.static(__dirname + "/../styles"))

let accs = [];

// Listen on port 3001
app.listen(port, () => {
	init();
	console.log(`Server listening at http://localhost:${port}`);
});

// Home page
app.get("/", (request, response) => {
	response.sendFile("index.html", {root: __dirname + "/../views"});

	// Rate limits: 15/15mins
	T.get("friends/list", {skip_status: true, include_user_entities: false, count: 200})
		.then(results => accs = results.users)
		.catch(err => console.log(err));
});

// Verifies account list has been assembled
app.get("/check_accs", (request, response) => {
	if (accs.length > 0) response.json( {accs: accs} );
});

// Send results
app.get("/getvids", (request, response) => {
	let i = request.query.acc_index;
	let acc = accs[i];

	// Rate limits: 900/15mins, 100k/day
	T.get("statuses/user_timeline",
	{screen_name: acc.screen_name, exclude_replies: true, trim_user: true, count: 20})
		.then(results => {
			let final = getVids(results);
			final.id = i;
			response.json(final);
		}).catch(err => {
			err = { };
			err.id = i;
			response.json(err);
		});
});

// Twitter authorization (user auth, lower rate limits)
function init() {
	let auth_tokens = fs.readFileSync("./twit_auth.txt", "utf8");
	auth_tokens = JSON.parse(auth_tokens);
	T = new Twit(auth_tokens);
}

// Output video URL's from a user's most recent Tweets
function getVids(results) {
	let output = { };
	
	if (results.length > 0) { // if tweets were returned
		output.vids = []

		for (i in results) { // look at each tweet
			let entities = results[i].extended_entities
			if (entities != undefined &&
			entities.media[0].type == "video") { // if tweet contains video
				let thumbnail = results[i].entities.media[0].media_url_https;
				let vid_obj = { thumbnail: thumbnail };

				let variants = entities.media[0].video_info.variants; // parse through video metadata
				for (j in variants) { // output highest quality video url
					if (variants[j].content_type == "video/mp4") {
						vid_obj.vid = variants[j].url;
						output.vids.push(vid_obj);
						break;
					}
				} // for (j in variants)
			} // if (entities != undefined && ...
		} // for (i in data)
	}

	return output;
}

function test(results) {
	// console.log(data[0].entities.media)
	console.log(results[0]);
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
