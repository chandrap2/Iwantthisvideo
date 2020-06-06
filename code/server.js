const express = require("express")
const app = express()
const port = 3001

const fs = require("fs");

const Twit = require("twitter-lite");
var T;

// Listen on port 3000
app.listen(port, () => {
	init();
	console.log(`Server listening at http://localhost:${port}`);
});

// Home page
app.get("/", (request, response) => {
	let home = fs.readFileSync("../index.html", "utf8");
	response.send(home);
});

// Results page
app.get("/getvids", (request, response) => {
	new Promise((res, rej) => {
		let promiseObj = {resolve: res, reject: rej}
		update(promiseObj);
		// update(promiseObj, 5);
	}).then((results) => {
		response.send(results);
	}).catch((err) => {
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
function saveUsers(data, num_accs, promiseObj) {
	data = data.users;
	num_accs = (num_accs == -1) ? data.length : num_accs;

	let num = 0, finalObj = {results: []};

	let processed_accs = 0;
	// Check if all users have been processed
	function finishProc(res2) {
		processed_accs++;
		new Promise((res1, rej1) => {	if (processed_accs == num_accs) res1();	})
		.then((results) => { res2(finalObj); });
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

	new Promise((res, rej) => {
		for (j = 0; j < num_accs; j++) {
			let friend = data[j], name = friend.screen_name;
			// console.log(name)

			T.get("statuses/user_timeline",
			{screen_name: name, exclude_replies: true, count: 20}).then((results) => {
				finalObj.results.push(getVids(results));
				finishProc(res);
			}).catch((err) => { // invalid/deleted user
				console.log("invalid user");
				finishProc(res);
			});
		}

	}).then((results) => {
		promiseObj.resolve(results);
	});
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
