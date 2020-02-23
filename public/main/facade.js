class Facade{
    constructor(){
        this.inizialize_leaf();
        this.visitedWikiIds = [];
        this.htmlInspectBefore = "";
        this.graphics = new Graphics(this);
        this.itinerary = new Itinerary(this.graphics, this);
        this.pointsOfInterest = new PointOfInterest(this.itinerary, 5, this.graphics);
        this.user = new Users(this.itinerary, this);
        this.Paul = new Artyom();
        this.Paul.initialize({
            lang: this.initLanguagePaul(), //todo: change language based on location or user preferences
            continuous: false, // Listen forever
            soundex: true,// Use the soundex algorithm to increase accuracy
            debug: true, // Show messages in the console
            executionKeyword: "",//Esegui dopo questa spressione
            listen: false, // Start to listen commands !

            // If providen, you can only trigger a command if you say its name
            // e.g to trigger Good Morning, you need to say "Jarvis Good Morning"
            name: "Paul"
        });
        this.initPaulCommands(this.Paul);
        this.currentLvlSpec = 0;
        this.lvlSpec = ['gen','pre','elm','mid','scl','all'];
        this.url = "https://site181951.tw.cs.unibo.it";
    }

    initLanguagePaul(){
        var userLang = navigator.language || navigator.userLanguage;
        return userLang;
    }

    getOlcForUser (){
        return this.locationString(this.findPointForVideos(L.userPosition).latLng,10,10);
    }

    saveHtmlInspectBefore(str){ //salvo lo stato di inspect prima di infilarci il video così quando finisce posso ripristinarlo
        this.htmlInspectBefore = str;
    }

    loadHtmlInspectBefore(){ //risistemo inspect per usarlo la volta dopo da nuovo
        $("#inspect").html(this.htmlInspectBefore);
    }

    findPointForVideos(latLngMia){
        var min = Infinity;
        var returnPoint;
        var points = this.pointsOfInterest.points.concat(this.pointsOfInterest.wiki_points, this.pointsOfInterest.yt_points);
        for (var point in points){
        if (min < this.distance(latLngMia.lat,latLngMia.lon,point.latLng.lat,point.latLng.lon)){min = distance; returnPoint = point}
        }
        return returnPoint;
    }

    initPaulCommands(Paul){
        var htmlVideoPopup = `<div id="headerPopup" class="mfp-hide embed-responsive embed-responsive-21by9">
                              <iframe class="embed-responsive-item video-frame" width="854" height="480" src="" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                              </div>`;
        //var olcCurrentPosition = this.locationString(this.findPointForVideos(L.userPosition).latLng,10,10); //trova un modo per sapere a che punto sei più vicino facade-distance(lat e lng dei due punti)
                                //questa cosa qui (^) ha senso, ma magari non qui, infatti se provi a decommentre dà l'errore latLngMia undefined perché L.userPosition dipende da due azioni asincorne indipendenti:
                                //la richiesta della geolocalizzazione dell' ip utente e la richiesta di attivazione da parte di questo del GPS, entrambe le suddette azioni spesso non sono ancora avvenute quando il programma si trova a questo punto,
                                //inoltre, siccome l'olc è una cosa che cambia nel tempo, non ha molto il suo valore all'accensione del programma (che avviene una tantum), quando poi sappiamo già che ci servirà in altri momenti. 
        var myGroup = [
            {//wheremi
                description:"Where am I? L'utente chiede un video di spiegazione del post in cui è",
                indexes:["Where am I", "Where", "paul where am i", "paul where"],
                action: function(i){
                    this.loadHtmlInspectBefore();
                    //var olcCurrentPosition = getOlcForUser();
                  var params = {
                        coords: {latitude: L.userPosition.latLng.lat, longitude: L.userPosition.latLng.lng},
                        //per quando leggerai: topicid è deprecato ed è un prametro di YT, pageID è, se vuoto, quello della prima pagina, altrimenti non va specificato perché già gestito dall'api
                    }
                    //riproduci un video per dire dove sei (WHERE)
                    Paul.say('Playing a video to tell you where you are');
                     /*trova dove sei (usando olc) e poi carica un video di quel tipo*/
                     
                     this.saveHtmlInspectBefore($("#inspect").html());
                     while (resultJson.purpose.toLowerCase() != 'where'){
                         var res = wmivideo_search(params);
                         var resultJson = utils.mahmood(res);
                    }
                     
                     $("#inspect").append(htmlVideoPopup);
                     //$(".video-container").append(htmlVideoPopup);
                     $(".video-frame").attr('src', url);
                     $('#headerVideoLink').magnificPopup({
                        type:'inline',
                        midClick: true
                     }); //a sto punto il video dovrebbe essere un popup.
                }
            },
            {//more
                description:"aumenta il livello di specificità ad ogni more. quando cambi posto ritorna all' inizio",
                indexes:["more", "paul more"],
                action: function(i){
                    this.loadHtmlInspectBefore();
                    //riproduci un video per dire dettagli sul posto dove sei
                    this.currentLvlSpec += 1;
                    Paul.say("Playing a video to tell you more details about the thing you're looking at. Level " + currentLvlSpec);

                }
            },
            {//next
                description:"Vai al prossimo luogo",
                indexes:["next", "paul next"],
                action: function(i){
                    this.loadHtmlInspectBefore();
                    // vai al prossimo punto nell' itinerario
                    this.currentLvlSpec = 0;
                    Paul.say("I'll guide you to your next location");

                }
            },
            {//previous
                description:"Vai al luogo precedente",
                indexes:["previous", "paul previous"],
                action: function(i){
                    this.loadHtmlInspectBefore();
                    // vai al punto precedente nell' itinerario
                    this.currentLvlSpec = 0;
                    Paul.say("I'll guide you to your previous location");

                }
            },
            {//why
                description:"spiega come mai questo posto è interessante",
                indexes:["why", "paul why", "tell me why", "paul tell me why"],
                action: function(i){
                    this.loadHtmlInspectBefore();
                    //riproduci una clip WHY
                    if (i >= 2){
                        Paul.say("Ain't nothing but a heartache");
                    }else{
                        Paul.say("Playing a why clip. level "+currentLvlSpec);
                    }
                    var params = {
                        coords: {latitude: L.userPosition.latLng.lat, longitude: L.userPosition.latLng.lng},
                        //per quando leggerai: topicid è deprecato ed è un prametro di YT, pageID è, se vuoto, quello della prima pagina, altrimenti non va specificato perché già gestito dall'api
                    }
                     /*trova dove sei (usando olc) e poi carica un video di quel tipo*/
                     
                     this.saveHtmlInspectBefore($("#inspect").html());
                     while (resultJson.purpose.toLowerCase() != 'why'){
                         var res = wmivideo_search(params);
                         var resultJson = utils.mahmood(res);
                    }
                     
                     $("#inspect").append(htmlVideoPopup);
                     //$(".video-container").append(htmlVideoPopup);
                     $(".video-frame").attr('src', url);
                     $('#headerVideoLink').magnificPopup({
                        type:'inline',
                        midClick: true
                     }); //a sto punto il video dovrebbe essere un popup.
                }
            },
            {//stop
                description:"Interrompi la riproduzione della clip corrente",
                indexes:["stop", "paul stop"],
                action: function(i){
                    //stoppa la riproduzione del video corrente
                    $(".video-frame").pause()
                    Paul.say("Current video paused");
                }
            },
            {//continue
                description:"continua la riproduzione della clip corrente",
                indexes:["continue", "paul continue"],
                action: function(i){
                    //continua la riproduzione del video corrente
                    Paul.say("Resuming play");
                    $(".video-frame").play()
                }
            },
            {//how
                description:"indica come accedere e orari del punto corrente",
                indexes:["how", "paul how"],
                action: function(i){
                    this.loadHtmlInspectBefore();
                    //riproduci info su come accedere al posto in questione
                    Paul.say("Here is how to visit this place");
                }
            }
        ];
        Paul.addCommands(myGroup);
    }

    inizialize_leaf(){
        this.map = L.map('map', {
            // Set latitude and longitude of the map center (required)
            center: [44.7,10.633333],
            // Set the initial zoom level, values 0-18, where 0 is most zoomed-out (required)
            zoomControl: false,
            dragging: true, touchZoom: true, scrollWheelZoom: true, doubleClickZoom: true,
            zoom: 3,
            minZoom: 3,
dragging: true, touchZoom: true, scrollWheelZoom: true, doubleClickZoom: true
        }).fitWorld();

        map = this.map;

        var WorldStreetMap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/{z}/{x}/{y}/?access_token={accessToken}', {
            attribution: 'Frank',
            noWrap: true,
    maxZoom: 18,
    tileSize: 512,
    zoomOffset: -1,
            accessToken: 'pk.eyJ1Ijoid2hlcmVtaSIsImEiOiJjazZnajdnbmQwN29yM2xwODI5YnF2OWZtIn0.6Fr9OvAyxwthnY-ciTwJVg'
        }).addTo(map);

/*        var bound = L.latLngBounds([[-90,-180], [90, 180]]);
        map.setMaxBounds(bound);
        map.on('drag', function() {
            map.panInsideBounds(bound, { animate: false });
        });
*/
        L.control.scale({position: 'bottomright'}).addTo(map);

        var mobile=window.matchMedia("(min-device-width : 320px)").matches;
        mobile=mobile && window.matchMedia("(max-device-width : 480px)").matches;
        mobile=mobile && window.matchMedia("only screen").matches;
        var defaultLatLng={}

        $.ajax({
            method: 'GET',
            url: 'https://api.ipgeolocation.io/ipgeo?apiKey=c72a10aebeec445eb82dac923123e269',
            "content-type": 'json',
            success: function(data){
                defaultLatLng.lat=data.latitude;
                defaultLatLng.lng=data.longitude;
            },
            error: function(a,b,c){
                console.log(a,b,c)
            }
        }).always(function() {
            var options= {setView:'once', sharePosition: true, showCompass: true, markerStyle:{radius: mobile? 18: 9}, compassStyle:{radius: mobile? 18: 9}, flyTo:false,locateOptions:{watch:false, enableHighAccuracy:true}};
            options.defaultLatLng=Object.assign({}, defaultLatLng);
            L.userPosition=Object.assign({}, defaultLatLng)
            L.control.locate(options).addTo(map);
        });
    }

    getGraphics(){
        return this.graphics;
    }

    setAccount(obj){
        this.user.setAccount(obj);
    }

    getAccount(){
        return this.user.getAccount();
    }

    getUser(){
        return this.user;
    }

    getItinerary(){
        return this.itinerary;
    }

    getPointsOfInterest(){
        return this.pointsOfInterest;
    }

    getUser(){
        return this.user;
    }

    sendComment(id, comment, account){
        var parentThis = this;
        $.ajax({
            url: parentThis.url+"/sendcomment",
            method: "POST",
            dataType: "json",
            data: {
                id: JSON.stringify(id),
                comment: JSON.stringify(comment),
                account: JSON.stringify(account)
            },
            success: () => {
                console.log("comment posted successfully");
            },
            error: (error) => {
                console.log("error in posting comment");
                console.log(error);
            }
        });
    }

    checkLoggedIn() {
        var a=false;
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

    createMode(){
        var parentThis = this;
        var mode = this.itinerary.getMode();
        if (!mode){
            this.itinerary.setMode(!mode);
            // map.off('zoomend', loadPoints); //può essere cambiato in pointsofinterest.loadpoints?
            // map.off('drag', loadPoints);
            this.pointsOfInterest.removeAllMarkers();
            this.itinerary.setWaypoints([]);
            this.graphics.removeButton.addTo(map);
            // map.on('click', (e) => {
            //     if (parentThis.itinerary.getMode() != 2){
            //         loadPoints();
            //         map.on('zoomend', loadPoints);
            //         map.on('drag', loadPoints);
            //         if (parentThis.itinerary.getBlock()) parentThis.itinerary.setBlock(0);
            //         else {
            //             e.latLng = e.latlng;
            //             var waypoints = parentThis.itinerary.getWaypoints();
            //         parentThis.graphics.styleInspect(itineraryHTML);
            //             parentThis.itinerary.pushWaypoints([e.latLng]);
            //         }
            //     }
            // });
        }
        else{
            parentThis.graphics.styleInspect("");
            parentThis.itinerary.setMode(!mode);
            // map.off('click');
            parentThis.itinerary.setWaypoints([]);
            map.removeControl(parentThis.graphics.removeButton);
            loadPoints();
            // map.on('zoomend', loadPoints);
            // map.on('drag', loadPoints);
        }
    }

    ldItinerary(){
        this.graphics.styleInspect("");
        var str = this.itinerary.waypoints[0].title;
        if (!str || str.length == 0) alert("You have to insert a name to the itinerary");
        else if (this.itinerary.getWaypoints().length > 1 ) this.itinerary.postItineraryToDB();
        else this.itinerary.postPoint();
        this.itinerary.setWaypoints([]);
    }

    eventFire(el, etype){
        if (el.fireEvent) {
          el.fireEvent('on' + etype);
        } else {
          var evObj = document.createEvent('Events');
          evObj.initEvent(etype, true, false);
          el.dispatchEvent(evObj);
        }
      }

    saveChanges(waypoint){
        $.ajax({
            url: url+"/savechanges",
            method: "POST",
            dataType: "json",
            data: {
                id: JSON.stringify(waypoint._id),
                title: JSON.stringify(waypoint.title),
                description: JSON.stringify(waypoint.description),
                purpose: JSON.stringify(waypoint.purpose),
                language: JSON.stringify(waypoint.lang),
                content: JSON.stringify(waypoint.content),
                audience: JSON.stringify(waypoint.audience),
                detail: JSON.stringify(waypoint.detail),
                img: JSON.stringify(waypoint.img)
            },
            success: () => {
                console.log("changes saved successfully");
            },
            error: () => {
                console.log("changes saved unsuccessfully");
            }
        });
    }

    distance(lat1,lon1,lat2,lon2){
        var R = 6372797; // metres
        var pi = Math.PI;

        var φ1 = lat1*(pi/180);
        var φ2 = lat2*(pi/180);
        var Δφ = (lat2-lat1)*(pi/180);
        var Δλ = (lon2-lon1)*(pi/180);


        var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);

        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        var d = R * c;

        return d;
    }

    checkDistance(){
        var it_points = this.pointsOfInterest.getItineraryStartPoints();
        var points = this.pointsOfInterest.getPoints();
        var wiki_points = this.pointsOfInterest.getWikipediaPoints();

        for (var i in it_points){
            var pos = it_points[i].inputWaypoints[0].latLng;
            if (this.distance(L.userPosition.latLng.lat, L.userPosition.latLng.lng, pos.lat, pos.lng) < 20 && !it_points[i].inputWaypoints[0].played){
                this.Paul.say(it_points[i].inputWaypoints[0].title);
                this.Paul.say(it_points[i].inputWaypoints[0].description);
                this.graphics.loadMenu(it_points[i].inputWaypoints,0,false,false);
                this.graphics.addStopButton();
                it_points[i].inputWaypoints[0].played = true;
            }
        }

        for (var i in points){
            var pos = points[i].latLng;
            if (this.distance(L.userPosition.latLng.lat, L.userPosition.latLng.lng, pos.lat, pos.lng) < 20 && !points[i].played){
                this.Paul.say(points[i].title);
                this.Paul.say(points[i].description);
                this.graphics.loadMenu(points,i,false,false);
                this.graphics.addStopButton();
                points[i].played = true;
            }
        }

        for (var i in wiki_points){
            var pos = wiki_points[i].latLng;
            if (this.distance(L.userPosition.latLng.lat, L.userPosition.latLng.lng, pos.lat, pos.lng) < 20 && !this.visitedWikiIds.includes(wiki_points[i].pageid)){
                this.Paul.shutUp();
                this.Paul.say(wiki_points[i].title);
                this.Paul.say(wiki_points[i].extract);
                gotoTab(INSPECT_TAB);
                console.log($("#inspect"));
                $("#inspect").html("<div class='container'><h2>"+wiki_points[i].title+"</h2><p>"+wiki_points[i].extract+"</p></div>");
                this.graphics.addStopButton(wiki_points[i].title, wiki_points[i].extract);
                this.visitedWikiIds.push(wiki_points[i].pageid);
                break;
            }
        }
    }

    locationString(latLng, begin, end){
      var olc='';
      for (var i=begin; i<=end; i+=2)
        olc=olc.concat(OpenLocationCode.encode(latLng.lat, latLng.lng, i)+((i!=end)?"-":""));
      return olc;
    }

    generateDescription(waypoint){
      var olc=this.locationString(waypoint.latLng, 6, 10);
        olc=olc.concat(':', $("#purp").val());
        olc=olc.concat(':', $("#lang").val());
        olc=olc.concat(':', $("#cont").val());
        olc=olc.concat(':A', $("#aud").val());
        olc=olc.concat(':P', $("#det").val());
        console.log(olc);
        return olc;
    }

    startItinerary(){
        nav=new polloNavigator(navigatorControl.onpoint, navigatorControl.onend, navigatorControl.wondering);
        console.log(nav);
        nav.navigate();
    }

    uploadVideo(){
      var title=$("#title").val();
      var description=this.generateDescription(selectedWaypoint());
      var category=22;
      var metadata = {
        snippet: {
          title: title,
          description: description,
          categoryId: category
        },
        status: {
          privacyStatus: 'unlisted'//va poi settato a public su richiesta
        }
      };
      YTUploader.uploadBlob(SimpleRecorder.videoBlob, title, metadata);
    }
}
