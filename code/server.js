const Twit = require("twitter-lite");
var T;

const fs = require("fs");

const express = require("express")
const app = express()
const port = 3001
app.set("views", __dirname)
app.use(express.static(__dirname + "/../client_scripts"))

let users = { }, valid_users = false;

// Listen on port 3000
app.listen(port, () => {
	init();
	console.log(`Server listening at http://localhost:${port}`);
});

// Home page
app.get("/", (request, response) => {
	response.sendFile("index.html", {root: __dirname + "/../views"});

	T.get("friends/list", {skip_status: true, include_user_entities: false, count: 200}).then((results) => {
		users = results.users;
		valid_users = true;
	});
});

app.get("/check_users", (request, response) => {
	result = { users_found: null, num_users: null };
	if (valid_users) {
		result.users_found = true;
		result.num_users = users.length;
		console.log(result);
	}

	response.json(result);
});

// Results page
app.get("/getvids", (request, response) => {
	let i = request.query.user_index;
	let user = users[i];
	// console.log(user);

	T.get("statuses/user_timeline",
	{screen_name: user.screen_name, exclude_replies: true, count: 20})
	.then(results => response.json(getVids(results)) );
});

// Twitter authorization
function init() {
	let auth_tokens = fs.readFileSync("./twit_auth.txt", "utf8");
	auth_tokens = JSON.parse(auth_tokens);
	T = new Twit(auth_tokens);
}

// Retrieve list of friends => saveUsers()
function update(promiseObj, num_accs = -1) {
	T.get("friends/list", {skip_status: true, include_user_entities: false, count: 200}).then((results) => {
		saveUsers(results, num_accs, promiseObj);
	}).catch(console.error);
}

// Output video URL's from a user's most recent Tweets
function getVids(results) {
	let output = { };

	if (results.length > 0) { // if tweets were returned
		output.name = results[0].user.name;
		output.screen_name = results[0].user.screen_name;
		output.vids = []
		// output += `${name} ( @${screen_name} ):\n`;

		let videos_found = false;
		for (i in results) { // look at each tweet
			let entities = results[i].extended_entities
			if (entities != undefined &&
			entities.media[0].type == "video") { // if tweet contains video
				videos_found = true

				let variants = entities.media[0].video_info.variants; // parse through video metadata
				let max_bitrate = -1
				let vid_obj = variants[0];
				for (j in variants) { // output highest quality video url
					if (variants[j].content_type == "video/mp4" &&
					variants[j].bitrate > max_bitrate) {
						vid_obj = variants[j];
						max_bitrate = variants[j].bitrate;
					}
				} // for (j in variants)
				output.vids.push(`${vid_obj.url}`);
			} // if (entities != undefined && ...
		} // for (i in data)
	}

	return output;
}

function test(results) {
	// console.log(data[0].entities.media)
	console.log(data[0].extended_entities);
}

// init();
// update(5);

// T.get("statuses/user_timeline", {screen_name: "VideosFolder", exclude_replies: true, count: 20}, (err, data, response) => getVids(err, data, response));
// T.get("statuses/user_timeline", {screen_name: "brendohare", exclude_replies: true, count: 20}, (err, data, response) => getVids(err, data, response));
// getVids(friendsList);
