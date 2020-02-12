class Facade{
    constructor(){
        this.inizialize_leaf();
        this.graphics = new Graphics(this);
        this.itinerary = new Itinerary(this.graphics);
        this.pointsOfInterest = new PointOfInterest(this.itinerary, 5, this.graphics);
        this.user = new Users(this.itinerary, this);
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
        
        
        var Paul=new Artyom();
        
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
            var options= {setView:'always', sharePosition: true, showCompass: true, markerStyle:{radius: mobile? 18: 9}, compassStyle:{radius: mobile? 18: 9}, flyTo:true,locateOptions:{watch:true, enableHighAccuracy:true}};
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
}