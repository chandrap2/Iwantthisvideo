// new Promise(() => {
// 	if (1 == 1) resolve(true);
// 	else reject(false);
// }).then((results) => {
// 	console.log(results);
// }).catch((results) => {
// 	console.log(results);
// });

// function a() {
// 	new Promise((res, rej) => {
// 		b(res, rej);
// 		console.log(1);
// 	}).then((results) => {
// 		console.log(results);
// 	}).catch((results) => {
// 		console.log(results);
// 	});
// }

// function b(res, rej) {
// 	c(res, rej);
// }

// function c(res, rej) {
// 	res("LOL");
// }

// a();
