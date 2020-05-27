var fs = require("fs");

var Twit = require("twit");
var T;

function init() {
	let auth_tokens = fs.readFileSync("./twit_auth.txt", "utf8");
	auth_tokens = JSON.parse(auth_tokens);
	T = new Twit(auth_tokens);
}

function update() {
	T.get("friends/list", {skip_status: true, include_user_entities: false, count: 200}, (err, data, response) => saveUsers(err, data, response));
}

function saveUsers(err, data, response) {
	data = data.users;

	for (i in data) {
		let friend = data[i];
		let name = friend.screen_name;

		T.get("statuses/user_timeline", {screen_name: name, exclude_replies: true, count: 20}, (err, data, response) => getVids(err, data, response));
	}
}

function getVids(err, data, response) {
	if (data.length > 0) {
		console.log(data[0].user.screen_name, ":")

		for (i in data) {
			let entities = data[i].extended_entities
			if (entities != undefined &&
				entities.media[0] != undefined && entities.media[0].type == "video") {
				// console.log(entities.media[0])

				let variants = entities.media[0].video_info.variants;
				for (j in variants) {
					if (variants[j].content_type == "video/mp4") {
						console.log(variants[j].url);
						break;
					}
				} // for (j in variants)
			} // iff (entities != undefined && ...
		} // for (i in data)
		console.log()
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
