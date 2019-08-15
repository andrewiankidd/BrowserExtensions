function loadOptions() {
	console.log('Loading options...');

	document.querySelectorAll('input').forEach(option => {
		console.log('> Loading: ' + option.id);

		let opt = {};
		opt[option.id] = false;

		chrome.storage.local.get(opt, function (items) {
			option.checked = items[option.id];
		});
	});
}

function saveOptions() {
	console.log('Saving options...');

	document.querySelectorAll('input').forEach(option => {
		console.log('> Saving: ' + option.id);

		let opt = {};
		opt[option.id] = option.checked;

		chrome.storage.local.set(opt);
	});
}

document.querySelectorAll('input').forEach(el => {
	el.addEventListener('change', saveOptions);
});

loadOptions();
