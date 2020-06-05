const express = require("express")
const app = express()
const port = 3001

const fs = require("fs");

const Twit = require("twitter-lite");
var T;

var num = 0;
var valid_results = false;

app.listen(port, () => {
	init();
	console.log(`Server listening at http://localhost:${port}`);
});

app.get("/", (request, response) => {
	let home = fs.readFileSync("../index.html", "utf8");
	response.send(home);
});

app.get("/getvids", (request, response) => {
	// response.send("test");

	new Promise((res, rej) => {
		let promiseObj = {resolve: res, reject: rej}
		update(promiseObj, 5);
	}).then((results) => {
		// console.log(results);
		response.send(`<p>${results}</p>`);
	}).catch((err) => {
		// console.log(err);
		response.send(err);
	});
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

// Retrieve Tweets from each user => getVids()
// function saveUsers(err, data, response, vidResultsFunc) {
function saveUsers(data, num_accs, promiseObj) {
	data = data.users;
	num_accs = (num_accs == -1) ? data.length : num_accs;
	// console.log(data.length)

	let latest_update_str = "";

	let processed = 0;
	function finishStr(res2) {
		new Promise((res1, rej1) => {	if (processed == num_accs) res1();	})
		.then((results) => { res2(latest_update_str); });
	}

	new Promise((res, rej) => {
		for (j = 0; j < num_accs; j++) {
			let friend = data[j];
			let name = friend.screen_name;
			// console.log(name)

			T.get("statuses/user_timeline",
			{screen_name: name, exclude_replies: true, count: 20}).then((results) => {
				latest_update_str += getVids(results);
				processed++;
				finishStr(res);
			}).catch((err) => { // invalid/deleted user
				console.log("invalid user");
				processed++;
				finishStr(res);
			});
		}

	}).then((results) => {
		// console.log("results:\n**********\n" + results);
		promiseObj.resolve("results:\n**********\n" + results);
	}).catch((results) => {
		console.log(false);
	});
}

// Output video URL's from a user's most recent Tweets
function getVids(results) {
	let output = "";

	if (results.length > 0) { // if tweets were returned
		let name = results[0].user.name;
		let screen_name = results[0].user.screen_name;
		output += `${name} ( @${screen_name} ):\n`;

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
				output += `${vid_obj.url}\n`;
			} // if (entities != undefined && ...
		} // for (i in data)

		if (videos_found) { // only output if account Tweeted videos
			console.log(++num);
			console.log(output);
			return output + "\n";
		}
	}

	return "";
}

function test(results) {
	// console.log(data[0].entities.media)
	console.log(data[0].extended_entities);
}

// init();
// T.get("statuses/user_timeline", {screen_name: "VideosFolder", exclude_replies: true, count: 20}, (err, data, response) => getVids(err, data, response));
// T.get("statuses/user_timeline", {screen_name: "brendohare", exclude_replies: true, count: 20}, (err, data, response) => getVids(err, data, response));
// getVids(friendsList);

// update(5);
