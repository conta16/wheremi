var screen = 1; //whether map or menu is shown in small devices

var map = L.map('map', {
    // Set latitude and longitude of the map center (required)
    center: [44.7,10.633333],
    // Set the initial zoom level, values 0-18, where 0 is most zoomed-out (required)
    zoomControl: false,
    zoom: 3,
	minZoom: 3
});

var WorldStreetMap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/{z}/{x}/{y}/?access_token={accessToken}', {
	attribution: 'Frank',
	noWrap: true,
	accessToken: 'pk.eyJ1Ijoid2hlcmVtaSIsImEiOiJjazZnajdnbmQwN29yM2xwODI5YnF2OWZtIn0.6Fr9OvAyxwthnY-ciTwJVg'
}).addTo(map);

var bound = L.latLngBounds([[-90,-180], [90, 180]]);
map.setMaxBounds(bound);
map.on('drag', function() {
	map.panInsideBounds(bound, { animate: false });
});

L.control.scale({position: 'bottomright'}).addTo(map);


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
						<input id="f" type="file" accept="image/*" multiple ></input>
					</span>
			  </div>
	  </div>
  </div>

</div>

<div class="form-group p">
  <label for="title">Title:</label>
  <textarea class="form-control d" id="title"></textarea>
</div>

<div class="form-group p">
  <label for="description">Description:</label>
  <textarea class="form-control d" id="description" rows="3"></textarea>
</div>
</form>

<div class="nopermit"></div>

<div class="category align-items-center" style="margin-bottom: 50px">

<div class="col-auto my-1">
  <p>Purpose:</p>
  <label class="mr-sm-2 sr-only" for="purp"></label>
  <select class="custom-select mr-sm-2" id="purp">
	<option selected>What</option>
	<option value="1">How</option>
	<option value="2">Why</option>
  </select>
</div>
	<div class="form-group">
    	<label for="lang">Language</label>
    	<select class="custom-select mr-sm-2" id="lang" rows="1">
      <option value="ab">Abkhaz</option>
<option value="aa">Afar</option>
<option value="af">Afrikaans</option>
<option value="ak">Akan</option>
<option value="sq">Albanian</option>
<option value="am">Amharic</option>
<option value="ar">Arabic</option>
<option value="an">Aragonese</option>
<option value="hy">Armenian</option>
<option value="as">Assamese</option>
<option value="av">Avaric</option>
<option value="ae">Avestan</option>
<option value="ay">Aymara</option>
<option value="az">Azerbaijani</option>
<option value="bm">Bambara</option>
<option value="ba">Bashkir</option>
<option value="eu">Basque</option>
<option value="be">Belarusian</option>
<option value="bn">Bengali</option>
<option value="bh">Bihari</option>
<option value="bi">Bislama</option>
<option value="bs">Bosnian</option>
<option value="br">Breton</option>
<option value="bg">Bulgarian</option>
<option value="my">Burmese</option>
<option value="ca">Catalan; Valencian</option>
<option value="ch">Chamorro</option>
<option value="ce">Chechen</option>
<option value="ny">Chichewa; Chewa; Nyanja</option>
<option value="zh">Chinese</option>
<option value="cv">Chuvash</option>
<option value="kw">Cornish</option>
<option value="co">Corsican</option>
<option value="cr">Cree</option>
<option value="hr">Croatian</option>
<option value="cs">Czech</option>
<option value="da">Danish</option>
<option value="dv">Divehi; Dhivehi; Maldivian;</option>
<option value="nl">Dutch</option>
<option value="en">English</option>
<option value="eo">Esperanto</option>
<option value="et">Estonian</option>
<option value="ee">Ewe</option>
<option value="fo">Faroese</option>
<option value="fj">Fijian</option>
<option value="fi">Finnish</option>
<option value="fr">French</option>
<option value="ff">Fula; Fulah; Pulaar; Pular</option>
<option value="gl">Galician</option>
<option value="ka">Georgian</option>
<option value="de">German</option>
<option value="el">Greek, Modern</option>
<option value="gn">Guaraní</option>
<option value="gu">Gujarati</option>
<option value="ht">Haitian; Haitian Creole</option>
<option value="ha">Hausa</option>
<option value="he">Hebrew (modern)</option>
<option value="hz">Herero</option>
<option value="hi">Hindi</option>
<option value="ho">Hiri Motu</option>
<option value="hu">Hungarian</option>
<option value="ia">Interlingua</option>
<option value="id">Indonesian</option>
<option value="ie">Interlingue</option>
<option value="ga">Irish</option>
<option value="ig">Igbo</option>
<option value="ik">Inupiaq</option>
<option value="io">Ido</option>
<option value="is">Icelandic</option>
<option value="it">Italian</option>
<option value="iu">Inuktitut</option>
<option value="ja">Japanese</option>
<option value="jv">Javanese</option>
<option value="kl">Kalaallisut, Greenlandic</option>
<option value="kn">Kannada</option>
<option value="kr">Kanuri</option>
<option value="ks">Kashmiri</option>
<option value="kk">Kazakh</option>
<option value="km">Khmer</option>
<option value="ki">Kikuyu, Gikuyu</option>
<option value="rw">Kinyarwanda</option>
<option value="ky">Kirghiz, Kyrgyz</option>
<option value="kv">Komi</option>
<option value="kg">Kongo</option>
<option value="ko">Korean</option>
<option value="ku">Kurdish</option>
<option value="kj">Kwanyama, Kuanyama</option>
<option value="la">Latin</option>
<option value="lb">Luxembourgish, Letzeburgesch</option>
<option value="lg">Luganda</option>
<option value="li">Limburgish, Limburgan, Limburger</option>
<option value="ln">Lingala</option>
<option value="lo">Lao</option>
<option value="lt">Lithuanian</option>
<option value="lu">Luba-Katanga</option>
<option value="lv">Latvian</option>
<option value="gv">Manx</option>
<option value="mk">Macedonian</option>
<option value="mg">Malagasy</option>
<option value="ms">Malay</option>
<option value="ml">Malayalam</option>
<option value="mt">Maltese</option>
<option value="mi">Māori</option>
<option value="mr">Marathi (Marāṭhī)</option>
<option value="mh">Marshallese</option>
<option value="mn">Mongolian</option>
<option value="na">Nauru</option>
<option value="nv">Navajo, Navaho</option>
<option value="nb">Norwegian Bokmål</option>
<option value="nd">North Ndebele</option>
<option value="ne">Nepali</option>
<option value="ng">Ndonga</option>
<option value="nn">Norwegian Nynorsk</option>
<option value="no">Norwegian</option>
<option value="ii">Nuosu</option>
<option value="nr">South Ndebele</option>
<option value="oc">Occitan</option>
<option value="oj">Ojibwe, Ojibwa</option>
<option value="cu">Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic</option>
<option value="om">Oromo</option>
<option value="or">Oriya</option>
<option value="os">Ossetian, Ossetic</option>
<option value="pa">Panjabi, Punjabi</option>
<option value="pi">Pāli</option>
<option value="fa">Persian</option>
<option value="pl">Polish</option>
<option value="ps">Pashto, Pushto</option>
<option value="pt">Portuguese</option>
<option value="qu">Quechua</option>
<option value="rm">Romansh</option>
<option value="rn">Kirundi</option>
<option value="ro">Romanian, Moldavian, Moldovan</option>
<option value="ru">Russian</option>
<option value="sa">Sanskrit (Saṁskṛta)</option>
<option value="sc">Sardinian</option>
<option value="sd">Sindhi</option>
<option value="se">Northern Sami</option>
<option value="sm">Samoan</option>
<option value="sg">Sango</option>
<option value="sr">Serbian</option>
<option value="gd">Scottish Gaelic; Gaelic</option>
<option value="sn">Shona</option>
<option value="si">Sinhala, Sinhalese</option>
<option value="sk">Slovak</option>
<option value="sl">Slovene</option>
<option value="so">Somali</option>
<option value="st">Southern Sotho</option>
<option value="es">Spanish; Castilian</option>
<option value="su">Sundanese</option>
<option value="sw">Swahili</option>
<option value="ss">Swati</option>
<option value="sv">Swedish</option>
<option value="ta">Tamil</option>
<option value="te">Telugu</option>
<option value="tg">Tajik</option>
<option value="th">Thai</option>
<option value="ti">Tigrinya</option>
<option value="bo">Tibetan Standard, Tibetan, Central</option>
<option value="tk">Turkmen</option>
<option value="tl">Tagalog</option>
<option value="tn">Tswana</option>
<option value="to">Tonga (Tonga Islands)</option>
<option value="tr">Turkish</option>
<option value="ts">Tsonga</option>
<option value="tt">Tatar</option>
<option value="tw">Twi</option>
<option value="ty">Tahitian</option>
<option value="ug">Uighur, Uyghur</option>
<option value="uk">Ukrainian</option>
<option value="ur">Urdu</option>
<option value="uz">Uzbek</option>
<option value="ve">Venda</option>
<option value="vi">Vietnamese</option>
<option value="vo">Volapük</option>
<option value="wa">Walloon</option>
<option value="cy">Welsh</option>
<option value="wo">Wolof</option>
<option value="fy">Western Frisian</option>
<option value="xh">Xhosa</option>
<option value="yi">Yiddish</option>
<option value="yo">Yoruba</option>
<option value="za">Zhuang, Chuang</option>
      </select>
	</div>
	<div class="col-auto my-1">
	<p>Content:</p>
	<label class="mr-sm-2 sr-only" for="cont"></label>
	<select class="custom-select mr-sm-2" id="cont">
	  <option selected>Nature</option>
	  <option value="1">Historical place</option>
	  <option value="2">Square</option>
	</select>
  </div>
  <div class="col-auto my-1">
  <p>Audience:</p>
  <label class="mr-sm-2 sr-only" for="aud"></label>
  <select class="custom-select mr-sm-2" id="aud">
	<option selected>Professional traveler</option>
	<option value="1">Occasional turist</option>
	<option value="2">Hiker</option>
  </select>
</div>
<div class="col-auto my-1">
  <p>Detail level:</p>
  <label class="mr-sm-2 sr-only" for="det"></label>
  <select class="custom-select mr-sm-2" id="det">
	<option selected>High</option>
	<option value="1">Medium</option>
	<option value="2">Low</option>
  </select>
</div>
<div class="comment">
	<div class="form-group">
		<label for="com">Leave a comment</div>
		<textarea class="form-control" id="com" rows="1"></textarea>
		<button type="button" class="btn btn-primary" id="send_comment" disabled>Send comment</button>
	</div>
</div>
<div class="comment-section">
	<p>Comments:</p>
	<div id="comment-list">

	</div>
</div>
</div>

<div class="footer" style="margin-left:-50%;">
	<button type="button" class="btn btn-primary" id="left">Previous</button>
	<button type="button" class="btn btn-primary" id="right">Next</button>
</div>
`;

var cardHTML = `<div class="card mt-3" style="height:20%" onclick="cardClicked(this)" data-key="" data-type="">
<div class="card-horizontal">
  <img class="card-img w-50" style="height: 200px" src="" alt="Card image cap">
  <div class="card-body overflow-auto" style="text-align: left">
  </div>
</div>
</div>`;

var profileHTML = "<iframe src='/profile' class='h-100'></iframe>";


/*`<div class='container' style='position: relative'>
<div class='container' style="">
<label for='uploadpic'>
	<img class="rounded-circle" style="height:200px; width:200px" alt="100x100" id="profilepic" src="./img/unknown_person.png" data-holder-rendered="true">
</label>
<input id="uploadpic" type="file" style='display: none'/>
</div>
<p class='h5' id="username"></p>
<div id="itineraries"></div>
</div>`;*/





//////////////// DAVIDE - locate control ////////////

var mobile=window.matchMedia("(min-device-width : 320px)").matches;
mobile=mobile && window.matchMedia("(max-device-width : 480px)").matches;
mobile=mobile && window.matchMedia("only screen").matches;
var positionInfo;
var defaultLatLng={}

$.ajax({
	method: 'GET',
	url: 'http://ip-api.com/json',
	"content-type": 'json',
	success: function(data){
    positionInfo=data;
		defaultLatLng.lat=data.lat;
		defaultLatLng.lng=data.lon;
	},
	error: function(a,b,c){
		console.log(a,b,c)
	}
}).always(function() {
	var options= {setView:false, sharePosition: true, showCompass: true, markerStyle:{radius: mobile? 18: 9}, compassStyle:{radius: mobile? 18: 9}, flyTo:false,locateOptions:{watch:true, enableHighAccuracy:true}};
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
  content : '<div class="big-control"><a class="leaflet-bar-part leaflet-bar-part-single lowalpha round" width="30px" style="line-height: 40px; height: 40px; width: 40px" height="30px"><img src="./img/nav.svg" width="40px" height="40px"></img></a></div>',
	classes : 'leaflet-control leaflet-bar round',
	events : {
		click : function(e){
			nav=new polloNavigator(navigatorControl.onpoint, navigatorControl.onend, navigatorControl.wondering);
      if (nav.navigate)
			   nav.navigate();
		},
	}
}).addTo(map);

var create = L.control.custom({
	position: 'topleft',
	content : '<div class="big-control"><a class="leaflet-bar-part leaflet-bar-part-single lowalpha round" width="30px" style="line-height: 40px height: 40px; width: 40px" height="30px"><img src="./img/travel.png" width="40px" height="40px"></img></a></div>',
	classes : 'leaflet-control leaflet-bar round',
	events : {
		click : function(e){
			createMode();
		},
	}
}); //visible when user logged in


var upload = L.control.custom({
	position: 'topleft',
	content : '<div class="big-control"><a class="leaflet-bar-part leaflet-bar-part-single lowalpha round" width="30px" style="line-height: 40px height: 40px; width: 40px" height="30px"><img src="./img/upload.png" width="40px" height="40px"></img></a></div>',
	classes : 'leaflet-control leaflet-bar round',
	events : {
		click : function(e){
			ldItinerary();
		},
	}
}); //visible when user logged in

var removeButton = 	L.control.custom({
	position: 'topleft',
	content : '<div class="big-control"><a class="leaflet-bar-part leaflet-bar-part-single lowalpha round" width="30px" style="line-height: 40px height: 40px; width: 40px" height="30px"><img src="./img/load_point.svg" width="40px" height="40px"></img></a></div>',
	classes : 'leaflet-control leaflet-bar round',
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
  last_event_ts= new Date()
  setTimeout(function(){
    //console.log(new Date()-last_event_ts)
    if (new Date()-last_event_ts>=800)
      pointsOfInterest.loadPoints();
  },800);
}

var buttonMode = 0;
var use={};

document.addEventListener('userLogged', function(e){
  //console.log(localStorage.getItem("account"));
  world.setAccount(e.detail.account);
  console.log(e.detail.account);
  create.addTo(map);
  upload.addTo(map);
  world.getUser().getItineraries();
  console.log(e);
  use=Object.assign({}, e.detail.account);
  $('img#profilepic').attr('src', e.detail.account.profilepic);


  $(document).on('change','#uploadpic', function () {
    var file = this.files;
    console.log("akkkkkkkkkkkkksssssss");
          if (this.files.length == 1) {
              //$.each(this.files, function (index, value) {
                  var reader = new FileReader();
                  reader.onload = function (e) {
                    $('img#profilepic').attr('src', e.target.result);
                      $.ajax({
            url: '/changeprofilepic',
            method: 'POST',
            dataType: 'json',
            data: {
              pic: JSON.stringify(e.target.result),
              id: JSON.stringify(use._id)
            },
            success: () => {
              console.log("pic changed");
            },
            error: () => {
              console.log("error in changing pic");
            }
          });
                  };
                  reader.readAsDataURL(file[0]);
              //});
          }
      });
});

function checkLoggedIn() {
  var a=false
    $.ajax({
      url: "/user",
      method: "GET",
      success: function(data){
        if (!$.isEmptyObject(data)){
			console.log(data);
          var event =new CustomEvent('userLogged', {detail: {account:data}});
          document.dispatchEvent(event);
        }
      }
    });
}

$(document).ready(function() {
	pointsOfInterest.loadPoints();

	//$('#fileupload').fileupload({ dataType: 'json' });
	checkLoggedIn();
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
	var str = itinerary.waypoints[0].title;
	if (!str || str.length == 0) alert("You have to insert a name to the itinerary");
	else if (itinerary.getWaypoints().length > 1 ) itinerary.postItineraryToDB();
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

  function loadMenu(waypoints, index, write_permit = true, nextnprevious = false){
	if (itinerary.user_id == world.getAccount()._id) write_permit = true;
	gotoTab(INSPECT_TAB);
	if (!write_permit) {
		$('.p').css('display','none');
		$(".fileinput-button").css("display", "none");
		$(".nopermit").css("display", "inline");
		$(".d").prop("disabled", true);
		$(".custom-select").prop('disabled', true);
		if (!$.isEmptyObject(world.getAccount())){
			$(".comment").css("display", "inline");
			$("#send_comment").prop("disabled", false);
		}
		else{
			$(".comment").css("display", "none");
			$("#send_comment").prop("disabled", true);
		}
	}
	else {
		$('.p').css('display','inline');
		$(".fileinput-button").css("display", "relative");
		$(".nopermit").css("display", "none");
		$(".d").prop("disabled", false);
		$(".custom-select").prop('disabled', false);
		$(".comment").css("display", "none");
		$("#send_comment").prop("disabled", true);

	}
	if (nextnprevious) $('.footer').css('display', 'inline');
	else $('.footer').css('display', 'none');
  	var slideItem;
  	for (var i in waypoints[index].img){
	  if (i==0) slideItem = "<div class='carousel-item active'><img class='d-inline-block w-100' style='height:300px;' src='"+waypoints[index].img[0]+"' alt=''></div>";
	  else slideItem = "<div class='carousel-item'><img class='d-inline-block w-100' style='height:300px;' src='"+waypoints[index].img[i]+"' alt=''></div>";
	  $('.carousel-inner').append(slideItem);
	}
	var e;
  	$('#title').val(waypoints[index].title);
	$('#description').val(waypoints[index].description);

	$("select#purp option").filter(function() {
		return $(this).text() == waypoints[index].purpose;
	}).prop('selected', true);

	$('#lang').val(waypoints[index].lang);

	$("select#cont option").filter(function() {
		return $(this).text() == waypoints[index].content;
	}).prop('selected', true);

	$("select#aud option").filter(function() {
		return $(this).text() == waypoints[index].audience;
	}).prop('selected', true);

	$("select#det option").filter(function() {
		return $(this).text() == waypoints[index].detail;
	}).prop('selected', true);

	$('.nopermit').html("<p class='h2'>"+waypoints[index].title+"</p><p class='h6'>"+waypoints[index].description+"</p>");
	$('#left').on('click',() => {
		if (index > 0) loadMenu(waypoints, index-1, write_permit, nextnprevious);
	});
	$('#right').on('click',() => {
		if (index < waypoints.length-1) loadMenu(waypoints, index+1, write_permit, nextnprevious);
	});
	$('#send_comment').on('click',() => {
		world.sendComment(waypoints[index]._id, $('#com').val(), world.getAccount());
	});
  	$('#title').on('input', function(){
	  waypoints[index].title = $('#title').val();
 	});
  	$('#description').on('input', function(){
	  waypoints[index].description = $('#description').val();
	});
	$('#purp').on('change', () => {
		e = document.getElementById("purp");
		waypoints[index].purpose = e.options[e.selectedIndex].text;
	});
	$('#lang').on('input', () => {
		waypoints[index].lang = $('#lang').val();
	});
	$('#cont').on('input', () => {
		e = document.getElementById("cont");
		waypoints[index].content = e.options[e.selectedIndex].text;
		console.log(waypoints[index].content);
	});
	$('#aud').on('input', () => {
		e = document.getElementById("aud");
		waypoints[index].audience = e.options[e.selectedIndex].text;
	});
	$('#det').on('input', () => {
		e = document.getElementById("det");
		waypoints[index].detail = e.options[e.selectedIndex].text;
	});
	for (var i in waypoints[index].comments){
		$('#comment-list').append("<p>"+waypoints[index].comments[i].madeBy.name+": "+waypoints[index].comments[i].text+"</p><br>");
	}
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
	console.log("wi"); console.log(waypoints); console.log(index);
	if (!waypoints[index].inputWaypoints){
		$('#feed').html($('#feed').html()+cardHTML);
		num_cards++;
		$('div.card:nth-child('+num_cards+')').attr('data-key', index);
		$('div.card:nth-child('+num_cards+')').attr('data-type', 1);
		if (waypoints[index].img[0]) $('div.card:nth-child('+num_cards+') img').attr('src', waypoints[index].img[0]);
		else $('div.card:nth-child('+num_cards+') img').attr('src', "./img/Question_Mark.svg");
		$('div.card:nth-child('+num_cards+') .card-body').html("<div class='container'><h5 class='card-title'>"+waypoints[index].title+"</h5><h6 class='card-subtitle text-muted'><small> Point by "+waypoints[index].username+"</small></h6></div>");
		//$('div.card:nth-child('+num_cards+')').click();
	}
	else{
		$('#feed').html($('#feed').html()+cardHTML);
		num_cards++;
		$('div.card:nth-child('+num_cards+')').attr('data-key', index);
		$('div.card:nth-child('+num_cards+')').attr('data-type', 0);
		//if (type) $('div.card:nth-child('+num_cards+')').css("background-color", "#ffe6cc");
		if (waypoints[index].inputWaypoints[0].img[0]) $('div.card:nth-child('+num_cards+') img').attr('src', waypoints[index].inputWaypoints[0].img[0]);
		else $('div.card:nth-child('+num_cards+') img').attr('src', "./img/Question_Mark.svg");
		$('div.card:nth-child('+num_cards+') .card-body').html("<div class='container'><h5 class='card-title'>"+waypoints[index].inputWaypoints[0].title+"</h5><h6 class='card-subtitle text-muted'><small>Itinerary by "+waypoints[index].username+"</small></h6></div>");
		/*console.log($('div.card:nth-child('+num_cards+') > div > img'));
		$('div.card:nth-child('+num_cards+') > div > img').click(function(e){
			console.log("this"); console.log(this);
		});*/
	}
  }

  function cardClicked(item){
	var datakey = $(item).attr("data-key");
	console.log("aaaddd");
	console.log($(item));
	var datatype = $(item).attr("data-type");
	if (datakey) pointsOfInterest.onclick_card(datakey, datatype);
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
