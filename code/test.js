new Promise(() => {
	if (1 == 1) resolve(true);
	else reject(false);
}).then((results) => {
	console.log(results);
}).catch((results) => {
	console.log(results);
});
