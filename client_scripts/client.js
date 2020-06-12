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
			
			new Promise((res, rej) => {
				clearInterval(accTimer); res();
			}).then(() => mn())
			.catch(err => console.log(err));
		}
	};
	req.send();
}, 500);

let ACC_LIMIT = 20;
// Handles front end logic
function mn() {
	// btn = document.getElementById("retrieve");
	
	// btn.addEventListener("click", () => {
		retrieveBtn.addEventListener("click", () => {
			input.appendChild(loading);
			results_area.innerHTML = ""; // clearing 'results' section
			
			// for (i = 0; i < 5; i++) {
				for (let i = 0; i < ACC_LIMIT; i++) {
					// for (let i = ACC_LIMIT; i >= 0; i--) {
						let req = new XMLHttpRequest(); // AJAX request for each account
						req.open("GET", `http://localhost:3001/getvids?acc_index=${i}`)
						req.onload = () => {
							let results = JSON.parse(req.responseText);
							outputResults(results);
							if (results.id == ACC_LIMIT - 1)
								document.getElementById("loading").remove();
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
