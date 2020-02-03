var screen = 1; //whether map or menu is shown in small devices

var map = L.map('map', {
    // Set latitude and longitude of the map center (required)
    center: [44.7,10.633333],
    // Set the initial zoom level, values 0-18, where 0 is most zoomed-out (required)
    zoomControl: false,
    zoom: 3,
	minZoom: 3
});

var WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
	noWrap: true
}).addTo(map);

var bound = L.latLngBounds([[-90,-180], [90, 180]]);
map.setMaxBounds(bound);
map.on('drag', function() {
	map.panInsideBounds(bound, { animate: false });
});

Paul=new Artyom();

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

var itineraryHTML = `<div id="carouselExampleIndicators" class="carousel slide mb-1 mt-1" data-ride="carousel">
<div class="carousel-inner w-100" style="height: 300px !important"></div>
<a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
  <span class="carousel-control-prev-icon" aria-hidden="true"></span>
  <span class="sr-only">Previous</span>
</a>
<a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
  <span class="carousel-control-next-icon" aria-hidden="true"></span>
	<span class="sr-only">Next</span>
</a>
</div>

<form action="//jquery-file-upload.appspot.com/" method="post" enctype="multipart/form-data" id="exportisexcel" class="form-horizontal">
<div class="form-group">

  <div class="panel-body">
	  <div class="filesloader-wrap">
			  <div class="fileupload-buttonbar">
					<span class="btn btn-primary fileinput-button">
						<i class="fa fa-plus"></i>
						<span>Add files...</span>
						<input id="f" type="file" multiple/>
					</span>
			  </div>
	  </div>
  </div>

</div>

<div class="form-group">
  <label for="title">Title:</label>
  <textarea class="form-control" id="title"></textarea>
</div>

<div class="form-group">
  <label for="description">Description:</label>
  <textarea class="form-control" id="description" rows="3"></textarea>
</div>
</form>`

var cardHTML = `<div class="card mt-3" style="height:20%" onclick="cardClicked(this)" data-key="">
<div class="card-horizontal">
  <img class="card-img w-50" style="height: 200px" src="" alt="Card image cap">
  <div class="card-body overflow-auto">
  </div>
</div>
</div>`

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

var create = L.control.custom({
	position: 'topleft',
	content : '<a class="leaflet-bar-part leaflet-bar-part-single" width="30px" style="line-height: 26px" height="30px"><img src="./img/travel.png" width="26px" height="26px"></img></a>',
	classes : 'leaflet-control leaflet-bar',
	events : {
		click : function(e){
			createMode();
		},
	}
}); //visible when user logged in


var upload = L.control.custom({
	position: 'topleft',
	content : '<a class="leaflet-bar-part leaflet-bar-part-single" width="30px" style="line-height: 26px" height="30px"><img src="./img/upload.png" width="26px" height="26px"></img></a>',
	classes : 'leaflet-control leaflet-bar',
	events : {
		click : function(e){
			ldItinerary();
		},
	}
}); //visible when user logged in

var removeButton = 	L.control.custom({
	position: 'topleft',
	content : '<a class="leaflet-bar-part leaflet-bar-part-single" width="30px" style="line-height: 26px" height="30px"><img src="./img/load_point.svg" width="26px" height="26px"></img></a>',
	classes : 'leaflet-control leaflet-bar',
	events : {
		click : function(e){
			itinerary.removePoint();

		},
	}
});


/*L.control.custom({
	position: 'topleft',
	content : '<a class="leaflet-bar-part leaflet-bar-part-single" width="30px" style="line-height: 26px" height="30px"><img src="./img/create_point.png" width="26px" height="26px"></img></a>',
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
}).addTo(map);*/


////////////////////////////

function loadPoints(){
	pointsOfInterest.loadPoints();
}

var buttonMode = 0;

$(document).ready(function() {
	pointsOfInterest.loadPoints();

	//$('#fileupload').fileupload({ dataType: 'json' });
	if (typeof(Storage) !== "undefined" && localStorage.getItem("account")){
		console.log(localStorage.getItem("account"));
		world.setAccount(localStorage.getItem("account"));
		create.addTo(map);
		upload.addTo(map);
	}
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
		removeButton.addTo(map);
		map.on('click', (e) => {
			if (itinerary.getMode() != 2){
				pointsOfInterest.loadPoints();
				map.on('zoomend', loadPoints);
				map.on('drag', loadPoints);
				if (itinerary.getBlock()) itinerary.setBlock(0);
				else {
					e.latLng = e.latlng;
					var waypoints = itinerary.getWaypoints();
				/*if ($('#title')[0]) {
					waypoints[waypoints.length-1].title = $("#title").val();
					waypoints[waypoints.length-1].description = $("#description").val();
					for (var i in $('.carousel-item')){
						if ($('.carousel-item img')[0]) waypoints[waypoints.length-1].img.push($('.carousel-item img').eq(i).attr("src"));
					}
				}*/
				//$('#inspect').html(itineraryHTML);
					itinerary.pushWaypoints([e.latLng]);
					itinerary.c = true;
				}
			}
		});
	}
	else{
		$('#inspect').html("");
		itinerary.setMode(!mode);
		map.off('click');
		itinerary.setWaypoints([]);
		map.removeControl(removeButton);
		pointsOfInterest.loadPoints();
		map.on('zoomend', loadPoints);
		map.on('drag', loadPoints);
	}
}
function ldItinerary(){
	$('#inspect').html("");
	if (itinerary.getWaypoints().length > 1) itinerary.postItineraryToDB("prova");
	else itinerary.postPoint();
	itinerary.setWaypoints([]);
}

/*function createPoint(){
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
}*/

function apply(){
	pointsOfInterest.addedPoint.description = $("#popupInput").val();
	console.log($("#popupInput"));
}

/*function ldPoint(){
	pointsOfInterest.postAddedPoint();
}*/
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

function eventFire(el, etype){
	if (el.fireEvent) {
	  el.fireEvent('on' + etype);
	} else {
	  var evObj = document.createEvent('Events');
	  evObj.initEvent(etype, true, false);
	  el.dispatchEvent(evObj);
	}
  }

var waypoints1;
var index1;

  function loadMenu(waypoints, index, write_permit = true){
	$('#inspect').html(itineraryHTML);
	$("a[href='#feed']").removeClass("active");
	$("a[href='profile']").removeClass("active");
	$("a[href='#inspect']").addClass("active");
	$("#feed").removeClass("active show");
	$("#profile").removeClass("active show");
	$("#inspect").addClass("active show");
	if (!write_permit) {$('textarea').attr('readonly','readonly'); $("#f").attr("disabled", "disabled");}
  	var slideItem;
  	for (var i in waypoints[index].img){
	  if (i==0) slideItem = "<div class='carousel-item active'><img class='d-inline-block w-100' style='height:300px;' src='"+waypoints[index].img[0]+"' alt=''></div>";
	  else slideItem = "<div class='carousel-item'><img class='d-inline-block w-100' style='height:300px;' src='"+waypoints[index].img[i]+"' alt=''></div>";
	  $('.carousel-inner').append(slideItem);
  	}
  	$('#title').val(waypoints[index].title);
  	$('#description').val(waypoints[index].description);
  	$('#title').on('input', function(){
	  waypoints[index].title = $('#title').val();
 	});
  	$('#description').on('input', function(){
	  waypoints[index].description = $('#description').val();
	});
	document.removeEventListener('loadimg', eventListener);
	document.addEventListener('loadimg', eventListener);
	index1 = index;
	waypoints1 = waypoints;
}



function eventListener(event){ //mmm function inside function
	var fd = new FormData();
	console.log("event");
	console.log(event);
	console.log(fd);
	fd.append('file', event.detail.files[0]);
	waypoints1[index1].img.push(event.detail.src);
	waypoints1[index1].files.push(event.detail.files);
  }

  var num_cards = 0;

  function clearCards(){
	  $('#feed').html("");
	  num_cards = 0;
  }

  function loadCard(waypoints, index){
	if (!waypoints.inputWaypoints){
		$('#feed').html($('#feed').html()+cardHTML);
		num_cards++;
		$('div.card:nth-child('+num_cards+') img').attr('data-key', num_cards);
		if (waypoints[index].img[0]) $('div.card:nth-child('+num_cards+') img').attr('src', waypoints[index].img[0]);
		else $('div.card:nth-child('+num_cards+') img').attr('src', "./img/Question_Mark.svg");
		$('div.card:nth-child('+num_cards+') .card-body').text(waypoints[index].title);
		$('div.card:nth-child('+num_cards+')').click();
	}
	else{
		$('#feed').html($('#feed').html()+cardHTML);
		num_cards++;
		$('div.card:nth-child('+num_cards+')').attr('data-key', num_cards);
		if (waypoints.inputWaypoints[0].img[0]) $('div.card:nth-child('+num_cards+') img').attr('src', waypoints.inputWaypoints[0].img[0]);
		else $('div.card:nth-child('+num_cards+') img').attr('src', "./img/Question_Mark.svg");
		$('div.card:nth-child('+num_cards+') .card-body').text(waypoints.inputWaypoints[0].title);
		/*console.log($('div.card:nth-child('+num_cards+') > div > img'));
		$('div.card:nth-child('+num_cards+') > div > img').click(function(e){
			console.log("this"); console.log(this);
		});*/
	}
  }

  function cardClicked(item){
	var datakey = $(item).attr("data-key");
	if (datakey) pointsOfInterest.onclick_card(datakey-1);
  }

  function change(){
	if (!screen){
		$('body').addClass("mp");
		$('body').removeClass("me");
		screen = 1;
	}
	else{
		$('body').addClass("me");
		$('body').removeClass("mp");
		screen = 0;
	}
  }
