function combSort(order, dist, amount) {
	var gap = amount;
	var swapped = false;
	while(gap > 1 || swapped) {
		gap = Math.floor((gap * 10) / 13);
		if (gap == 9 || gap == 10) {
			gap = 11;
		}
		if (gap < 1) {
			gap = 1;
		}
		swapped = false;
		for (var i=0; i<amount - gap; i++) {
			var j = i + gap;
			if (dist[i] < dist[j]) {
				[dist[i], dist[j]] = [dist[j], dist[i]]; //Swap distances
				[order[i], order[j]] = [order[j], order[i]]; //Swap sort order
				swapped = true;
			}
		}
	}
}