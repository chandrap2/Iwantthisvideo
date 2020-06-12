let loading = document.createElement("p");
loading.id = "loading";
loading.innerText = "Loading...";

let retrieveBtn = document.createElement("button");
retrieveBtn.className = "button";
retrieveBtn.id = "retrieve";
retrieveBtn.textContent = "Retrieve videos";

let input = document.getElementById("input");
input.appendChild(loading);

let btn, results_area = document.getElementById("results");
let num_accs;
let ACC_LIMIT;

let accTimer = setInterval(() => {
	let req = new XMLHttpRequest();
	req.open("GET", "http://localhost:3001/check_accs");
	req.onload = () => {
		let results = JSON.parse(req.responseText);

		if (results.accs_found) {
			num_accs = results.num_accs;
			console.log(`${num_accs} accs found`);

			document.getElementById("loading").remove();
			input.insertAdjacentElement("beforeend", retrieveBtn);
			
			clearInterval(accTimer);
			ACC_LIMIT = 10;
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
				console.log(results.id); // for comparing response order to request order
				
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
	let acc = data;
	if (acc.name && acc.vids.length > 0) {
		let result_box = document.createElement("div");
		result_box.className = "result";

		let frag = document.createDocumentFragment();

		let accInfo = document.createElement("h2");
		accInfo.innerText = `${acc.name} (@${acc.screen_name})`;
		result_box.appendChild(accInfo);

		let vid_box;
		acc.vids.forEach(v => {
			vid_box = document.createElement("video");
			vid_box.setAttribute("width", 200);
			vid_box.setAttribute("height", 200);
			vid_box.setAttribute("controls", true);
			vid_box.setAttribute("src", v.vid);
			// vid_box.setAttribute("poster", v.thumbnail);
			// vid_box.setAttribute("autoplay", true); // Instant Death

			result_box.appendChild(vid_box);
		});

		results_area.appendChild(result_box);
		results_area.appendChild(document.createElement("br"));
	}
}
