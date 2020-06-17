let loading, retrieveBtn = document.createElement("button");
retrieveBtn.id = "retrieve";
retrieveBtn.textContent = "Retrieve videos";

let input = document.getElementById("input");
let results_area = document.getElementById("results");

let accs, ACC_LIMIT;
let j = 0; // count how many accounts have been processed

let accTimer = setInterval(() => {
	let req = new XMLHttpRequest();
	req.open("GET", "http://localhost:3001/check_accs");
	req.onload = () => {
		let results = JSON.parse(req.responseText);
		
		if (results.accs.length > 0) {
			accs = results.accs;
			accs.forEach(acc => {
				let box = document.createElement("div");
				box.className = "result";
				box.addEventListener("click", () => {
					let vids = box.children[2];
					dropped_down = (vids.style.display == "");

					vids.style.display = (dropped_down) ? "none" : "";
				});

				let acc_header = document.createElement("div");
				acc_header.className = "acc_header";
				
				let accInfo = document.createElement("h1");
				accInfo.textContent = `${acc.name} (@${acc.screen_name})`;
				let prof_pic = document.createElement("img");
				prof_pic.setAttribute("src", acc.profile_image_url_https);

				acc_header.appendChild(prof_pic);
				acc_header.appendChild(accInfo);
				box.appendChild(acc_header);
				box.appendChild(document.createElement("br"));
				
				acc.box = box;
			});
			console.log(`done processing, ${accs.length} accs found`);
			
			loading = document.getElementById("loading");
			input.removeChild(loading);
			input.appendChild(retrieveBtn);

			clearInterval(accTimer);
			ACC_LIMIT = accs.length;
			mn();
		}
	};
	req.send();
}, 250);

// Handles front end logic
function mn() {
	retrieveBtn.addEventListener("click", () => {
		let finalHTML = document.createDocumentFragment();
		j = 0;
		
		input.removeChild(retrieveBtn);
		input.appendChild(loading);
		results_area.innerHTML = ""; // clearing 'results' section
		
		for (let i = 0; i < ACC_LIMIT; i++) {
			let req = new XMLHttpRequest(); // AJAX request for each account
			req.open("GET", `http://localhost:3001/getvids?acc_index=${i}`)
			req.onload = () => {
				j++;
				console.log(j);
				let results = JSON.parse(req.responseText);
				outputResults(results, finalHTML);
				if (j % 10 == 0) {
					results_area.appendChild(finalHTML);
					finalHTML = document.createDocumentFragment();
				}
				
				if (j == ACC_LIMIT) {
					setTimeout(() => {
						input.removeChild(loading);
						input.appendChild(retrieveBtn);

						results_area.appendChild(finalHTML);
					}, 500);
				}
			};
			req.send();
		}
	});
}

// Outputs to 'result' section
let outputResults = (data, df) => {
	let acc = accs[data.id];
	if (data.vids && data.vids.length > 0) {
		let box = acc.box;

		let vids = document.createElement("div"), vid_box;
		for (let i in data.vids) {
			vid_box = document.createElement("video");
			vid_box.setAttribute("width", 200);
			vid_box.setAttribute("height", 200);
			vid_box.setAttribute("controls", true);
			vid_box.setAttribute("src", data.vids[i].vid);

			vids.appendChild(vid_box);
		}
		vids.style.display = "none";
		box.appendChild(vids);

		df.appendChild(box);
		df.appendChild(document.createElement("br"));
	}
}
