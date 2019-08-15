(function () {
	'use strict';

	let refreshMins = 5;

	setInterval(function () {
		console.log('AZ Insights Heatmap running...');
		document.querySelectorAll('.fxs-tile').forEach(x => {
			x.querySelectorAll('span[data-bind="text: longValue"]').forEach(y => {

				// Get percentage
				let match = x.innerHTML.match("(>)([0-9.].+)(%)");

				if (match) {

					// Parse as number
					match = Number(match[2]);

					// check for disableGradient
					chrome.storage.local.get({ disableGradient: false }, function (items) {
						if (items['disableGradient']) {

							// Red or Green
							if (match >= 99) {
								x.style.background = 'rgb(0, 100, 0)';
							} else {
								x.style.background = 'rgb(100, 0, 0)';
							}

						} else {

							// Generate gradient based on percentage regex
							x.style.background = `rgb(${((100 - match) * 10) * 3}, ${match}, 0)`;
						}
					});
				}
			});
		});
	}, refreshMins * 1000);
})();
