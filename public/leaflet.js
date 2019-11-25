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

var bounds = L.latLngBounds([[-90,-180], [90, 180]]);
map.setMaxBounds(bounds);
map.on('drag', function() {
	map.panInsideBounds(bounds, { animate: false });
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

L.control.custom({
	position: 'topright',
	content : '<div id="app"></div>',
	classes : 'leaflet-control leaflet-bar'
}).addTo(map);

var control;

var itinerary = new Itinerary(map,control,10);

var navigatorControl = new navigatorController(itinerary);

const provider = new OpenStreetMapProvider(itinerary);

const searchControl = new GeoSearchControl({
    provider: provider,
});

const choiceControl = new ChoiceControl({
    provider: provider,
});
	  
map.addControl(searchControl);
map.addControl(choiceControl);

L.control.zoom({
	position:'bottomleft'
}).addTo(map);

L.control.custom({
	position: 'topleft',
	content : '<a class="leaflet-bar-part leaflet-bar-part-single" width="30px" style="line-height: 26px" height="30px"><img src="nav.svg" width="26px" height="26px"></img></a>',
	classes : 'leaflet-control leaflet-bar',
	events : {
		click : function(e){
		nav=new polloNavigator(navigatorControl.onpoint, navigatorControl.onend, navigatorControl.wondering);
		nav.navigate();
		},
	}
}).addTo(map);


map.on('zoomend', function(){
	itinerary.loadItineraries();
});

map.on('drag', function(){
	itinerary.loadItineraries();
});