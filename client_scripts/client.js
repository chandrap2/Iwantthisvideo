let btn, results_area;
let num_accs;

let input = document.getElementById("input");
input.innerHTML = "<p>Loading...</p>";
let buttonHTML = "<button id=\"retrieve\">Retrieve videos</button>"

let accTimer = setInterval(() => {
	let req = new XMLHttpRequest();
	req.open("GET", "http://localhost:3001/check_accs");
	req.onload = () => {
		// console.log(req.responseText);
		let results = JSON.parse(req.responseText);

		if (results.accs_found) {
			console.log(`${results.num_accs} accs found`);
			num_accs = results.num_accs;
			input.innerHTML = buttonHTML;

			new Promise((res, rej) => {
				clearInterval(accTimer); res();
			}).then(() => mn());
		}
	};
	req.send();
}, 500);

// Handles front end logic
function mn() {
	btn = document.getElementById("retrieve");
	results_area = document.getElementById("results");

	btn.addEventListener("click", () => {
		results_area.innerHTML = ""; // clearing 'results' section

		// for (i = 0; i < 5; i++) {
		for (i = 0; i < 5; i++) {
			let req = new XMLHttpRequest(); // AJAX request for each account
			req.open("GET", `http://localhost:3001/getvids?acc_index=${i}`)
			req.onload = () => {
				let results = JSON.parse(req.responseText);
				outputResults(results);
			};
			req.send();
		}
	});
}

// Outputs to 'result' section
let outputResults = (data) => {
	let acc = data;
	if (acc.name && acc.vids.length > 0) {
		let result_HTML_str = "<div class=\"result\">";

		let accInfo = `<h3>${acc.name} ( @${acc.screen_name} )</h3>`;
		// results_area.insertAdjacentHTML("beforeend", `<h3>${accInfo}</h3>`);
		result_HTML_str += accInfo

		acc.vids.forEach(v => {
			// results_area.
			// insertAdjacentHTML("beforeend", `<a href = ${v}><p>${v}</p></a>`)
			result_HTML_str += `<a href = ${v}><p>${v}</p></a>`;
		});

		result_HTML_str += "</div>"

		results_area.insertAdjacentHTML("beforeend", result_HTML_str);
		results_area.insertAdjacentHTML("beforeend", "</br>");
	}
}
