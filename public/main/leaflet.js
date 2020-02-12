var screen = 1; //whether map or menu is shown in small devices

var map = L.map('map', {
    // Set latitude and longitude of the map center (required)
    center: [44.7,10.633333],
    // Set the initial zoom level, values 0-18, where 0 is most zoomed-out (required)
    zoomControl: false,
    zoom: 3,
	minZoom: 3
});

/*var WorldStreetMap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/{z}/{x}/{y}/?access_token={accessToken}', {
	attribution: 'Frank',
	noWrap: true,
	accessToken: 'pk.eyJ1Ijoid2hlcmVtaSIsImEiOiJjazZnajdnbmQwN29yM2xwODI5YnF2OWZtIn0.6Fr9OvAyxwthnY-ciTwJVg'
}).addTo(map);*/

var WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
	noWrap: true
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

/*----------------------------------------------------------------------------------*/

var facade;

var pointsOfInterest;

var itinerary;

var navigatorControl;

var provider;

var searchControl;

/*const choiceControl = new ChoiceControl({
    provider: provider,
});*/

//map.addControl(searchControl);
//map.addControl(choiceControl);

var zoom = L.control.zoom({
	position:'bottomleft'
});

var nav_controller = L.control.custom({
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
});

var create = L.control.custom({
	position: 'topleft',
	content : '<div class="big-control"><a class="leaflet-bar-part leaflet-bar-part-single lowalpha round" width="30px" style="line-height: 40px height: 40px; width: 40px" height="30px"><img src="./img/travel.png" width="40px" height="40px"></img></a></div>',
	classes : 'leaflet-control leaflet-bar round',
	events : {
		click : function(e){
			facade.createMode();
		},
	}
}); //visible when user logged in


var upload = L.control.custom({
	position: 'topleft',
	content : '<div class="big-control"><a class="leaflet-bar-part leaflet-bar-part-single lowalpha round" width="30px" style="line-height: 40px height: 40px; width: 40px" height="30px"><img src="./img/upload.png" width="40px" height="40px"></img></a></div>',
	classes : 'leaflet-control leaflet-bar round',
	events : {
		click : function(e){
			facade.ldItinerary();
		},
	}
}); //visible when user logged in

var removeButton = 	L.control.custom({
	position: 'topleft',
	content : '<div class="big-control"><a class="leaflet-bar-part leaflet-bar-part-single lowalpha round" width="30px" style="line-height: 40px height: 40px; width: 40px" height="30px"><img src="./img/load_point.svg" width="40px" height="40px"></img></a></div>',
	classes : 'leaflet-control leaflet-bar round',
	events : {
		click : function(e){
			facade.getItinerary().removePoint();

		},
	}
});


////////////////////////////


var buttonMode = 0;
var use={};

document.addEventListener('userLogged', function(e){
  //console.log(localStorage.getItem("account"));
  facade.setAccount(e.detail.account);
  create.addTo(map);
  upload.addTo(map);
  facade.getUser().getItineraries();
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


$(document).ready(function() {
	facade = new Facade();

	pointsOfInterest = facade.getPointsOfInterest();

	itinerary = facade.getItinerary();

	navigatorControl = new navigatorController(itinerary);

	provider = new OpenStreetMapProvider(itinerary, pointsOfInterest);

	searchControl = new GeoSearchControl({
    	provider: provider,
	});

	map.addControl(searchControl);

	zoom.addTo(map);
	nav_controller.addTo(map);

	facade.getGraphics().loadPoints();

	//$('#fileupload').fileupload({ dataType: 'json' });
	facade.checkLoggedIn();
	map.on('zoomend', facade.getGraphics().loadPoints);
	map.on('drag', facade.getGraphics().loadPoints);

});


function apply(){
	pointsOfInterest.addedPoint.description = $("#popupInput").val();
	console.log($("#popupInput"));
}


var waypoints1;
var index1;


  var num_cards = 0;

  var itineraryHTML = `<div id="carouselExampleIndicators" class="carousel slide mb-1 mt-1" data-ride="carousel">
  <div class="carousel-inner w-100" style=""></div>
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
						  <span>Add file...</span>
						  <input id="f" type="file" accept="image/*, video/*" multiple ></input>
					  </span>
				</div>
		</div>
	</div>
	<div class ="upload-button centering">
		<button class ="btn btn-primary fileinput-button" onclick ="loadVideosYoutube()"> Carica Video</button>
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
  <div id="player"></div>
  </div>
  
  <div class="footer" style="margin-left:-50%;">
	  <button type="button" class="btn btn-primary" id="left">Previous</button>
	  <button type="button" class="btn btn-primary" id="right">Next</button>
  </div>
  `;
  
  var cardHTML = `<div class="card mt-3" style="height:20%; overflow: hidden" onclick="facade.getGraphics().cardClicked(this)" data-key="" data-type="">
  <div class="card-horizontal">
	<img class="card-img w-50" style="height: 200px;" src="" alt="Card image cap">
	<div class="card-body" style="text-align: left; overflow: hidden">
	</div>
  </div>
  </div>`;
  
  var profileHTML = "<iframe src='/profile' class='h-100'></iframe>";