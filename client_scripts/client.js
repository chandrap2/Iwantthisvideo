let loading = document.createElement("p");
loading.id = "loading";
loading.innerText = "Loading";

let lineBreak = document.createElement("br");

let retrieveBtn = document.createElement("button");
retrieveBtn.className = "button";
retrieveBtn.id = "retrieve";
retrieveBtn.textContent = "Retrieve videos";

let input = document.getElementById("input");
input.appendChild(loading);

let btn, results_area = document.getElementById("results");
let accs, ACC_LIMIT;

let accTimer = setInterval(() => {
	let req = new XMLHttpRequest();
	req.open("GET", "http://localhost:3001/check_accs");
	req.onload = () => {
		let results = JSON.parse(req.responseText);

		if (results.accs.length > 0) {
			accs = results.accs;
			console.log(`${accs.length} accs found`);

			document.getElementById("loading").remove();
			input.insertAdjacentElement("beforeend", retrieveBtn);

			clearInterval(accTimer);
			// ACC_LIMIT = num_accs;
			ACC_LIMIT = 50;
			mn();
		}
	};
	req.send();
}, 500);

// Handles front end logic
function mn() {
	retrieveBtn.addEventListener("click", () => {
		input.removeChild(retrieveBtn);
		input.appendChild(loading);
		results_area.innerHTML = ""; // clearing 'results' section

		for (let i = 0; i < ACC_LIMIT; i++) {
			let req = new XMLHttpRequest(); // AJAX request for each account
			req.open("GET", `http://localhost:3001/getvids?acc_index=${i}`)
			req.onload = () => {
				let results = JSON.parse(req.responseText);
				outputResults(results);
				// console.log(results.id); // for comparing response order to request order

				if (results.id == ACC_LIMIT - 1) {
					/*
					Event queue order mostly corresponds to 'req.send()' order,
					but not quite guaranteed, so Timeout further ensures
					button is reloaded after last requested Twitter account
					results have been rendered.
					*/
					setTimeout(() => {
						document.getElementById("loading").remove();
						input.appendChild(retrieveBtn);
					}, 500);
				}
			};
			req.send();
		}
	});
}

// Outputs to 'result' section
let outputResults = (data) => {
	let acc = accs[data.id];
	
	if (acc.name && data.vids.length > 0) {
		let result_box = document.createElement("div");
		result_box.className = "result";

		let acc_header = document.createElement("div");
		acc_header.className = "acc_header";

		let accInfo = document.createElement("h1");
		accInfo.innerText = `${acc.name} (@${acc.screen_name})`;
		let profile_pic = document.createElement("img");
		profile_pic.setAttribute("src", acc.profile_image_url);

		acc_header.appendChild(profile_pic);
		acc_header.appendChild(accInfo);

		result_box.appendChild(acc_header);
		result_box.appendChild(document.createElement("br"));

		let vid_box;
		let vids = document.createElement("div");
		for (let i in data.vids) {
			vid_box = document.createElement("video");
			vid_box.setAttribute("width", 200);
			vid_box.setAttribute("height", 200);
			vid_box.setAttribute("controls", true);
			vid_box.setAttribute("src", data.vids[i].vid);

			vids.appendChild(vid_box);
		}
		vids.style.display = "none";
		result_box.appendChild(vids);
		// result_box.style.height = "38px";

		result_box.addEventListener("click", () => {
			let vids = result_box.children[2];
			dropped_down = (vids.style.display == "");

			if (dropped_down) {
				vids.style.display = "none";
			} else {
				vids.style.display = "";
			}
		});

		results_area.appendChild(result_box);
		results_area.appendChild(document.createElement("br"));
	}
}
