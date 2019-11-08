
var map = L.map('map', {
    // Set latitude and longitude of the map center (required)
    center: [44.7,10.633333],
    // Set the initial zoom level, values 0-18, where 0 is most zoomed-out (required)
    zoomControl: false,
    zoom: 10
});

var WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
}).addTo(map);

const provider = new OpenStreetMapProvider();

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