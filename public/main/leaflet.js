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

	//$('#fileupload').fileupload({ dataType: 'json' });


	$('#f').change(function () {
		if (this.files.length > 0) {

			$.each(this.files, function (index, value) {
				var reader = new FileReader();

				reader.onload = function (e) {
					//var img = new Image();
					var slideItem;
					var indicator;
					if (index == 0){
						slideItem = "<div class='carousel-item active'><img class='d-inline-block w-100' style='height:300px' src='"+e.target.result+"' alt=''></div>";
						//indicator = "<li data-target='#carouselExampleIndicators' data-slide-to='0' style='height: 300px' class='active'></li>";
					}
					else{
						slideItem = "<div class='carousel-item'><img class='d-inline-block w-100' src='"+e.target.result+"' alt=''></div>";
						//indicator = "<li data-target='#carouselExampleIndicators' data-slide-to='"+index+"' class=''></li>";
					}
					//img.src = e.target.result;

					//img.setAttribute('style', 'width:100%; height: 30%');    // you can adjust the image size by changing the width value. 
					$('.carousel-inner').append(slideItem);
					//$('.carousel-indicators').append(indicator);
				};
				reader.readAsDataURL(this);
			});
		}
	});

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
			pointsOfInterest.loadPoints();
			map.on('zoomend', loadPoints);
			map.on('drag', loadPoints);
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

function eventFire(el, etype){
	if (el.fireEvent) {
	  el.fireEvent('on' + etype);
	} else {
	  var evObj = document.createEvent('Events');
	  evObj.initEvent(etype, true, false);
	  el.dispatchEvent(evObj);
	}
  }

  /*(function() {
	'use strict';
	var FileSelect, GenerateNoty, tplJs;
  
	tplJs = (function() {
	  function tplJs(_at_id) {
		this.id = _at_id;
		this.source = $(this.id).html();
		this.template = Handlebars.compile(this.source);
	  }
  
	  tplJs.prototype.tplLoad = function(context) {
		return this.template(context);
	  };
  
	  return tplJs;
  
	})();
  
	GenerateNoty = (function() {
	  function GenerateNoty() {
		this.theme = 'bootstrapTheme';
		this.animat = {
		  open: 'animated bounceInRight',
		  close: 'animated bounceOutRight',
		  easing: 'swing',
		  speed: 500
		};
	  }
  
	  GenerateNoty.prototype.NotyTime = function(text, type, maxVisible, layout, timeOut) {
		var _self;
		if (maxVisible == null) {
		  maxVisible = 4;
		}
		if (layout == null) {
		  layout = 'topRight';
		}
		if (timeOut == null) {
		  timeOut = 3000;
		}
		_self = this;
		return new Noty({
		  text: text,
		  type: type,
		  dismissQueue: true,
		  progressBar: true,
		  layout: layout,
		  timeout: timeOut,
		  closeWith: ['click'],
		  theme: _self.theme,
		  maxVisible: maxVisible,
		  animation: _self.animat
		}).show();
	  };
  
	  GenerateNoty.prototype.NotyBtn = function(text, type, btnOk, btnCancel, layout) {
		var _self;
		if (layout == null) {
		  layout = 'topRight';
		}
		_self = this;
		return new Noty({
		  text: text,
		  type: type,
		  theme: _self.theme,
		  layout: layout,
		  buttons: [btnOk, btnCancel]
		});
	  };
  
	  return GenerateNoty;
  
	})();
  
	FileSelect = (function() {
	  FileSelect.prototype.ValidFile = ['XLS', 'XLSX', 'CSV'];
  
	  function FileSelect(_at_tag) {
		var _self;
		this.tag = _at_tag;
		_self = this;
		$(this.tag).fileupload({
		  acceptFileTypes: /(\.|\/)(xls?x|csv)$/i,
		  filesContainer: $('.files'),
		  uploadTemplate: function(o) {
			var rows;
			rows = $();
			$.each(o.files, function(index, file) {
			  var data, row, tpl;
			  tpl = new tplJs('#template-upload');
			  data = {
				o: o,
				file: file
			  };
			  row = tpl.tplLoad(data);
			  return rows = rows.add(row);
			});
			return rows;
		  },
		  downloadTemplate: function(o) {
			var rows;
			rows = $();
			$.each(o.files, function(index, file) {
			  var data, row, tpl;
			  tpl = new tplJs('#template-download');
			  data = {
				o: o,
				file: file,
				size: _self.formatFileSize(file.size)
			  };
			  row = tpl.tplLoad(data);
			  return rows = rows.add(row);
			});
			return rows;
		  },
		  progress: function(e, data) {
			var lineload;
			lineload = parseInt(data.loaded / data.total * 100, 10);
			if (data.context) {
			  data.context.each(function() {
				console.log(lineload);
				$(this).find('.progress').attr('aria-valuenow', lineload).css('width', lineload + '%').text(lineload + '%');
			  });
			}
		  },
		  success: function(data) {
			var message;
			message = new GenerateNoty;
			console.log(data);
			return message.NotyTime('<div class="activity-item"><div class="activity"><i class="fa fa-lock text-success"></i> <span>File ' + " " + ' upload!</span></div> </div>', 'success');
		  },
		  error: function(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		  }
		});
	  }
  
	  FileSelect.prototype.formatFileSize = function(bytes) {
		if (typeof bytes !== 'number') {
		  return '';
		}
		if (bytes >= 1000000000) {
		  return (bytes / 1000000000).toFixed(2) + ' GB';
		}
		if (bytes >= 1000000) {
		  return (bytes / 1000000).toFixed(2) + ' MB';
		}
		return (bytes / 1000).toFixed(2) + ' KB';
	  };
  
	  return FileSelect;
  
	})();
  
	$(document).ready(function() {
	  var SelectFile;
	  SelectFile = new FileSelect('#exportisexcel');
	});
  
	}).call(this);*/