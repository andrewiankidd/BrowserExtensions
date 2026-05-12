(function () {
	'use strict';

	const TAG = '[ArgoCD Helper]';
	const log = (...args) => console.log(TAG, ...args);

	const options = {
		enableDeleteAutofill: true,
		enableCancelAndSync: true
	};

	chrome.storage.local.get(options, items => {
		Object.assign(options, items);
		init();
	});

	chrome.storage.onChanged.addListener((changes, area) => {
		if (area !== 'local') return;
		for (const key of Object.keys(changes)) {
			if (key in options) options[key] = changes[key].newValue;
		}
	});

	function init() {
		const observer = new MutationObserver(() => {
			if (options.enableDeleteAutofill) enhanceDeleteDialog();
			if (options.enableCancelAndSync) enhanceSyncPanel();
		});
		observer.observe(document.documentElement, { childList: true, subtree: true });

		if (options.enableDeleteAutofill) enhanceDeleteDialog();
		if (options.enableCancelAndSync) enhanceSyncPanel();
		log('initialized', options);
	}

	/* Feature 1: Delete dialog autofill */

	function enhanceDeleteDialog() {
		// React components often omit `type` (defaults to "text" but the attribute isn't present).
		// Grab all inputs, filter to text-like types in the loop.
		const inputs = document.querySelectorAll('input:not([data-argo-helper])');
		inputs.forEach(input => {
			const t = (input.type || 'text').toLowerCase();
			if (!['text', 'search', 'url', 'email'].includes(t)) return;

			// Restrict to actual modal containers — without this, sidebar inputs
			// reach `body` whose textContent contains the open dialog's text.
			const scope = input.closest('.popup-container, .sliding-panel, .argo-form, .modal, .ant-modal');
			if (!scope) return;

			const text = scope.textContent || '';
			const match = text.match(/type\s+['"`‘’“”]([^'"`‘’“”\n]+)['"`‘’“”]\s+to\s+confirm/i);
			if (!match) return;

			input.dataset.argoHelper = 'true';
			const resourceName = match[1].trim();

			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'argo-button argo-button--base';
			btn.textContent = 'Autofill';
			btn.title = `Fill in "${resourceName}"`;
			btn.style.marginTop = '0.5em';
			btn.addEventListener('click', e => {
				e.preventDefault();
				e.stopPropagation();
				setReactInputValue(input, resourceName);
				input.focus();
				log('autofilled delete confirmation:', resourceName);
			});

			// Place after the whole form row rather than between input and label.
			const anchor = input.closest('.argo-form-row') || input;
			if (anchor.parentNode) {
				anchor.parentNode.insertBefore(btn, anchor.nextSibling);
			}
		});
	}

	function setReactInputValue(input, value) {
		const proto = window.HTMLInputElement.prototype;
		const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
		setter.call(input, value);
		input.dispatchEvent(new Event('input', { bubbles: true }));
		input.dispatchEvent(new Event('change', { bubbles: true }));
	}

	/* Feature 2: Cancel & Sync button */

	function enhanceSyncPanel() {
		const syncBtn = findButtonByText('SYNCHRONIZE');
		if (!syncBtn) return;
		if (syncBtn.dataset.argoHelperSibling === 'true') return;
		syncBtn.dataset.argoHelperSibling = 'true';

		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = syncBtn.className;
		btn.textContent = 'CANCEL & SYNC';
		btn.title = 'Terminate the running sync operation, then re-trigger sync with the options below.';
		btn.style.marginRight = '6px';
		btn.addEventListener('click', async e => {
			e.preventDefault();
			e.stopPropagation();
			btn.disabled = true;
			const originalText = btn.textContent;
			btn.textContent = 'CANCELLING...';
			try {
				await cancelAndSync(syncBtn);
			} catch (err) {
				log('cancel & sync failed', err);
				alert(`${TAG} cancel & sync failed: ${err.message || err}`);
			} finally {
				btn.disabled = false;
				btn.textContent = originalText;
			}
		});

		syncBtn.parentNode.insertBefore(btn, syncBtn);
		log('added Cancel & Sync button');
	}

	async function cancelAndSync(syncBtn) {
		const appName = extractAppName();
		if (!appName) throw new Error('could not determine application name');
		const appNamespace = extractAppNamespace();

		log('terminating operation for', appName, appNamespace ? `(ns=${appNamespace})` : '');
		const url = new URL(`${window.location.origin}/api/v1/applications/${encodeURIComponent(appName)}/operation`);
		if (appNamespace) url.searchParams.set('appNamespace', appNamespace);

		const res = await fetch(url.toString(), {
			method: 'DELETE',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' }
		});
		log('terminate response', res.status);
		// 200 = terminated, 400 typically means "no operation in progress" — proceed either way.

		await new Promise(r => setTimeout(r, 750));

		log('clicking original SYNCHRONIZE');
		syncBtn.click();
	}

	/* Helpers */

	function findButtonByText(text) {
		const target = text.trim().toUpperCase();
		const candidates = document.querySelectorAll('button, a.argo-button');
		for (const el of candidates) {
			if ((el.textContent || '').trim().toUpperCase() === target) return el;
		}
		return null;
	}

	function extractAppName() {
		const m = window.location.pathname.match(/\/applications\/(?:([^\/?#]+)\/)?([^\/?#]+)/);
		if (m && m[2]) return decodeURIComponent(m[2]);
		const bc = document.querySelector('.top-bar__title, [class*="breadcrumb"]');
		if (bc) {
			const parts = bc.textContent.split(/[>›\/]/).map(s => s.trim()).filter(Boolean);
			if (parts.length) return parts[parts.length - 1];
		}
		return null;
	}

	function extractAppNamespace() {
		const m = window.location.pathname.match(/\/applications\/([^\/?#]+)\/[^\/?#]+/);
		return m ? decodeURIComponent(m[1]) : null;
	}
})();
