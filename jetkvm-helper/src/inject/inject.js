(function () {
	'use strict';

	const TAG = '[JetKVM Helper]';
	const log = (...args) => console.log(TAG, ...args);
	const sleep = ms => new Promise(r => setTimeout(r, ms));

	const options = {
		enableScreenshot: true,
		enableRecord: true,
		enableScripting: false
	};

	const ICONS = {
		screenshot: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
		record: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none"/>',
		stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/>'
	};

	let recorder = null;
	let recorderMeta = null;
	let recordChunks = [];
	let recordStartedAt = 0;
	let scheduled = false;

	chrome.storage.local.get(options, items => {
		Object.assign(options, items);
		init();
	});

	chrome.storage.onChanged.addListener((changes, area) => {
		if (area !== 'local') return;
		for (const key of Object.keys(changes)) {
			if (key in options) options[key] = changes[key].newValue;
		}
		addButtons();
	});

	function init() {
		if (!isJetKVM()) return;

		new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
		window.addEventListener('resize', schedule);
		addButtons();
		log('initialized', options);
	}

	// Mutation bursts collapse into one pass, since placing a button measures the
	// bar and that forces layout. A timer rather than a frame, so this still runs
	// while the tab is in the background.
	function schedule() {
		if (scheduled) return;
		scheduled = true;
		setTimeout(() => {
			scheduled = false;
			addButtons();
		}, 50);
	}

	function isJetKVM() {
		return /jetkvm/i.test(document.title);
	}

	function findVideo() {
		return document.querySelector('video');
	}

	function deviceName() {
		const m = document.title.match(/^(.*?)\s+-\s+JetKVM$/i);
		return (m && m[1].trim()) || window.location.hostname;
	}

	/* Buttons */

	function addButtons() {
		placeButton('screenshot', options.enableScreenshot, 'Screenshot', ICONS.screenshot, 'Save a PNG of the current frame', onScreenshotClick);
		placeButton('record', options.enableRecord, 'Record', ICONS.record, 'Record the video stream to a file', onRecordClick);
	}

	// The bar arrives in stages and its right-hand cluster is shown by a CSS
	// breakpoint rather than by mounting, so where a button belongs is re-checked
	// each pass and it moves if the answer changed. Already being in the right
	// group is the common case and costs no DOM write.
	function placeButton(name, enabled, label, icon, title, onClick) {
		const existing = document.querySelector(`[data-jetkvm-helper="${name}"]`);
		if (!enabled) {
			if (existing) existing.remove();
			return;
		}

		const anchor = findAnchorButton();
		if (!anchor) return;

		const slot = insertionSlot(anchor);
		if (existing && existing.parentElement === slot.parentElement
			&& existing.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING) return;

		slot.parentNode.insertBefore(existing || makeButton(anchor, name, label, icon, title, onClick), slot);
	}

	// Clone one of JetKVM's own buttons and swap its glyph and label, so ours
	// inherit the real thing's styling instead of imitating it. The clone carries
	// no React fiber, so the original's handler can't fire on it.
	function makeButton(anchor, name, label, icon, title, onClick) {
		const button = anchor.cloneNode(true);
		button.removeAttribute('id');
		button.dataset.jetkvmHelper = name;
		button.type = 'button';
		button.title = title;
		setIcon(button, icon);
		setLabel(button, label);
		button.addEventListener('click', e => {
			e.preventDefault();
			e.stopPropagation();
			onClick();
		});
		return button;
	}

	// Buttons can sit inside plain wrappers that carry no gap, so go in beside the
	// wrapper, as a child of the flex row that spaces the bar out.
	function insertionSlot(anchor) {
		const spaced = el => ['flex', 'inline-flex'].includes(getComputedStyle(el).display);

		let slot = anchor;
		while (slot.parentElement !== document.body && !spaced(slot.parentElement)) slot = slot.parentElement;
		return slot;
	}

	// The Extension button: first of the action bar's right-hand cluster. Found by
	// structure, since labels are localized and classes are generated.
	function findAnchorButton() {
		const video = findVideo();
		if (!video) return null;
		const videoTop = video.getBoundingClientRect().top;

		// The action bar shares an ancestor with the video; the page header doesn't.
		let scope = video.parentElement;
		let buttons = [];
		while (scope) {
			buttons = [...scope.querySelectorAll('button')]
				.filter(b => !b.dataset.jetkvmHelper)
				.map(b => ({ el: b, rect: b.getBoundingClientRect() }))
				.filter(b => b.rect.height && b.rect.bottom <= videoTop + 8);
			if (buttons.length >= 2) break;
			scope = scope.parentElement;
		}
		if (buttons.length < 2) return null;

		const top = Math.min(...buttons.map(b => b.rect.top));
		const row = buttons.filter(b => Math.abs(b.rect.top - top) < 8);
		const first = row.reduce((a, b) => (a.rect.left <= b.rect.left ? a : b)).el;
		const last = row.reduce((a, b) => (a.rect.right >= b.rect.right ? a : b)).el;
		if (first === last) return null;

		// Widen out from the right-most button until the group would take in the
		// left-most one too; what's left is the right-hand cluster.
		let cluster = last;
		while (!cluster.parentElement.contains(first)) cluster = cluster.parentElement;

		return cluster.querySelector('button:not([data-jetkvm-helper])');
	}

	function setIcon(button, icon) {
		const svg = button.querySelector('svg');
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('fill', 'none');
		svg.setAttribute('stroke', 'currentColor');
		svg.setAttribute('stroke-width', '2');
		svg.setAttribute('stroke-linecap', 'round');
		svg.setAttribute('stroke-linejoin', 'round');
		svg.innerHTML = icon;
	}

	function setLabel(button, label) {
		const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);
		let node;
		let text = null;
		while ((node = walker.nextNode())) {
			if (node.textContent.trim()) text = node;
		}
		text.textContent = label;
	}

	/* Screenshot */

	function onScreenshotClick() {
		const result = captureFrame({ download: true });
		if (!result.ok) toast(result.error, 'error');
	}

	// Mirrors jetkvm/kvm#1434: draw the frame to a canvas, re-applying the video's
	// CSS filter so the capture matches what's on screen.
	function captureFrame(opts) {
		const video = findVideo();
		if (!video || !video.videoWidth) return { ok: false, error: 'No video frame' };

		const canvas = document.createElement('canvas');
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		const ctx = canvas.getContext('2d');
		const filter = getComputedStyle(video).filter;
		if (filter !== 'none') ctx.filter = filter;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

		const name = opts.name ? `${opts.name}.png` : `JetKVM ${canvas.width}x${canvas.height} ${stamp()}.png`;
		const dataUrl = canvas.toDataURL('image/png');
		if (opts.download) saveAs(dataUrl, name);

		return { ok: true, name, width: canvas.width, height: canvas.height, data: dataUrl.split(',')[1] };
	}

	/* Recording */

	function onRecordClick() {
		if (recorder) {
			stopRecording().then(res => toast(res.ok ? `Saved ${formatBytes(res.bytes)}` : res.error, res.ok ? 'ok' : 'error'));
			return;
		}
		const res = startRecording({ download: true });
		if (!res.ok) toast(res.error, 'error');
	}

	// JetKVM puts the WebRTC stream on video.srcObject, so record those tracks.
	// A muted track isn't delivering frames and stalls the encoder, so leave it out.
	function startRecording(opts) {
		const video = findVideo();
		if (!video || !video.srcObject) return { ok: false, error: 'No video stream' };

		const tracks = video.srcObject.getTracks().filter(t => t.readyState === 'live' && !t.muted);
		if (!tracks.some(t => t.kind === 'video')) return { ok: false, error: 'No live video track' };

		recordChunks = [];
		recorder = new MediaRecorder(new MediaStream(tracks));
		recorder.ondataavailable = e => e.data.size && recordChunks.push(e.data);
		recorder.onerror = e => log('recorder error', e.error);
		recorder.start(1000);
		recordStartedAt = Date.now();
		recorderMeta = { download: !!opts.download, name: opts.name, width: video.videoWidth, height: video.videoHeight };

		markRecording(true);
		log('recording started', tracks.map(t => t.kind));
		return { ok: true };
	}

	function stopRecording() {
		return new Promise(resolve => {
			const active = recorder;
			if (!active) return resolve({ ok: false, error: 'Not recording' });

			active.onstop = () => resolve(finishRecording(active));
			// A stream that ends by itself already stopped the recorder, so there
			// would be no stop event left to wait for.
			if (active.state === 'inactive') resolve(finishRecording(active));
			else active.stop();
		});
	}

	async function finishRecording(active) {
		const meta = recorderMeta;
		const seconds = Math.round((Date.now() - recordStartedAt) / 1000);
		const mimeType = active.mimeType || 'video/webm';
		const blob = new Blob(recordChunks, { type: mimeType });
		const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
		const name = meta.name ? `${meta.name}.${extension}` : `JetKVM ${meta.width}x${meta.height} ${stamp()}.${extension}`;

		recorder = null;
		recorderMeta = null;
		recordChunks = [];
		markRecording(false);

		if (!blob.size) {
			log('no video data captured', mimeType, findVideo().srcObject.getTracks());
			return { ok: false, error: 'No video data captured — see console' };
		}

		log('recording stopped', name, blob.size, 'bytes');
		if (meta.download) {
			saveBlob(blob, name);
			return { ok: true, name, bytes: blob.size, seconds };
		}
		return { ok: true, name, bytes: blob.size, seconds, data: await blobToBase64(blob) };
	}

	function markRecording(on) {
		const button = document.querySelector('[data-jetkvm-helper="record"]');
		if (!button) return;
		setLabel(button, on ? 'Stop' : 'Record');
		setIcon(button, on ? ICONS.stop : ICONS.record);
	}

	/* Keyboard synthesis

	   JetKVM binds document-level keydown/keyup and maps event.code through its own
	   HID layer, so dispatching synthetic events reuses its layout mapping, rollover
	   and keepalive handling. Character mapping assumes a US layout on the target. */

	const LAYOUT = {};
	const KEY_NAMES = {};

	(function buildLayout() {
		const add = (ch, code, shift, keyName) => {
			LAYOUT[ch] = { code, shift: !!shift };
			KEY_NAMES[`${code}:${!!shift}`] = keyName || ch;
		};

		for (let i = 0; i < 26; i++) {
			const lower = String.fromCharCode(97 + i);
			add(lower, `Key${lower.toUpperCase()}`, false);
			add(lower.toUpperCase(), `Key${lower.toUpperCase()}`, true);
		}
		'0123456789'.split('').forEach(d => add(d, `Digit${d}`, false));
		')!@#$%^&*('.split('').forEach((ch, i) => add(ch, `Digit${i}`, true));

		[
			['-', 'Minus'], ['_', 'Minus', true],
			['=', 'Equal'], ['+', 'Equal', true],
			['[', 'BracketLeft'], ['{', 'BracketLeft', true],
			[']', 'BracketRight'], ['}', 'BracketRight', true],
			['\\', 'Backslash'], ['|', 'Backslash', true],
			[';', 'Semicolon'], [':', 'Semicolon', true],
			['\'', 'Quote'], ['"', 'Quote', true],
			[',', 'Comma'], ['<', 'Comma', true],
			['.', 'Period'], ['>', 'Period', true],
			['/', 'Slash'], ['?', 'Slash', true],
			['`', 'Backquote'], ['~', 'Backquote', true]
		].forEach(([ch, code, shift]) => add(ch, code, shift));

		add(' ', 'Space', false, ' ');
		add('\n', 'Enter', false, 'Enter');
		add('\t', 'Tab', false, 'Tab');
	})();

	const MODIFIER_FLAGS = {
		ControlLeft: 'ctrlKey', ControlRight: 'ctrlKey',
		ShiftLeft: 'shiftKey', ShiftRight: 'shiftKey',
		AltLeft: 'altKey', AltRight: 'altKey',
		MetaLeft: 'metaKey', MetaRight: 'metaKey'
	};

	function dispatchKey(code, down, state) {
		const key = MODIFIER_FLAGS[code]
			? code.replace(/(Left|Right)$/, '')
			: KEY_NAMES[`${code}:${state.shiftKey}`] || code;

		document.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', {
			key,
			code,
			bubbles: true,
			cancelable: true,
			composed: true,
			...state
		}));
	}

	async function pressChord(codes, holdMs = 30) {
		const state = { ctrlKey: false, shiftKey: false, altKey: false, metaKey: false };

		for (const code of codes) {
			if (MODIFIER_FLAGS[code]) state[MODIFIER_FLAGS[code]] = true;
			dispatchKey(code, true, state);
			await sleep(8);
		}

		await sleep(holdMs);

		for (const code of [...codes].reverse()) {
			if (MODIFIER_FLAGS[code]) state[MODIFIER_FLAGS[code]] = false;
			dispatchKey(code, false, state);
			await sleep(8);
		}
	}

	async function typeText(text, delay = 25) {
		const skipped = [];

		for (const ch of text) {
			const entry = LAYOUT[ch];
			if (!entry) {
				skipped.push(ch);
				continue;
			}
			await pressChord(entry.shift ? ['ShiftLeft', entry.code] : [entry.code], 20);
			await sleep(delay);
		}

		return { ok: true, typed: text.length - skipped.length, skipped };
	}

	/* Bridge commands */

	chrome.runtime.onMessage.addListener((msg, sender, respond) => {
		if (msg.type === 'jetkvm-ping') {
			respond({ jetkvm: isJetKVM(), name: deviceName(), url: window.location.href, recording: !!recorder });
			return;
		}

		if (!isJetKVM()) return;
		if (!options.enableScripting) {
			respond({ ok: false, error: 'Scripted input is off — turn it on in the JetKVM Helper popup' });
			return true;
		}

		handleCommand(msg).then(respond, err => respond({ ok: false, error: String(err.message || err) }));
		return true;
	});

	async function handleCommand(msg) {
		switch (msg.type) {
			case 'jetkvm-type':
				return await typeText(String(msg.text), msg.delay);

			case 'jetkvm-key':
				await pressChord([...(msg.modifiers || []), msg.code], msg.hold);
				return { ok: true };

			case 'jetkvm-steps':
				for (const step of msg.steps) {
					if (step.text != null) await typeText(String(step.text), step.typeDelay);
					else await pressChord(step.codes, step.hold);
					await sleep(step.delay == null ? 50 : step.delay);
				}
				return { ok: true, steps: msg.steps.length };

			case 'jetkvm-screenshot':
				return captureFrame({ download: !!msg.download, name: msg.name });

			case 'jetkvm-record':
				if (msg.action === 'start') return startRecording({ download: !!msg.download, name: msg.name });
				if (msg.action === 'stop') return await stopRecording();
				return { ok: true, recording: !!recorder };

			default:
				return { ok: false, error: `unknown command: ${msg.type}` };
		}
	}

	/* Helpers */

	function stamp() {
		const now = new Date();
		const pad = n => String(n).padStart(2, '0');
		return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
			` at ${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}`;
	}

	function saveAs(href, name) {
		const a = document.createElement('a');
		a.download = name;
		a.href = href;
		document.body.appendChild(a);
		a.click();
		a.remove();
	}

	// Revoking on a timer truncates the file when the download takes longer than
	// the timeout to start, so hold the URL until the page goes.
	function saveBlob(blob, name) {
		const url = URL.createObjectURL(blob);
		saveAs(url, name);
		window.addEventListener('pagehide', () => URL.revokeObjectURL(url), { once: true });
	}

	function blobToBase64(blob) {
		return new Promise(resolve => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result.split(',')[1]);
			reader.readAsDataURL(blob);
		});
	}

	function formatBytes(bytes) {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
		return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
	}

	function toast(message, kind) {
		let el = document.querySelector('#jetkvm-helper-toast');
		if (!el) {
			el = document.createElement('div');
			el.id = 'jetkvm-helper-toast';
			Object.assign(el.style, {
				position: 'fixed',
				top: '12px',
				right: '12px',
				zIndex: '2147483647',
				maxWidth: '320px',
				padding: '9px 12px',
				borderRadius: '6px',
				font: '500 12px/1.4 system-ui, sans-serif',
				background: 'rgb(15,23,42)',
				color: 'rgb(248,250,252)',
				border: '1px solid rgba(148,163,184,0.35)',
				boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
				cursor: 'pointer'
			});
			el.addEventListener('click', () => el.remove());
			document.body.appendChild(el);
		}

		el.style.borderLeft = `3px solid ${kind === 'error' ? 'rgb(248,113,113)' : 'rgb(56,189,248)'}`;
		el.textContent = message;

		clearTimeout(el.dataset.timer);
		el.dataset.timer = setTimeout(() => el.remove(), kind === 'error' ? 6000 : 2500);
	}
})();
