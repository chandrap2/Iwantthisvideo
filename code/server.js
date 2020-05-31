const express = require("express")
const app = express()
const port = 3001

const fs = require("fs");

const Twit = require("twit");
var T;

var num = 0;

// app.get("/", (request, response) => {
// 	let home = fs.readFileSync("../index.html", "utf8");
// 	response.send(home);
// });
//
// app.get("/getvids", (request, response) => {
// 	// response.send("test")
// 	update(response.send);
// });
//
// app.listen(port, () => {
// 	init();
// 	console.log(`Server listening at http://localhost:${port}`);
// });

// Twitter authorization
function init() {
	let auth_tokens = fs.readFileSync("./twit_auth.txt", "utf8");
	auth_tokens = JSON.parse(auth_tokens);
	T = new Twit(auth_tokens);
}

// Retrieve list of friends => saveUsers()
// function update(vidResultsFunc) {
function update() {
	// T.get("friends/list", {skip_status: true, include_user_entities: false, count: 200}, (err, data, response) => saveUsers(err, data, response, vidResultsFunc));
	T.get("friends/list", {skip_status: true, include_user_entities: false, count: 200}, (err, data, response) => saveUsers(err, data, response));
}

// Retrieve Tweets from each user => getVids()
// function saveUsers(err, data, response, vidResultsFunc) {
function saveUsers(err, data, response) {
	data = data.users;

	for (i in data) {
		let friend = data[i];
		let name = friend.screen_name;
		// console.log(name)

		T.get("statuses/user_timeline", {screen_name: name, exclude_replies: true, count: 20}, (err, data, response) => getVids(err, data, response));
		// T.get("statuses/user_timeline", {screen_name: name, exclude_replies: true, count: 20}).then(function(data) {
		// 		getVids(null, data, null);
		// 	}).catch(function(err) {
		// 		console.log("failure" + err.stack)
		// 	});
	}
}

// Output video URL's from a user's most recent Tweets
// function getVids(err, data, response, vidResultsFunc) {
function getVids(err, data, response) {
	if (data.length > 0) { // if tweets were returned
		let name = data[0].user.name;
		let screen_name = data[0].user.screen_name;
		let output = `${name} ( @${screen_name} ):\n`;

		let videos_found = false;
		for (i in data) { // look at each tweet
			let entities = data[i].extended_entities
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
				output += `${vid_obj.url}\n`;
			} // if (entities != undefined && ...
		} // for (i in data)


		if (videos_found) { // only output if account Tweeted videos
			console.log(++num);
			console.log(output);
			// vidResultsFunc(output);
		}
	}
}

function test(data) {
	// console.log(data[0].entities.media)
	console.log(data[0].extended_entities);
}

init();
// T.get("statuses/user_timeline", {screen_name: "VideosFolder", exclude_replies: true, count: 20}, (err, data, response) => getVids(err, data, response));
// T.get("statuses/user_timeline", {screen_name: "brendohare", exclude_replies: true, count: 20}, (err, data, response) => getVids(err, data, response));
// getVids(friendsList);

update();
