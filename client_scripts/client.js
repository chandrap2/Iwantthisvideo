let loading, retrieveBtn = document.createElement("button");
retrieveBtn.id = "retrieve";
retrieveBtn.textContent = "Retrieve videos";

let input = document.getElementById("input");
let results_area = document.getElementById("results");

let accs, ACC_LIMIT;
let j = 0; // count how many accounts have been processed
const pic_url_mod = "_normal".length;

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
				// box.addEventListener("click", () => {
				// 	let vids = box.children[2];
				// 	dropped_down = (vids.style.display == "");

				// 	vids.style.display = (dropped_down) ? "none" : "";
				// });
				
				let acc_header = document.createElement("div");
				acc_header.className = "acc_header";
				
				let accInfo = document.createElement("h1");
				accInfo.textContent = `${acc.name} (@${acc.screen_name})`;

				let prof_pic = document.createElement("img");
				let pic_url = acc.profile_image_url_https;
				let format;
				if (pic_url[pic_url.length - 4] == ".") {
					format = pic_url.substring(pic_url.length - 4);
				} else {
					format = pic_url.substring(pic_url.length - 5);
				}
				pic_url = pic_url.substring(0, pic_url.length - pic_url_mod - format.length) + "_bigger" + format;
				prof_pic.setAttribute("src", pic_url);

				// let space = document.createElement("div");
				// space.className = "space";
				let toggle_btn = document.createElement("div");
				toggle_btn.className = "collapse";
				toggle_btn.addEventListener("click", () => {
					let vids = box.children[2];
					dropped_down = (vids.style.display == "");
	
					vids.style.display = (dropped_down) ? "none" : "";
				});
				
				// acc_header.appendChild(space);
				acc_header.appendChild(prof_pic);
				acc_header.appendChild(accInfo);
				acc_header.appendChild(toggle_btn);
				
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
				// console.log(j);
				let results = JSON.parse(req.responseText);
				outputResults(results, finalHTML);
				if (j % 20 == 0) {
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
			vid_box.setAttribute("src", data.vids[i].vid);
			vid_box.setAttribute("width", 200);
			vid_box.setAttribute("height", 200);
			vid_box.setAttribute("controls", true);
			vid_box.setAttribute("poster", data.vids[i].thumbnail);
			vid_box.setAttribute("preload", "none");

			vids.appendChild(vid_box);
		}
		vids.style.display = "none";
		box.appendChild(vids);

		df.appendChild(box);
		df.appendChild(document.createElement("br"));
	}
}
