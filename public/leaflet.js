
var map = L.map('map', {
    // Set latitude and longitude of the map center (required)
    center: [44.420,10.38],
    // Set the initial zoom level, values 0-18, where 0 is most zoomed-out (required)
    zoomControl: false,
    zoom: 10
});

mapLink = 
	'<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer(
	'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; ' + mapLink + ' Contributors',
	maxZoom: 18,
	}).addTo(map);

const provider = new OpenStreetMapProvider();

const searchControl = new GeoSearchControl({
provider: provider,
});
	  
map.addControl(searchControl);


L.control.zoom({
	position:'bottomright'
}).addTo(map);