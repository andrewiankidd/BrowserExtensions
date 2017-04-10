(function () {
	'use strict';

	logger('Loaded');

	waitForKeyElements(".create-release-deployments-message", addButtons);
	waitForKeyElements(".release-live-logs-view, .buildvnext-logs-console", linkifyLogs);
	waitForKeyElements(".clickable-title", autoFilterKanban);

	$('body').on('click', '#vsts_selectLatest', function () {
		var parentg = $('.create-release-artifacts-grid-table');
		var dropdowns = parentg.find('div.drop.bowtie-icon.bowtie-triangle-down');
		logger('Setting latest versions');
		dropdowns.each(function () {
			$(this).trigger("click");
			var values = $(this).next();
			values.find('li').first().trigger("click");
		});
	});

	$('body').on('click', '#vsts_selectManual', function () {
		var parentg = $('.create-rel-automated-deployment-grid-table tbody');
		var dropdowns = parentg.find('div.drop.bowtie-icon.bowtie-triangle-down');
		logger('Setting Manual Deployments');
		dropdowns.each(function () {
			$(this).trigger("click");
			var values = $(this).next();
			values.find('li').last().trigger("click");
		});
	});

	function autoFilterKanban() {
		logger('filtering Kanban board');
		let myName = $('span.alignment-marker.text').text();
		// $('.agile-board-search-container input.text-filter-input').val(myName).trigger("keyup");
	}

	function addButtons() {
		if ($('#vsts_selectLatest').length) {
			logger('"Latest" button exists');
		} else {
			logger('Injecting "Latest" button');
			var verTable = $(".create-release-linked-artifacts-table-body");
			verTable.prepend("<tr><td></td><td><input type='button' id='vsts_selectLatest' value='Set Latest Versions'></td></tr>");
		}

		if ($('#vsts_selectManual').length) {
			logger('"Manual" button exists');
		} else {
			logger('Injecting "Manual" button');
			var autoTable = $(".create-rel-automated-deployment-grid-table tbody");
			autoTable.prepend("<tr><td></td><td><input type='button' id='vsts_selectManual' value='Set Manual Deployments' style='width:100%'></td></tr>");
		}
		$('#vsts_selectManual').trigger("click");
	}

	function linkifyLogs() {
		logger('not implemented');
		return;
	}

	function logger(text) {
		console.log('[VSTS Helper] ' + text);
	}

	// check for DarkMode
	chrome.storage.local.get({ darkMode: false }, function (items) {
		if (items['darkMode']) {
			logger('enabling darkMode');
			document.head.insertAdjacentHTML(
				'beforeend',
				'<link rel="stylesheet" type="text/css" href="' + chrome.runtime.getURL("inject/darkMode.css") + '">'
			);
		}
	});
})();
