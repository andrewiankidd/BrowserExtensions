/* Option keys + defaults */
const OPTIONS = {
	enableScreenshot: true,
	enableRecord: true,
	enableScripting: false
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
		if (id === 'enableScripting') showCommandUrl(items[id]);
	});
	el.addEventListener('change', async () => {
		if (id === 'enableScripting' && el.checked && !(await ensureHostAccess())) {
			el.checked = false;
			return;
		}
		setLocalData(id, el.checked);
		if (id === 'enableScripting') showCommandUrl(el.checked);
	});
}

/* Firefox treats host_permissions as opt-in, so ask before commands need them */
async function ensureHostAccess() {
	const origins = ['http://*/*', 'https://*/*'];
	if (await chrome.permissions.contains({ origins })) return true;
	return await chrome.permissions.request({ origins });
}

/* The extension id is only knowable at runtime, so show the URL to script against */
function showCommandUrl(enabled) {
	document.querySelector('#scriptSettings').disabled = !enabled;
	const field = document.querySelector('#commandUrl');
	field.value = chrome.runtime.getURL('cmd/cmd.html');
	field.addEventListener('focus', () => field.select());
}

Object.entries(OPTIONS).forEach(([key, def]) => bindOption(key, def));

document.querySelector('#sourceLink').href = chrome.runtime.getManifest().homepage_url;
