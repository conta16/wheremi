var map = L.map('map', {
    // Set latitude and longitude of the map center (required)
    center: [44.7,10.633333],
    // Set the initial zoom level, values 0-18, where 0 is most zoomed-out (required)
    zoomControl: false,
    zoom: 3,
	minZoom: 3
});

var WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
	noWrap: true
}).addTo(map);

var bound = L.latLngBounds([[-90,-180], [90, 180]]);
map.setMaxBounds(bound);
map.on('drag', function() {
	map.panInsideBounds(bound, { animate: false });
});

Paul=new Artyom()

Paul.initialize({
	lang: 'en', //todo: change language based on location or user preferences
	continuous: true, // Listen forever
	soundex: true,// Use the soundex algorithm to increase accuracy
	debug: true, // Show messages in the console
	executionKeyword: "",//Esegui dopo questa spressione
	listen: false, // Start to listen commands !

	// If providen, you can only trigger a command if you say its name
	// e.g to trigger Good Morning, you need to say "Jarvis Good Morning"
	name: "Paul"
});

//////////////// DAVIDE - locate control ////////////

var mobile=window.matchMedia("(min-device-width : 320px)").matches;
mobile=mobile && window.matchMedia("(max-device-width : 480px)").matches;
mobile=mobile && window.matchMedia("only screen").matches;

var defaultLatLng={}
$.ajax({
	method: 'GET',
	url: 'http://ip-api.com/json',
	"content-type": 'json',
	success: function(data){
		defaultLatLng.lat=data.lat;
		defaultLatLng.lng=data.lon;
	},
	error: function(a,b,c){
		console.log(a,b,c)
	}
}).always(function() {
	var options= {setView:'always', sharePosition: true, showCompass: true, markerStyle:{radius: mobile? 18: 9}, compassStyle:{radius: mobile? 18: 9}, flyTo:true,locateOptions:{watch:true, enableHighAccuracy:true}};
	options.defaultLatLng=Object.assign({}, defaultLatLng);
	L.control.locate(options).addTo(map);
})

var world = new World();

var pointsOfInterest = world.getPointsOfInterest();

var itinerary = world.getItinerary();

var navigatorControl = new navigatorController(itinerary);

const provider = new OpenStreetMapProvider(itinerary, pointsOfInterest);

const searchControl = new GeoSearchControl({
    provider: provider,
});

/*const choiceControl = new ChoiceControl({
    provider: provider,
});*/
	  
map.addControl(searchControl);
//map.addControl(choiceControl);

L.control.zoom({
	position:'bottomleft'
}).addTo(map);

L.control.custom({
	position: 'topleft',
	content : '<a class="leaflet-bar-part leaflet-bar-part-single" width="30px" style="line-height: 26px" height="30px"><img src="./img/nav.svg" width="26px" height="26px"></img></a>',
	classes : 'leaflet-control leaflet-bar',
	events : {
		click : function(e){
			nav=new polloNavigator(navigatorControl.onpoint, navigatorControl.onend, navigatorControl.wondering);
			nav.navigate();
		},
	}
}).addTo(map);

L.control.custom({
	position: 'topleft',
	content : '<a class="leaflet-bar-part leaflet-bar-part-single" width="30px" style="line-height: 26px" height="30px"><img src="./img/create_itin.svg" width="26px" height="26px"></img></a>',
	classes : 'leaflet-control leaflet-bar',
	events : {
		click : function(e){
			createMode();
		},
	}
}).addTo(map);


L.control.custom({
	position: 'topleft',
	content : '<a class="leaflet-bar-part leaflet-bar-part-single" width="30px" style="line-height: 26px" height="30px"><img src="./img/load.svg" width="26px" height="26px"></img></a>',
	classes : 'leaflet-control leaflet-bar',
	events : {
		click : function(e){
			ldItinerary();
		},
	}
}).addTo(map);


L.control.custom({
	position: 'topleft',
	content : '<a class="leaflet-bar-part leaflet-bar-part-single" width="30px" style="line-height: 26px" height="30px"><img src="./img/create_point.svg" width="26px" height="26px"></img></a>',
	classes : 'leaflet-control leaflet-bar',
	events : {
		click : function(e){
			createPoint();
		},
	}
}).addTo(map);


L.control.custom({
	position: 'topleft',
	content : '<a class="leaflet-bar-part leaflet-bar-part-single" width="30px" style="line-height: 26px" height="30px"><img src="./img/load_point.svg" width="26px" height="26px"></img></a>',
	classes : 'leaflet-control leaflet-bar',
	events : {
		click : function(e){
			ldPoint();
		},
	}
}).addTo(map);


////////////////////////////

function loadPoints(){
	pointsOfInterest.loadPoints();
}

var buttonMode = 0;

$(document).ready(function() {
	pointsOfInterest.loadPoints();

	map.on('zoomend', loadPoints);
	
	map.on('drag', loadPoints);
});

function createMode(){
	var mode = itinerary.getMode();
	if (!mode){
		itinerary.setMode(!mode);
		map.off('zoomend', loadPoints); 
		map.off('drag', loadPoints);
		pointsOfInterest.removeAllMarkers();
		itinerary.setWaypoints([]);
		map.on('click', (e) => {
			if (itinerary.getBlock()) itinerary.setBlock(0);
			else {
				e.latLng = e.latlng;
				itinerary.pushWaypoints([e.latLng]);
			}
		});
	}
	else{
		itinerary.setMode(!mode);
		map.off('click');
		itinerary.setWaypoints([]);
		pointsOfInterest.loadPoints();
		map.on('zoomend', loadPoints);
		map.on('drag', loadPoints);
	}
}
function ldItinerary(){
	itinerary.postItineraryToDB("prova");
	itinerary.setWaypoints([]);
}

function createPoint(){
	var mode = itinerary.getMode();
	if (mode){
		map.off('click');
		itinerary.setWaypoints([]);
		pointsOfInterest.removeAllMarkers();
		itinerary.setMode(!mode);
	}
	map.on('click', (e) => {
		pointsOfInterest.addPoint(e.latlng);
	});
}

function apply(){
	pointsOfInterest.addedPoint.description = $("#popupInput").val();
	console.log($("#popupInput"));
}

function ldPoint(){
	pointsOfInterest.postAddedPoint();
}
//var collapsibleElem = document.querySelector('.collapsible');
//var collapsibleInstance = M.Collapsible.init(collapsibleElem, options);

////////////////////////////
/*
$.ajax({
	url: 'http://localhost:3000/auth/facebook',
	method: 'GET',
	success: function(){
		console.log("facebook yes");
	}
});*/

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}


