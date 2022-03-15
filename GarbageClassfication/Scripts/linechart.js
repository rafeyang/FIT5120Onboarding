function draw(divID) {
	var drawID = '#' + divID;
	var width = 500, height = 300;

	function lineChart(y1, p1) {
		let dataset = Array.map(function (item, i) {
			i++;
			return { year: y1[i], value: p1[i] }
		});

		d3.select(drawID).select('svg').remove();
		var padding = { top: 10, right: 30, bottom: 50, left: 50 };
		var line_chart = d3.select(drawID).append('svg')
			.attr("width", width).attr("height", height).append('g')
			.attr('transform', "translate(" + padding.left + ',' + padding.top + ')');

		var xScale = d3.scale.linear()
			.domain(d3.extent(dataset, function (d) {
				return d.year;
			}))
			.range([0, width - padding.left - padding.right]);
		var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient('bottom');
		line_chart.append('g')
			.attr('class', 'axis')
			.attr('transform', 'translate(0,' + (height - padding.top - padding.bottom) + ')')
			.call(xAxis)
			.append('text')
			.text("Year")
			.attr("dx", "400px")
			.attr("dy", "-10px");

		var yScale = d3.scale.linear()
			.domain(dataset, function (d) {
				return d.value;
			})
			.range([height - padding.top - padding.bottom, 0]);
		var yAxis = d3.svg.axis()
			.scale(yScale)
			.orient('left');
		line_chart.append('g')
			.attr('class', 'axis')
			.call(yAxis)
			.append('text')
			.text("Total Assets(trillion)")
			.attr("dx", "3px")
			.attr("dy", "10px");

		line_chart.selectAll('text')
			.attr('font-size', '12px')
			.style('fill', 'rgb(255,255,255')


		var line = d3.svg.line()
			.x(function (d) {
				return xScale(d.year)
			})
			.y(function (d) {
				return yScale(d.value);
			})
			.interpolate('linear');

		line_chart.append('path')
			.attr('class', 'line')
			.attr('stroke', 'rgb(255,255,255)')
			.attr('fill', 'none')
			.attr('d', line(dataset));

		line_chart.selectAll('path')
			.attr('stroke', 'rgb(255,255,255)')
			.attr('fill', 'none')

		line_chart.selectAll('circle')
			.data(dataset)
			.enter()
			.append('circle')
			.attr('cx', function (d) {
				return xScale(d.year);
			})
			.attr('cy', function (d) {
				return yScale(d.value);
			})
			.attr('r', 5)
			.attr('fill', 'rgb(179, 178, 125)')
			.on('mouseover', mouseover)
			.on('mouseout', mouseout)
			.on('mousemove', tipPos);
	}

	function mouseover(datum) {
		tooltip.style("display", "block")
		tooltip.select("#tooltip-text")
			.text(datum.value + " trillion");

	}

	function mouseout() {
		tooltip.style("display", "none");
	}

	function tipPos() {
		tooltip
			.style("left", (mouseLocation()["x"] + 10 + "px"))
			.style("top", (mouseLocation()["y"] + 10 + "px"));
	}

	function mouseLocation(e) {
		e = e || window.event;
		var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;//ie||chrome
		var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
		var x = e.pageX || (e.clientX + scrollX);//firefox
		var y = e.pageY || (e.clientY + scrollY);
		return { "x": x, "y": y };
	}
}