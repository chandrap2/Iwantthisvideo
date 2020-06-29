document.addEventListener("DOMContentLoaded", () => {
	// console.log(document);

	let user, user_pic;

	let signinBtn = document.getElementById("login-btn");
	signinBtn.addEventListener("click", () => {
		let req = new XMLHttpRequest();
		req.open("GET", "http://localhost:3001/oauth1");
		req.onload = () => {
			let req_token = JSON.parse(req.responseText);
			// console.log(req_token);
			
			let url = new URL("https://api.twitter.com/oauth/authenticate");
			url.searchParams.set("oauth_token", req_token.oauth_token);
			
			let params = "menubar=no,toolbar=no,width=600,height=600";
			auth_window = window.open(url, "test", params);
			closeRedir();
			// console.log("ready to authenticate");
		}
		
		req.send();
	});

	let signoutBtn = document.getElementById("logout-btn");

	let input = document.getElementById("input");
	
	let loading = document.getElementById("loading");
	let retrieveBtn = document.getElementById("retrieve");
	
	let results_area = document.getElementById("results");
	
	let accs, ACC_LIMIT;
	let j = 0; // count how many accounts have been processed
	const pic_url_mod = 7 // "_normal".length;
	let df = document.createDocumentFragment();
	
	let auth_window;

	if (document.cookie.length != 0) {
		closeRedir();
	} else {
		signinBtn.style.display = "";
	}
	
	signoutBtn.addEventListener("click", () => {
		let req = new XMLHttpRequest();
		req.open("GET", "http://localhost:3001/logout");
		
		req.onload = () => {
			results_area.innerHTML = "";
			input.style.display = "none";
			document.getElementById("signed-in").style.display = "none";
			signoutBtn.style.display = "none";
			signinBtn.style.display = "";

			accs = null;
			ACC_LIMIT = j = 0;
		}

		req.send();
	});

	function closeRedir() {
		let closeAuthTimer = setInterval(() => {
			let req = new XMLHttpRequest();
			req.open("GET", "http://localhost:3001/close_auth");
			req.onload = () => {
				clearInterval(closeAuthTimer);
				// console.log(JSON.parse(req.responseText));
				signinBtn.style.display = "none";
				
				user = JSON.parse(req.responseText);
				user_pic = document.getElementById("user-pic");
				user_pic.setAttribute("src", user.profile_image_url_https);
				user_pic.style.display = "";
				
				document.getElementById("signed-in").style.display = "";
				document.getElementById("signed-in").style.paddingRight = "16px";
				signoutBtn.style.display = "";
				
				if (auth_window) auth_window.close();

				getAccs();
			}
			req.send();
		}, 1000);
	}

	function getAccs() {
		input.style.display = "";

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
						
						let acc_header = document.createElement("div");
						acc_header.className = "acc_header";
						
						let accInfo = document.createElement("h2");
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
						
						// box.style.display = "none";
						// let br = document.createElement("br");
						// br.style.display = "none";

						// df.appendChild(box);
						// df.appendChild(br);
						
						acc.box = box;
					});
					// results_area.appendChild(df);
					console.log(`done processing, ${accs.length} accs found`);
					
					loading.style.display = "none";
					retrieveBtn.style.display = "";
					
					ACC_LIMIT = accs.length;
					// ACC_LIMIT = 50;
					mn();
				} else {
					loading.style.display = "none";
					document.getElementById("no-accs").style.display = "";
				}

				clearInterval(accTimer);
			};

			req.send();
		}, 500);
	}

	// Handles front end logic
	function mn() {
		retrieveBtn.addEventListener("click", () => {
			df = document.createDocumentFragment();
			// results_area.style.display = "";
			j = 0;
			
			loading.style.display = "";
			retrieveBtn.style.display = "none";

			results_area.innerHTML = ""; // clearing 'results' section
			
			for (let i = 0; i < ACC_LIMIT; i++) {
			// for (let i = 29; i >= 0; i--) {
				let req = new XMLHttpRequest(); // AJAX request for each account
				req.open("GET", `http://localhost:3001/getvids?acc_index=${i}`)
				// console.log("a");
				
				req.onload = () => {
					j++;
					// console.log(j);
					let results = JSON.parse(req.responseText);
					outputResults(results);
					if (df.childElementCount % 10 == 0) {
						// console.log(df.childElementCount);
						results_area.appendChild(df);
						df = document.createDocumentFragment();
					}
					
					if (j == ACC_LIMIT) {
					// if (j == 30) {
						setTimeout(() => {
							loading.style.display = "none";
							retrieveBtn.style.display = "";

							results_area.appendChild(df);
							// console.log(df);
						}, 500);
					}
				};
				req.send();
			}
		});
	}
	
	// Appends to a document fragment, which will later be appended to DOM
	let outputResults = (data) => {
		let acc = accs[data.id];
		if (data.vids && data.vids.length > 0) {
			let box = acc.box;
			if (box.childElementCount > 2) box.removeChild(box.lastElementChild); // popping old vids
			
			let vids = document.createElement("div");
			let vid_box;
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
			// box.style.display = "";
			// box.nextSibling.style.display = "";
			// console.log(box.childElementCount);
			
			df.appendChild(box);
			df.appendChild(document.createElement("br"));
		}
	}
});
