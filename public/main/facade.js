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
            lang: this.initLanguagePaul(),
            continuous: true, // Listen forever /*LISSEN FOREVER COSì TESTO */
            soundex: true,// Use the soundex algorithm to increase accuracy
            debug: true, // Show messages in the console
            executionKeyword: "",//Esegui dopo questa spressione
            listen: true, // Start to listen commands !

            // If providen, you can only trigger a command if you say its name
            // e.g to trigger Good Morning, you need to say "Jarvis Good Morning"
            name: "Paul"
        });
        this.initPaulCommands(this.Paul);
        this.currentLvlSpec = 0;
        this.lvlSpec = ['gen','pre','elm','mid','scl','all'];
        this.url = "https://site181951.tw.cs.unibo.it";
//        this.url = "http://localhost:3000";
        this.initSearchControl()
    }

    initSearchControl(){
      var provider = new OpenStreetMapProvider(this.getItinerary(), this.getPointsOfInterest());
      this.searchControl = new GeoSearchControl({
          provider: provider,
          autoClose: true
      });
      map.addControl(this.searchControl);
      map.on('click', function(){
        this.searchControl.closeResults();
      }.bind(this))
    }

    initLanguagePaul(){
        var userLang = navigator.language || navigator.userLanguage;
//        return userLang;
        return "en-GB";
    }


    initPaulCommands(Paul){
        var htmlVideoPopup = `<div id="headerPopup" class="mfp-hide embed-responsive embed-responsive-21by9">
                              <iframe class="embed-responsive-item video-frame" width="854" height="480" src="" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                              </div>`;
        var myGroup = [
            {//wheremi
                description:"Where am I? L'utente chiede un video di spiegazione del post in cui è",
                indexes:["Where am I", "Where", "paul where am i", "paul where"],
                action: function(i){
                    badPaulWheremi();
                }
            },
            {//more
                description:"aumenta il livello di specificità ad ogni more. quando cambi posto ritorna all' inizio",
                indexes:["more", "paul more"],
                action: function(i){
                    badPaulMore();
                }
            },
            {//next
                description:"Vai al prossimo luogo",
                indexes:["next", "paul next"],
                action: function(i){
                    badPaulNext();
                }
            },
            {//previous
                description:"Vai al luogo precedente",
                indexes:["previous", "paul previous"],
                action: function(i){
                    badPaulPrev();
                }
            },
            { //what
                description:"spiega cosa è questo posto",
                indexes:["what", "paul what", "tell me what", "paul tell me what"],
                action: function(i){
                    badPaulWhat();
                }
            },
            {//why
                description:"spiega come mai questo posto è interessante",
                indexes:["why", "paul why", "tell me why", "paul tell me why"],
                action: function(i){

                    /*if (i >= 2){
                        Paul.say("Ain't nothing but a heartache");
                    }*/
                    badPaulWhy();
                }
            },
            {//stop
                description:"Interrompi la riproduzione della clip corrente",
                indexes:["stop", "paul stop"],
                action: function(i){
                    //stoppa la riproduzione del video corrente
                    badPaulPause();
                }
            },
            {//continue
                description:"continua la riproduzione della clip corrente",
                indexes:["continue", "paul continue"],
                action: function(i){
                    //continua la riproduzione del video corrente
                    badPaulContinue();
                }
            },
            {//how
                description:"indica come accedere e orari del punto corrente",
                indexes:["how", "paul how"],
                action: function(i){
                    badPaulHow();
                }
            },
            {
                //thanks
                description:"quando le nonne dicono grazie ad alexa :)",
                indexes:["thanks", "paul thanks","thanks paul", "grazie", "paul grazie", "grazie paul"],
                action: function(i){
                    Paul.say("It's my pleasure");
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
                defaultLatLng.lat=parseFloat(data.latitude);
                defaultLatLng.lng=parseFloat(data.longitude);
                //defaultLatLng.latLng=defaultLatLng;
            },
            error: function(a,b,c){
                console.log(a,b,c)
            }
        }).always(function() {
            var options= {setView:'once', sharePosition: true, showCompass: true, markerStyle:{radius: mobile? 18: 9}, compassStyle:{radius: mobile? 18: 9}, flyTo:false,locateOptions:{watch:false, enableHighAccuracy:true}};
            options.defaultLatLng=Object.assign({}, defaultLatLng);
            L.userPosition={}
            //L.userPosition.latLng=Object.assign({}, defaultLatLng);
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
            url: url+"/user",
            method: "GET",
            success: function(data){
              console.log(data);
              if (!$.isEmptyObject(data)){ //qua data è sempre vuoto, anche se il login avviene con successo
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
                /*purpose: JSON.stringify(waypoint.purpose),
                language: JSON.stringify(waypoint.lang),
                content: JSON.stringify(waypoint.content),
                audience: JSON.stringify(waypoint.audience),
                detail: JSON.stringify(waypoint.detail),*/
                img: JSON.stringify(waypoint.img)
            },
            success: () => {
                console.log("changes saved successfully");
                location.reload();
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



    checkPointDistance(points, i){
        var pos = points[i].latLng;
        if (this.distance(L.userPosition.latLng.lat, L.userPosition.latLng.lng, pos.lat, pos.lng) < 20){

                if (next){
                    var pointsOfInterest = this.getPointsOfInterest();
                    var obj = {"data": {"id": points[i]._id, "latLng":{"lat": pos.lat, "lng": pos.lng}}, "type": "point", "title": points[i].title, "description": points[i].description};
                    pointsOfInterest.points_visitedPlaces.push(obj);
                    pointsOfInterest.listOfPlacesVisited.push(obj);
                }
                this.Paul.shutUp();
                this.Paul.say(points[i].title);
                this.Paul.say(points[i].description);
                gotoTab(INSPECT_TAB);
                this.graphics.loadMenu(points,i,false,false);
                this.graphics.addStopButton();
            }
    }

    checkWikiDistance(wiki_points, i){
        var pos = wiki_points[i].latLng;
        if (this.distance(L.userPosition.latLng.lat, L.userPosition.latLng.lng, pos.lat, pos.lng) < 20){
                if (next){
                    var pointsOfInterest = this.getPointsOfInterest();
                    var obj = {"data": {"id": wiki_points[i].pageid, "latLng":{"lat": pos.lat, "lng": pos.lng}}, "type": "wiki", "title": wiki_points[i].title, "extract": wiki_points[i].extract};
                    pointsOfInterest.wiki_visitedPlaces.push(obj);
                    pointsOfInterest.listOfPlacesVisited.push(obj);
                }
                this.Paul.shutUp();
                this.Paul.say(wiki_points[i].title);
                this.Paul.say(wiki_points[i].extract);
                gotoTab(INSPECT_TAB);
                console.log($("#inspect"));
                $("#inspect").html("<div class='container'><h2>"+wiki_points[i].title+"</h2><p>"+wiki_points[i].extract+"</p></div>");
                //$("#inspect").append('<div style="margin-bottom: 50px"><button type="button" class="btn btn-primary startItinerary" onclick="facade.go()">Start Itinerary</button></div>');
                this.graphics.addStopButton(wiki_points[i].title, wiki_points[i].extract);

        }
    }

    checkYtDistance(yt_points,i){
        var pos = yt_points[i].latLng;
        if (this.distance(L.userPosition.latLng.lat, L.userPosition.latLng.lng, pos.lat, pos.lng) < 20){
            if (next){
                var pointsOfInterest = this.getPointsOfInterest();
                var obj = {"data": {"id": yt_points[i].id, "latLng":{"lat": pos.lat, "lng": pos.lng}}, "type": "yt"};
                pointsOfInterest.yt_visitedPlaces.push(obj);
                pointsOfInterest.listOfPlacesVisited.push(obj);
            }
            this.Paul.shutUp();
            this.Paul.say('Playing a video to tell you where you are');
            facade.getGraphics().loadVideoAndPlay(yt_points[i].id);
            $("#buttonPause").on("click", () => {
                $('.embed-responsive-item').each(function(){
                    this.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                });
            });
            $("#buttonCont").on("click", () => {
                $('.embed-responsive-item').each(function(){
                    this.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                });
            });
        }
    }

    /*checkDistance(){
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
                gotoTab(INSPECT_TAB);
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
                //$("#inspect").append('<div style="margin-bottom: 50px"><button type="button" class="btn btn-primary startItinerary" onclick="facade.go()">Start Itinerary</button></div>');
                this.graphics.addStopButton(wiki_points[i].title, wiki_points[i].extract);
                this.visitedWikiIds.push(wiki_points[i].pageid);
                break;
            }
        }
    }*/

    locationString(latLng, begin, end){
      var olc='';
      for (var i=begin; i<=end; i+=2)
        olc=olc.concat(OpenLocationCode.encode(latLng.lat, latLng.lng, i)+((i!=end)?"-":""));
      return olc;
    }

    generateDescription(waypoint){

      if (!waypoint.latLng){
        return alert("Invalid position")
      }

      function choices(field){
        var a=[]
        for (var i in $(field)){
          if ($(field)[i].checked)
            a.push($(field)[i].value);
        }
        return (a.length!=0)?a.join('-'):'none';
      }

      var olc=this.locationString(waypoint.latLng, 6, 10);
        olc=olc.concat(':', $("#purp").val());
        olc=olc.concat(':', $('#lang').find(":selected").attr("val"));
        olc=olc.concat(':', choices("[name=cont]"));
        olc=olc.concat(':A', $("#aud").val());
        olc=olc.concat(':P', $("#det").val());
        return olc;
    }

    go(begin_itinerary = false){
        if (clicked){
            console.log(nav);
            if (nav)
                nav.stop();
            if (L.routes) L.routes = [];//this.getItinerary().setWaypoints([]);
            nav=new polloNavigator(navigatorControl.onpoint, navigatorControl.onend, navigatorControl.wondering);
            console.log(L.routes);
            nav.navigate(begin_itinerary);
        }
        else {
            this.Paul.say("you have to activate the geolocalisation");
        }
    }

    getselectedWaypoint(){
      return this.selectedWaypoint
    }

    uploadVideo(){
      var title=$("#video-title").val();
      var description=this.generateDescription(($("#position").val()=="user")?L.userPosition:facade.selectedWaypoint);
      var category=22;
      var metadata = {
        snippet: {
          title: title,
          description: description,
          categoryId: category
        },
        status: {
          privacyStatus: 'private'//SE HO MESSO PRIVATE È PERCHÉ VA PRIVATE
        }
      };
      if (!title || title.length==0){
        return alert("Specify track's title");
      }
      YTUploader.uploadBlob(SimpleRecorder.videoBlob, metadata);
    }
}
