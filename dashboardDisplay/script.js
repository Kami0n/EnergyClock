let cx, cy;
let secondsRadius;
let minutesRadius;
let hoursRadius;
let clockDiameter;
let varDrawWedge = false;
let sunrise = 0;
let sunset = 0;
let diplayMinutes = false;
let receivedMessage = '';
let wedgeHours = null;
let wedgeStart = null;
let wedgeEnd = null;
const zeroPad = (num, places) => String(num).padStart(places, '0')
let sizeScreen = 1;
let winWidth = 500, winHeight = 500;

let socketNodeRed;
function connect1() {
	socketNodeRed = new WebSocket("ws://localhost:1880/ws/ura");
	socketNodeRed.onopen = function(e) {
		console.log("[WS open] connection established /ws/ura");
	};
	socketNodeRed.onclose = function(event) {
		if (event.wasClean) {
			console.log(`[WS close] connection closed cleanly, code=${event.code} reason=${event.reason}`);
		} else {
			// e.g. server process killed or network down
			// event.code is usually 1006 in this case
			console.log('[WS close] connection died');
			connect1();
		}
	};
	socketNodeRed.onerror = function(error) {
		console.log(`[WS error] ${error.message}`);
	};
	socketNodeRed.onmessage = function(event) {
		console.log(`[WS message] data received from server: ${event.data}`);
		//receivedMessage = JSON.parse(event.data);
	};
}
connect1();

let socketPublish;
function connect2() {
	socketPublish = new WebSocket("ws://localhost:1880/ws/publish");
	socketPublish.onopen = function(e) {
		console.log("[WS open] connection established /ws/publish");
		socketNodeRed.send('{"request":true}');
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

		if(receivedMessage.results){
			varDrawWedge = receivedMessage.isDay;
			sunrise = timeToRadian(receivedMessage.results.sunrise, false);
			sunset = timeToRadian(receivedMessage.results.sunset, false);
		}

		if(receivedMessage.allHours){
			wedgeHours = receivedMessage.allHours;
		}

		if(receivedMessage.start && receivedMessage.end){
			wedgeStart = receivedMessage.start;
			wedgeEnd = receivedMessage.end;
		}

		if(receivedMessage.clear){
			wedgeHours = null;
			wedgeStart = null;
			wedgeEnd = null;
			varDrawWedge = false;
		}

	};
}
connect2();

function setup() {
	//winWidth = windowWidth;
	//winHeight = windowHeight;
	createCanvas(winWidth, winHeight);
	sizeItems();
}

function windowResized() {
	console.log("Window resized");
	//winWidth = windowWidth;
	//winHeight = windowHeight;
	resizeCanvas(winWidth, winHeight);
	sizeItems();
}

function sizeItems(){

	if(height > width ){
		sizeScreen = width / 1000;
	}else{
		sizeScreen = height / 1000;
	}

	stroke(255);
	let radius = min(width, height) / 2;
	clockDiameter = radius * 1.95;

	// Oznake
	ticksRadius = radius * 0.80;
	minutesDisplayRadius = radius * 0.89;
	hoursDisplayRadius = radius * 0.89;

	// Night/Day arch
	nightDayRadius = hoursDisplayRadius * 2;
	wedgeRadius = hoursDisplayRadius * 1.85;

	// Kazalci
	secondsRadius = radius * 0.9;
	minutesRadius = radius * 0.8
	hoursRadius = radius * 0.7;

	cx = width / 2;
	cy = height / 2;
}

function draw() {

	clear();
	background(255);

	// Draw the clock background
	noStroke();
	fill(33);
	ellipse(cx, cy, clockDiameter + 5, clockDiameter + 5);
	fill("white");
	ellipse(cx, cy, clockDiameter, clockDiameter);



	drawGreenWedge();



	fill(33);
	// Angles for sin() and cos() start at 3 o'clock;
	// subtract HALF_PI to make them start at the top
	let s = map(second(), 0, 60, 0, TWO_PI) - HALF_PI;
	let m = map(minute() + norm(second(), 0, 60), 0, 60, 0, TWO_PI) - HALF_PI;
	let h = map(hour() + norm(minute(), 0, 60), 0, 24, 0, TWO_PI * 2) - HALF_PI;



	// Draw the minute ticks
	strokeWeight(2*sizeScreen);
	beginShape(POINTS);
	for (let a = 0; a < 360; a += 6) {
		let angle = radians(a);
		let x = cx + cos(angle) * secondsRadius;
		let y = cy + sin(angle) * secondsRadius;
		//vertex(x, y);
	}
	endShape();

	let displayHours = 0;
	fill(33);
	stroke(33);
	// Hour numbers
	textSize(60*sizeScreen);
	textFont('Koulen');
	textAlign(CENTER, CENTER);
	let KoulenOffset = 12*sizeScreen;

	for (let a = 0; a < 360; a += 6) {
		let angle = radians(a);
		let xh = cx + cos(angle-HALF_PI) * hoursDisplayRadius;
		let yh = cy + sin(angle-HALF_PI) * hoursDisplayRadius;

		strokeWeight(0);
		if(a % 90 == 0) {
			if(a == 0){
				text(12, xh, yh+KoulenOffset);
				displayHours++
			}else{
				text(displayHours++, xh, yh+KoulenOffset);
			}
		} else if(a % 30 == 0) {
			text(displayHours++, xh, yh);
		} else {
			strokeWeight(5*sizeScreen);
			beginShape(POINTS);
			vertex(xh, yh);
			endShape();
		}
	}

	// Draw the hands of the clock
	ellipse(cx, cy, 20*sizeScreen, 20*sizeScreen);
	strokeWeight(6*sizeScreen);
	line(cx, cy, cx + cos(h) * hoursRadius, cy + sin(h) * hoursRadius);
	stroke(33);
	strokeWeight(4*sizeScreen);
	line(cx, cy, cx + cos(m) * minutesRadius, cy + sin(m) * minutesRadius);


	stroke("red");
	strokeWeight(2*sizeScreen);
	line(cx, cy, cx + cos(s) * secondsRadius, cy + sin(s) * secondsRadius);
	fill("red");
	ellipse(cx, cy, 15*sizeScreen, 15*sizeScreen);

}

function drawWedge(cx, cy, from, to, color){
	fill(color);
	arc(cx, cy, wedgeRadius, wedgeRadius,timeToRadian(from), timeToRadian(to));
}

function drawGreenWedge(){
	if( wedgeStart != null && wedgeEnd != null ){
		drawWedge(cx, cy, wedgeStart, wedgeEnd, "#03c03c");
	}
}

function timeToRadian(time, utc = true, clockType=12){
	let d = new Date(time);
	let h;
	if(clockType == 24){
		if(utc){
			h = map(d.getUTCHours() + norm(d.getUTCMinutes(), 0, 60), 0, clockType, 0, TWO_PI) - HALF_PI + PI;
		}else{
			h = map(d.getHours() + norm(d.getMinutes(), 0, 60), 0, clockType, 0, TWO_PI) - HALF_PI + PI;
		}
	}
	else if(clockType == 12){
		if(utc){
			h = map(d.getUTCHours() + norm(d.getUTCMinutes(), 0, 60), 0, clockType, 0, TWO_PI) - HALF_PI;
		}else{
			h = map(d.getHours() + norm(d.getMinutes(), 0, 60), 0, clockType, 0, TWO_PI) - HALF_PI ;
		}
	}
	return h;
}

function drawArc(cx, cy, nightDayRadius, nightDayRadius, sunset, sunrise) {
	noFill();
	strokeWeight(50);
	strokeCap(ROUND);
	stroke('#d9d9d9');
	arc(cx, cy, nightDayRadius, nightDayRadius, sunset, sunrise);
	noStroke();
}








function drawGreenHours(){
	if(wedgeHours != null){
		//const start = hour();
		const start = 0;
		for (let i = start; i < 24; i++) {
			if(wedgeHours[i]){
				drawWedge(cx, cy, "2022-04-23T"+zeroPad(i, 2)+":00:00+00:00", "2022-04-23T"+zeroPad(i+1, 2)+":01:00+00:00", ( i>hour()) ? "#03c03c" : "#edf5ef");
			}
		}
	}
}

function drawOld() {
	background(255);

	// Draw the clock background
	noStroke();
	fill(33);
	ellipse(cx, cy, clockDiameter + 5, clockDiameter + 5);
	fill("white");
	ellipse(cx, cy, clockDiameter, clockDiameter);

	// draw night/day
	drawArc(cx, cy, nightDayRadius, nightDayRadius, sunset, sunrise);

	// draw green wedge
	//drawGreenHours()
	drawGreenWedge()

	// Angles for sin() and cos() start at horizontal right
	// subtract HALF_PI to make them start at the top
	const twopi = TWO_PI; // p5js throws error if TWO_PI is directly in map function....
	//let s = map(second(), 0, 60, 0, twopi) - HALF_PI;
	if(diplayMinutes){
		let m = map(minute() + norm(second(), 0, 60), 0, 60, 0, twopi) - HALF_PI;
	}
	let h = map(hour() + norm(minute(), 0, 60), 0, 24, 0, twopi) - HALF_PI + PI;

	//stroke(33);
	// Draw the ticks
	let displayMinutes = 0;
	let displayHours = 0;
	fill(0, 0, 0);
	textAlign(CENTER, CENTER);

	// Minute numbers
	if(diplayMinutes){
		textSize(16);
		for (let a = 0; a < 360; a += 6) {
			let angle = radians(a);

			/*
			if(a % 90 == 0) {
				strokeWeight(30);
			} else if(a % 30 == 0) {
				strokeWeight(20);
			} else {
				strokeWeight(5);
			}
			
			let x = cx + cos(angle-HALF_PI) * ticksRadius;
			let y = cy + sin(angle-HALF_PI) * ticksRadius;
			beginShape(POINTS);
			vertex(x, y);
			endShape();
			*/
			let xm = cx + cos(angle-HALF_PI) * minutesDisplayRadius;
			let ym = cy + sin(angle-HALF_PI) * minutesDisplayRadius;

			if(a % 30 == 0) {
				text(displayMinutes, xm, ym);
			}
			displayMinutes++;4
		}
	}
	// Hour numbers
	textSize(30);
	for (let a = 0; a < 360; a += 15) {
		let angle = radians(a);
		if(a % 90 == 0) {
			//strokeWeight(30);
		} else if(a % 30 == 0) {
			//strokeWeight(20);
		} else {
			//strokeWeight(5);
		}

		let xh = cx + cos(angle-HALF_PI + PI) * hoursDisplayRadius;
		let yh = cy + sin(angle-HALF_PI + PI) * hoursDisplayRadius;
		text(displayHours++, xh, yh);
	}

	// Draw the hands of the clock
	// Hours
	strokeCap(ROUND);
	stroke(33);
	strokeWeight(2);
	strokeCap(ROUND);
	line(cx, cy, cx + cos(h) * hoursRadius, cy + sin(h) * hoursRadius);
	strokeWeight(2);
	fill("white");
	ellipse(cx, cy, 20, 20);

	// Minutes
	if(diplayMinutes){
		line(cx, cy, cx + cos(m) * minutesRadius, cy + sin(m) * minutesRadius);
		strokeWeight(2);
		fill("white");
		ellipse(cx, cy, 6, 6);
	}

	/*// Seconds
	stroke(255, 0, 0);
	strokeWeight(2);
	line(cx, cy, cx + cos(s) * secondsRadius, cy + sin(s) * secondsRadius);
	*/
}
//-----------------------------
let socketSlika;
var razpolozljivo = 70;

function connect3() {
	socketPublish = new WebSocket("ws://localhost:1880/ws/slika");
	socketPublish.onopen = function(e) {
		console.log("[WS open] connection established /ws/slika");
		socketNodeRed.send('{"request":true}');
	};
	socketPublish.onclose = function(event) {
		if (event.wasClean) {
			console.log(`[WS close] connection closed cleanly, code=${event.code} reason=${event.reason}`);
		} else {
			// e.g. server process killed or network down
			// event.code is usually 1006 in this case
			console.log('[WS close] connection died');
			connect3();
		}
	};
	socketPublish.onerror = function(error) {
		console.log(`[WS error] ${error.message}`);
	};
	socketPublish.onmessage = function(event) {
		console.log(`[WS message] data received from server: ${event.data}`);
		receivedMessage = JSON.parse(event.data);

		if(receivedMessage.greenkw){
			razpolozljivo = receivedMessage.greenkw*10;
			//console.log("raz: " + receivedMessage.greenkw*10);
			preglej(receivedMessage.consumers);
		}
	};
}
connect3();



let pomivalni_stroj = {
	active:false,
	poraba:10,
	slikaActive:"images/stroj_ready.png",
	slikaInactive:"images/stroj_unready.png",
	element:  "washing",
	slikaCurrent: "washing",
	id: "washing_wop"

};
let conditioning = {
	id:"conditioning",
	active:false,
	poraba:45,
	slikaActive:"images/conditioning_ready.png",
	slikaInactive:"images/conditioning_unready.png",
	element: "conditioning",
	slikaCurrent:"conditioning"
};
let dryer = {
	id:"dryer",
	active:false,
	poraba:20,
	slikaActive:"images/dryer_ready.png",
	slikaInactive:"images/dryer_unready.png",
	element: "dryer",
	slikaCurrent:"dryer"
};
let heater = {
	id:"heating",
	active:false,
	poraba:20,
	slikaActive:"images/heater_ready.png",
	slikaInactive:"images/heater_unready.png",
	element: "heater",
	slikaCurrent:"heater"
};
let light = {
	id:"light",
	active:false,
	poraba:5,
	slikaActive:"images/light_ready.png",
	slikaInactive:"images/light_unready.png",
	element: "light",
	slikaCurrent:"light"
};
let car = {
	id:"car",
	active:false,
	poraba:50,
	slikaActive:"images/car_ready.png",
	slikaInactive:"images/car_unready.png",
	element: "car",
	slikaCurrent:"car"
};
let romba = {
	id:"rumba",
	active:false,
	poraba:5,
	slikaActive:"images/romba_ready.png",
	slikaInactive:"images/romba_unready.png",
	element: "romba",
	slikaCurrent:"romba"
};


let seznamnaprav = [
	pomivalni_stroj,
	car,
	heater,
	light,
	romba
];
function pobarvaj() {
	//console.log("barvam");
	seznamnaprav.forEach(element => {
		console.log(element.slikaCurrent + ": "+ razpolozljivo + " / " + element.poraba);

		if(element.active === false){
			console.log(element.slikaCurrent + ": SPREMINJAM ");

			if (element.poraba <= razpolozljivo){
				document.getElementById(element.slikaCurrent).src = element.slikaActive;
			}
			else {
				document.getElementById(element.slikaCurrent).src = element.slikaInactive;
			}
		}



	})
}
function resetbarve() {
	pomivalni_stroj.active = false;
	car.active = false;
	heater.active = false;
	light.active = false;
	romba.active = false;


	//console.log("barvam");
	seznamnaprav.forEach(element => {
		document.getElementById(element.slikaCurrent).style.opacity="1";
		document.getElementById(element.slikaCurrent).src = element.slikaInactive;
		console.log(element.slikaCurrent+"_wop");
		document.getElementById(element.slikaCurrent+"_wop").setAttribute("hidden","hidden");
	})
}


function preglej(prizganeNaprave) {
	resetbarve();
	prizganeNaprave.sort(function(a, b){return b.value - a.value});

	prizganeNaprave.forEach(element => {
		izberi(element.name);
	});
	pobarvaj();



}

function izberi(id) {
	//console.log("izbiram");

	let object = null;
	if (id === "washing machine"){
		id = "washing";
		object = pomivalni_stroj;
		pomivalni_stroj.active = true;

	}
	else if (id === "car"){
		object = car;
		car.active= true;
	}
	else if (id === "conditioning"){
		object = conditioning;
		conditioning.active= true;

	}
	else if (id === "dryer"){
		object = dryer;
		dryer.active= true;

	}
	else if (id === "heating"){
		id="heater";
		object = heater;
		heater.active= true;


	}
	else if (id === "light"){
		object = light;
		light.active= true;

	}
	else if (id === "rumba"){
		id = "romba";
		object = romba;
		romba.active= true;

	}
	else {
		alert("cant find the reffered object with the name "+id)
		return;
	}

	if (object.poraba <= razpolozljivo){
		document.getElementById(object.slikaCurrent).src = object.slikaActive;
	}
	else {
		document.getElementById(object.slikaCurrent).src = object.slikaInactive;
	}

	document.getElementById(id+"_wop").removeAttribute("hidden");
	document.getElementById(id).style.opacity="0.3";

	razpolozljivo = razpolozljivo - object.poraba;
	console.log("PORABAAAA: " +razpolozljivo);

	//window.onload = pobarvaj();

}
