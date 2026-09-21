/* URL-triggered commands.

   Opening this page runs one command against a JetKVM tab and closes itself:

     chrome-extension://<id>/cmd/cmd.html?key=F2
     chrome-extension://<id>/cmd/cmd.html?text=root%0A&target=rack-01
     chrome-extension://<id>/cmd/cmd.html?screenshot=bios
     chrome-extension://<id>/cmd/cmd.html?record=start

   The tab stays open showing the reason when something fails. */

const params = new URLSearchParams(window.location.search);
const status = document.querySelector('#status');

run();

async function run() {
	const command = buildCommand();
	if (!command) return showReference();

	const target = await findTarget(params.get('target'));
	if (target.error) return fail(target.error);

	const result = await chrome.tabs.sendMessage(target.tabId, command).catch(err => ({ ok: false, error: String(err.message || err) }));
	if (!result.ok) return fail(result.error);

	if (params.has('keep')) {
		status.textContent = `Done on ${target.name}.`;
		document.querySelector('main').style.display = 'block';
		return;
	}

	const self = await chrome.tabs.getCurrent();
	chrome.tabs.remove(self.id);
}

function buildCommand() {
	if (params.has('text')) {
		return { type: 'jetkvm-type', text: params.get('text'), delay: number('delay') };
	}
	if (params.has('key')) {
		const modifiers = params.get('modifiers');
		return { type: 'jetkvm-key', code: params.get('key'), modifiers: modifiers ? modifiers.split(',') : [], hold: number('hold') };
	}
	if (params.has('steps')) {
		return { type: 'jetkvm-steps', steps: JSON.parse(params.get('steps')) };
	}
	if (params.has('screenshot')) {
		return { type: 'jetkvm-screenshot', download: true, name: params.get('screenshot') };
	}
	if (params.has('record')) {
		return { type: 'jetkvm-record', action: params.get('record'), download: true, name: params.get('name') };
	}
	return null;
}

function number(name) {
	return params.has(name) ? Number(params.get(name)) : undefined;
}

// Content scripts answer a ping only on a JetKVM page, so the open tabs are the
// device list — nothing to keep in sync.
async function findTarget(target) {
	const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
	const replies = await Promise.all(tabs.map(async tab => {
		const res = await chrome.tabs.sendMessage(tab.id, { type: 'jetkvm-ping' }).catch(() => null);
		return res && res.jetkvm ? { tabId: tab.id, name: res.name, url: res.url } : null;
	}));

	const found = replies.filter(Boolean);
	if (!found.length) return { error: 'No JetKVM tab is open.' };

	if (!target) {
		if (found.length === 1) return found[0];
		return { error: `Several JetKVM tabs are open — add &target= one of: ${found.map(f => f.name).join(', ')}` };
	}

	const needle = target.toLowerCase();
	const matches = found.filter(f => f.name.toLowerCase().includes(needle) || f.url.toLowerCase().includes(needle));
	if (matches.length === 1) return matches[0];

	return { error: matches.length
		? `"${target}" matches ${matches.map(m => m.name).join(', ')}`
		: `No JetKVM tab matching "${target}". Open: ${found.map(f => f.name).join(', ')}` };
}

function fail(message) {
	status.textContent = message;
	status.className = 'error';
	document.querySelector('main').style.display = 'block';
}

// Opened with no parameters, this page is its own documentation.
function showReference() {
	status.textContent = 'Add a parameter to this URL to run a command.';
	document.querySelector('#help').style.display = 'block';
	document.querySelector('main').style.display = 'block';
}
