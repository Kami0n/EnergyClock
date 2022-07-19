let receivedMessage = '';
let result;
let socketPublish;
let icons = {'car': '\xf1b9', 'washing machine': '\uf898', 'heating': '\xf7e4', 'rumba': '\ue04e', 'light': '\uf672'}

function connect2() {
    socketPublish = new WebSocket("ws://localhost:1880/ws/slika");
    socketPublish.onopen = function(e) {
        console.log("[WS open] connection established /ws/slika");
    };
    socketPublish.onclose = function(event) {
        if (event.wasClean) {
            console.log(`[WS close] connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            // e.g. server process killed or network down
            // event.code is usually 1006 in this case
            console.log('[WS close] connection died');
            connect2();
        }
    };
    socketPublish.onerror = function(error) {
        console.log(`[WS error] ${error.message}`);
    };
    socketPublish.onmessage = function(event) {
        console.log(`[WS message] data received from server: ${event.data}`);
        receivedMessage = JSON.parse(event.data);
        if(receivedMessage.greenEnergy && receivedMessage.consumers){
            receivedMessage.consumers.sort(function(a, b){return b.value - a.value});
            var data = [{"name":"Origin","parent":"","value":0, "color":"red"}];
            var greenRemains = true;
            for (var i = 0; i < receivedMessage.consumers.length; i++) {
                var color = '#B53543';
                if (receivedMessage.greenEnergy - receivedMessage.consumers[i].value >= 0) {
                    color = '#7B955B';
                    receivedMessage.greenEnergy = receivedMessage.greenEnergy - receivedMessage.consumers[i].value;
                } else {
                    greenRemains = false;
                }
                data.push({"name": receivedMessage.consumers[i].name, "parent": "Origin", "value": receivedMessage.consumers[i].value, "color":color, "icon": icons[receivedMessage.consumers[i].name]})
            }
            if (receivedMessage.greenEnergy > 0 && greenRemains) {
                data.push({"name": '', "parent": "Origin", "value": receivedMessage.greenEnergy, "color":'white', "icon": '\ue0fe'})
            }
            clean();
            drawRects(data);
        }
    };
}
connect2();

// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var originalData = [{"name":"Origin","parent":"","value":0, "color":"red"},
    {"name":"heating","parent":"Origin","value":100, "color":"#7B955B", "icon":"\uf7e4"}];
drawRects(originalData);


function drawRects(data){
    // stratify the data: reformatting for d3.js
    var root = d3.stratify()
        .id(function(d) { return d.name; })   // Name of the entity (column name is name in csv)
        .parentId(function(d) { return d.parent; })   // Name of the parent (column name is parent in csv)
        (data);
    root.sum(function(d) { return +d.value })   // Compute the numeric value for each entity

    // Then d3.treemap computes the position of each element of the hierarchy
    // The coordinates are added to the root object above
    d3.treemap()
        .size([width, height])
        .padding(4)
        (root)

    //console.log(root.leaves())
    // use this information to add rectangles:
    svg
        .selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("stroke", "black")
        .style("fill", function (d) { return d.data.color; });

    // and to add the text labels
    svg
        .selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr("x", function(d){ return Math.abs(d.x1-d.x0)/2+d.x0 })    // +10 to adjust position (more right)
        .attr("y", function(d){ return Math.abs(d.y1-d.y0)/2+d.y0 })    // +20 to adjust position (lower)
        .text(function(d){ return d.data.name})
        .attr("font-size","30px")
        .attr("fill","white")
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "middle")

    // svg
    //     .selectAll("text")
    //     .data(root.leaves())
    //     .enter()
    //     .append("text")
    //     .attr("class","las")
    //     .attr("x", function(d){ return Math.abs(d.x1-d.x0)/2+d.x0 })    // +10 to adjust position (more right)
    //     .attr("y", function(d){ return Math.abs(d.y1-d.y0)/2+d.y0 })    // +20 to adjust position (lower)
    //     .attr("font-size","30px")
    //     .attr("fill","white")
    //     .text(function(d){ return d.data.icon})
    //     .attr("dominant-baseline", "middle")
    //     .attr("text-anchor", "middle")
}

function clean() {
    svg.selectAll('*').remove();
}