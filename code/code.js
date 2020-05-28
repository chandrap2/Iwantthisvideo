var fs = require("fs");

var Twit = require("twit");
var T;

// Twitter authorization
function init() {
	let auth_tokens = fs.readFileSync("./twit_auth.txt", "utf8");
	auth_tokens = JSON.parse(auth_tokens);
	T = new Twit(auth_tokens);
}

// Retrieve list of friends => saveUsers()
function update() {
	T.get("friends/list", {skip_status: true, include_user_entities: false, count: 200}, (err, data, response) => saveUsers(err, data, response));
}

// Retrieve Tweets from each user => getVids()
function saveUsers(err, data, response) {
	data = data.users;

	for (i in data) {
		let friend = data[i];
		let name = friend.screen_name;

		T.get("statuses/user_timeline", {screen_name: name, exclude_replies: true, count: 20}, (err, data, response) => getVids(err, data, response));
	}
}

// Output video URL's from a user's most recent Tweets
function getVids(err, data, response) {
	if (data.length > 0) { // if tweets were returned
		let name = data[0].user.name;
		let screen_name = data[0].user.screen_name;
		// console.log(name, "(", screen_name, ")", ":");
		// let output = '${name} (@${screen_name}):\n';
		let output = name + " (" + screen_name + "):\n";

		let videos_found = false;
		for (i in data) { // look at each tweet
			let entities = data[i].extended_entities
			if (entities != undefined &&
			entities.media[0] != undefined
			&& entities.media[0].type == "video") { // if tweet contains video
				videos_found = true

				let variants = entities.media[0].video_info.variants; // parse through video metadata
				for (j in variants) { // output first mp4 file encountered
					if (variants[j].content_type == "video/mp4") {
						// console.log(variants[j].url);
						url = variants[j].url + "\n"
						output += url
						break;
					}
				} // for (j in variants)
			} // if (entities != undefined && ...
		} // for (i in data)

		// console.log(videos_found)
		if (videos_found) {
			console.log(output)
		}

	}
}

function test(data) {
	console.log(data[0].entities.media)
}

// T.get("statuses/user_timeline", {screen_name: "VideosFolder", exclude_replies: true, count: 1}, (err, data, response) => lol(err, data, response));
// T.get("statuses/user_timeline", {screen_name: "VideosFolder", exclude_replies: true, count: 1}, (err, data, response) => test(data));
// T.get("statuses/user_timeline", {screen_name: "killmefam	", exclude_replies: true, count: 1, trim_user: true}, (err, data, response) => lol(err, data, response));
// getVids(friendsList);
init();
update();
