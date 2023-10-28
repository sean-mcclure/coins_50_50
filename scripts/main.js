function call_once_satisfied(props) {
    const test_condition = Function("return " + props["condition"]);
    if(test_condition()) {
        if(typeof(props.function) === "function") {
            props.function()
        } else {
            props.function()
        }
    } else {
        setTimeout(function() {
            call_once_satisfied(props)
        }, 100)
    }
}
call_once_satisfied({
    condition: "typeof(d3) !== 'undefined' && document.getElementById('bar-chart') !== null && document.getElementById('sequence-visualization') !== null",
    function: function() {
        draw();
    }
})

function draw() {
    check_flips = localStorage.getItem('number_of_flips');
    check_sequence = localStorage.getItem('sequence_length');
    if(check_flips !== null) {
        number_of_flips = Number(check_flips);
    } else {
        number_of_flips = 1000;
    }
    if(check_sequence !== null) {
        sequence_length = Number(check_sequence);
    } else {
        sequence_length = 10;
    }
    document.getElementById("flips").value = number_of_flips;
    document.getElementById("flips-value").innerText = number_of_flips;
    document.getElementById("sequence-length").value = sequence_length;
    document.getElementById("sequence-length-value").innerText = sequence_length;
   
    console.log("number_of_flips: " + number_of_flips)
    console.log("sequence_length: " + sequence_length)
    // Initialize variables for the line chart
    const margin = {
        top: 20,
        right: 50,
        bottom: 70,
        left: 30
    }; // Adjust margin as needed
    const containerWidth = document.getElementById('sequence-visualization').clientWidth - margin.left - margin.right;
    const containerHeight = document.getElementById('sequence-visualization').clientHeight - margin.top - margin.bottom;
    const svg = d3.select("#sequence-visualization").attr("width", "100%").attr("height", "100%").attr("viewBox", `0 0 ${containerWidth + margin.left + margin.right} ${containerHeight + margin.top + margin.bottom}`).attr("preserveAspectRatio", "xMinYMin meet").append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    const sequenceDiv = d3.select("#item_1");
    const totalSequences = number_of_flips; // Total number of sequences to generate
    let sequences = 0;
    let exact5050Sequences = 0;
    let probabilities = [];
    let currentSequence = "";
    // Initialize variables for the bar chart
    const barSvg = d3.select("#bar-chart");
    const barWidth = 40;
    const barPadding = 10;
    let barData = [0, 0]; // Initial data for the bar chart
    // Create an array of random coin flips
    function generateRandomSequence(length) {
        return Array.from({
            length
        }, () => (Math.random() < 0.5 ? 'H' : 'T'));
    }
    // Update the visualization
    function updateVisualization() {
        if (sequences < totalSequences) {
            const sequence = generateRandomSequence(sequence_length); // 10 coin flips for the example
            sequences++;
            const headsCount = sequence.filter(result => result === 'H').length;
            const tailsCount = sequence.length - headsCount;
    
            if (headsCount === tailsCount) {
                exact5050Sequences++;
                currentSequence += '<span style="color: red;">' + sequence.join('') + '</span> ';
            } else {
                currentSequence += sequence.join('') + ' ';
            }
    
            sequenceDiv.html(currentSequence);
           
           
           
            const probability = exact5050Sequences / sequences;
            probabilities.push(probability);
            svg.selectAll("*").remove();
            const xScale = d3.scaleLinear().domain([0, sequences]).range([0, containerWidth]);
            const yScale = d3.scaleLinear().domain([0, 1]).range([containerHeight, 0]);
            const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            g.append("path").datum(probabilities).attr("fill", "none").attr("stroke", "#3dc1d3").attr("stroke-width", 4).attr("d", d3.line().x((d, i) => xScale(i)).y(d => yScale(d)));
            g.append("g").attr("transform", "translate(0," + containerHeight + ")").call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
            g.append("g").call(d3.axisLeft(yScale));
            // Append the x-axis label with a class
            svg.append("text").attr("class", "x-axis-label").attr("text-anchor", "middle").attr("x", containerWidth / 2).attr("y", containerHeight + 60).text("Number of Flips");
            // Append the y-axis label with a class
            svg.append("text").attr("class", "y-axis-label").attr("text-anchor", "middle").attr("transform", "rotate(-90)").attr("x", -(containerHeight / 2)).attr("y", -margin.left + 10) // Adjust the distance between the y-axis label and the left margin
                .attr("dy", "1em").text("Probability");
            // Call the function recursively for continuous updates
            setTimeout(updateVisualization, 10);
        }
    }
    // Update the bar chart
    function updateBarChart() {
        barData = [exact5050Sequences, sequences - exact5050Sequences];
        const maxFlips = number_of_flips;
        const scaleFactor = barSvg.attr("height") / maxFlips;
        // Scale the bar heights if the total flips exceed the maximum
        const scaledBarData = barData.map(d => (d > maxFlips ? maxFlips : d) * scaleFactor);
        // Update bars
        const bars = barSvg.selectAll("rect").data(scaledBarData);
        bars.enter().append("rect").attr("x", (d, i) => i * (barWidth + barPadding)).attr("y", d => barSvg.attr("height") - d).attr("width", barWidth).attr("height", d => d).attr("fill", (d, i) => i === 0 ? "red" : "white").attr("class", "bar") // Add a class for styling
        bars.transition().attr("y", d => barSvg.attr("height") - d).attr("height", d => d);
        bars.exit().remove();
        // Update labels
        const labels = barSvg.selectAll(".bar-label").data(scaledBarData);
        labels.enter().append("text").attr("class", "bar-label") // Add a class for styling
            .attr("x", (d, i) => i * (barWidth + barPadding) + barWidth / 2).attr("y", d => barSvg.attr("height") - d - 5).attr("text-anchor", "middle").text((d, i) => i === 0 ? exact5050Sequences : sequences - exact5050Sequences).style("fill", (d, i) => i === 0 ? "red" : "white");;
        labels.transition().attr("x", (d, i) => i * (barWidth + barPadding) + barWidth / 2).attr("y", d => barSvg.attr("height") - d - 5).text((d, i) => i === 0 ? exact5050Sequences : sequences - exact5050Sequences);
        labels.exit().remove();

        const legendData = ['50-50 Sequences', 'Other Sequences'];

        const legend = barSvg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(0,0)"); // Adjust the position of the legend

    const colorScale = d3.scaleOrdinal()
    .domain(legendData)
    .range(['red', 'white']);

    const legendItems = legend.selectAll(".legend-item")
    .data(legendData)
    .enter().append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`); // Adjust spacing between legend items

legendItems.append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", d => colorScale(d));

legendItems.append("text")
    .attr("x", 20) // Spacing between rect and text
    .attr("y", 10)
    .attr("dy", "0.35em")
    .style("fill", "white")
    .style("font-size", 10)
    .text(d => d);








        setTimeout(updateBarChart, 10); // Update the bar chart with a delay for better visualization
    }
    // Start updating the bar chart
    updateBarChart();
    // Start updating the line chart
    updateVisualization();
    document.getElementById("sequence-length").addEventListener("change", function(e) {
        localStorage.setItem('number_of_flips', document.getElementById("flips").value);
        localStorage.setItem('sequence_length', document.getElementById("sequence-length").value);
        location.reload();
    })
    document.getElementById("flips").addEventListener("change", function(e) {
        localStorage.setItem('number_of_flips', document.getElementById("flips").value);
        localStorage.setItem('sequence_length', document.getElementById("sequence-length").value);
        location.reload();
    })
    document.getElementById("sequence-length").addEventListener("input", function(e) {
        document.getElementById("sequence-length-value").innerText = e.target.value;
    })
    document.getElementById("flips").addEventListener("input", function(e) {
        document.getElementById("flips-value").innerText = e.target.value;
    })
}