/* Option keys + defaults */
const OPTIONS = {
	enableDeleteAutofill: true,
	enableCancelAndSync: true
};

/* Storage helpers */
function getLocalData(key, callback) {
	chrome.storage.local.get(key, function (result) {
		console.log(`Get->Key '${key}':`, result[key]);
		callback(result[key]);
	});
}

function setLocalData(key, value, callback = null) {
	chrome.storage.local.set({ [key]: value }, function () {
		console.log(`Set->Key '${key}':`, value);
		if (callback) callback();
	});
}

/* Wire up checkboxes */
function bindOption(id, defaultValue) {
	const el = document.querySelector(`#${id}`);
	if (!el) return;
	chrome.storage.local.get({ [id]: defaultValue }, items => {
		el.checked = items[id];
	});
	el.addEventListener('change', () => {
		setLocalData(id, el.checked);
	});
}

Object.entries(OPTIONS).forEach(([key, def]) => bindOption(key, def));
