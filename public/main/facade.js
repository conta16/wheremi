class Facade{
    constructor(){
        this.inizialize_leaf();

        this.graphics = new Graphics(this);
        this.itinerary = new Itinerary(this.graphics, this);
        this.pointsOfInterest = new PointOfInterest(this.itinerary, 5, this.graphics);
        this.user = new Users(this.itinerary, this);
        this.Paul = new Artyom();
        this.Paul.initialize({
            lang: 'en', //todo: change language based on location or user preferences
            continuous: false, // Listen forever
            soundex: true,// Use the soundex algorithm to increase accuracy
            debug: true, // Show messages in the console
            executionKeyword: "",//Esegui dopo questa spressione
            listen: false, // Start to listen commands !

            // If providen, you can only trigger a command if you say its name
            // e.g to trigger Good Morning, you need to say "Jarvis Good Morning"
            name: "Paul"
        });
        this.url = "http://localhost:3000";
    }

    inizialize_leaf(){
        this.map = L.map('map', {
            // Set latitude and longitude of the map center (required)
            center: [44.7,10.633333],
            // Set the initial zoom level, values 0-18, where 0 is most zoomed-out (required)
            zoomControl: false,
            zoom: 3,
            minZoom: 3
        });

        map = this.map;

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


        /*this.Paul=new Artyom();

        this.Paul.initialize({
            lang: 'en', //todo: change language based on location or user preferences
            continuous: true, // Listen forever
            soundex: true,// Use the soundex algorithm to increase accuracy
            debug: true, // Show messages in the console
            executionKeyword: "",//Esegui dopo questa spressione
            listen: false, // Start to listen commands !

            // If providen, you can only trigger a command if you say its name
            // e.g to trigger Good Morning, you need to say "Jarvis Good Morning"
            name: "Paul"
        });*/


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
            var options= {setView:'once', sharePosition: true, showCompass: true, markerStyle:{radius: mobile? 18: 9}, compassStyle:{radius: mobile? 18: 9}, flyTo:false,locateOptions:{watch:false, enableHighAccuracy:true}};
            options.defaultLatLng=Object.assign({}, defaultLatLng);
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
            map.off('zoomend', loadPoints); //può essere cambiato in pointsofinterest.loadpoints?
            map.off('drag', loadPoints);
            this.pointsOfInterest.removeAllMarkers();
            this.itinerary.setWaypoints([]);
            this.graphics.removeButton.addTo(map);
            map.on('click', (e) => {
                if (parentThis.itinerary.getMode() != 2){
                    loadPoints();
                    map.on('zoomend', loadPoints);
                    map.on('drag', loadPoints);
                    if (parentThis.itinerary.getBlock()) parentThis.itinerary.setBlock(0);
                    else {
                        e.latLng = e.latlng;
                        var waypoints = parentThis.itinerary.getWaypoints();
                    parentThis.graphics.styleInspect(itineraryHTML);
                        parentThis.itinerary.pushWaypoints([e.latLng]);
                    }
                }
            });
        }
        else{
            parentThis.graphics.styleInspect("");
            parentThis.itinerary.setMode(!mode);
            map.off('click');
            parentThis.itinerary.setWaypoints([]);
            map.removeControl(parentThis.graphics.removeButton);
            loadPoints();
            map.on('zoomend', loadPoints);
            map.on('drag', loadPoints);
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
            if (this.distance(L.userPosition.latLng.lat, L.userPosition.latLng.lng, pos.lat, pos.lng) < 50 && !it_points[i].inputWaypoints[0].played){
                this.Paul.say(it_points[i].inputWaypoints[0].title);
                this.Paul.say(it_points[i].inputWaypoints[0].description);
                this.graphics.loadMenu(it_points[i].inputWaypoints,0,false,false);
                this.graphics.addStopButton();
                it_points[i].inputWaypoints[0].played = true;
            }
        }

        for (var i in points){
            var pos = points[i].latLng;
            if (this.distance(L.userPosition.latLng.lat, L.userPosition.latLng.lng, pos.lat, pos.lng) < 50 && !points[i].played){
                this.Paul.say(points[i].title);
                this.Paul.say(points[i].description);
                this.graphics.loadMenu(points,i,false,false);
                this.graphics.addStopButton();
                points[i].played = true;
            }
        }

        for (var i in wiki_points){
            var pos = wiki_points[i].latLng;
            if (this.distance(L.userPosition.latLng.lat, L.userPosition.latLng.lng, pos.lat, pos.lng) < 50 && !wiki_points[i].played){
                this.Paul.say(wiki_points[i].title);
                this.Paul.say(wiki_points[i].extract);
                $("#inspect").html("<div class='container'><h2>"+wiki_points[i].title+"</h2><p>"+wiki_points[i].extract+"</p></div>");
                gotoTab(INSPECT_TAB);
                this.graphics.addStopButton();
                wiki_points[i].played = true;
            }
        }
    }

    startItinerary(){
        nav=new polloNavigator(navigatorControl.onpoint, navigatorControl.onend, navigatorControl.wondering);
        console.log(nav);
        nav.navigate();
    }
}
