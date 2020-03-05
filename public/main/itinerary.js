class Itinerary {
    constructor(graphics, facade){
        this.user_id = {};
        this.label = "";
        this.waypoints = [];
        this.route = [];
        this.id = "";
        this.childrenId = [];
        this.markers = [];
        this.url = "https://site181951.tw.cs.unibo.it";
        this.graphics = graphics;
        this.facade = facade;
        this.control = undefined;
        this.mode = 0; //0 when in visit mode, 1 when in create itinerary mode, 2 when in delete mode
        this.block = 0; //to prevent click event after drag event
        this.init_itinerary();
    }

    init_itinerary(){
        var parentThis = this;
        this.control = L.Routing.control({
          waypoints: parentThis.waypoints,
          routeWhileDragging: true,
          router: L.Routing.mapbox('sk.eyJ1Ijoid2hlcmVtaSIsImEiOiJjazZna2ZvYXEyY3VxM2twa296ejRkMXV1In0.AwVdQemoA7pL8VAJEKVojA'),
        }).on('routesfound', function(e) {
            var f= new Event ("route-available");
            document.dispatchEvent(f);
        });
        this.control.addTo(map);

        $(document).on('change','#f', function () {
            var files = this.files;
            if (this.files.length > 0) {

                $.each(this.files, function (index, value) {
                    var reader = new FileReader();

                    reader.onload = function (e) {
                        var event = new CustomEvent('loadimg', { 'detail': {'files': files, 'src': e.target.result}});
                        console.log(e);
                        var slideItem;
                        var sstr = e.target.result.substring(0,14);
                        if (sstr === "data:video/mp4" || sstr === "data:video/mp3") slideItem = '<div class="carousel-video-inner"> <video controls autoplay preload="metadata"><source src="'+e.target.result+'" type="video/mp4"/>Video not supported.</video></div>';
                        else if ($('.carousel-item')[0]) slideItem = "<div class='carousel-item'><img class='d-inline-block w-100' style='height:300px;' src='"+e.target.result+"' alt=''></div>";
                        else slideItem = "<div class='carousel-item active'><img class='d-inline-block w-100' style='height:300px;' src='"+e.target.result+"' alt=''></div>";
                        $('.carousel-inner').append(slideItem);
                        document.dispatchEvent(event);
                    };
                    reader.readAsDataURL(this);
                });
            }
        });
    }
    setUserID(user){
        this.user_id = user;
    }

    pushWaypoints(waypoints, point, show = true){
        var obj;
        for (var i in waypoints){
            if (!point) obj = {
                options : {
                    "allowUTurn" : false
                },
                latLng: Object.assign({},waypoints[i]),
                _initHooksCalled : true,
                files: [],
                img: [],
                title: "",
                description: "",
                /*purpose: {},
                lang: {},
                content: {},
                audience: {},
                detail: {},*/
                write_permit: true
            };
            else {
                //if (!point.extract) obj = point;
                if (point.extract){
                    point.description = point.extract;
                    point.options = {
                        "allowUTurn" : false
                    };
                    point._initHooksCalled = true;
                    point.files = [];
                    point.img = [];
                    point.write_permit = false;
                    delete point.ns;
                    delete point.pageid;
                    delete point.extract;
                }
                
                obj = point;
            }
            if (i==0 && point && point.id) {
                obj._id = point._id;
            }
            this.waypoints.push(Object.assign({}, obj));
        }
        console.log(this.waypoints);
        if (show) this.showOnMap();
    }

    setWaypoints(waypoints){
        this.waypoints = [];
        if (waypoints) this.pushWaypoints(waypoints);
    }

    getLatlngs(){
        var tmp = [];
        for (var i in this.waypoints)
            tmp.push(this.waypoints[i].latLng);
        return tmp.slice(0);
    }

    getWaypoints(){
        return this.waypoints;
    }

    removeWaypoint(pos){
        this.waypoints.splice(pos, 1);
    }

    showOnMap(markerUpdate = true){

        var tmp = [];
        for (var i in this.waypoints)
            tmp.push(this.waypoints[i]);

        this.setLabel("");
        this.control.setWaypoints(tmp.slice(0));
        if (markerUpdate){
            this.removeMarkers();
            this.setMarkers(tmp);
        }
        map.removeControl(this.control);
        this.control.addTo(map);
        //if (this.waypoints != []) L.routes = []; //without this, when you setWaypoints([]) it reloads the old route (stored in L.routes) instead of putting an empty route
        this.route = L.routes;
    }

    setRoute(data){
        this.route = data.route;
        this.waypoints = data.inputWaypoints;
        this.label = data.label;

        this.id = data._id;

        this.childrenId = data.waypoints;
        console.log(this.childrenId);
        console.log(this.route);
        console.log(this.waypoints);
        console.log(this.label);
        console.log(this.id);


        this.showRoute();
    }

    getRouteFromDB(id){
        var parentThis = this;
        console.log("getroute");console.log(id);
        return new Promise((resolve, reject) => {
            $.ajax({
                url: parentThis.url+"/route?id="+id,
                method: 'GET',
                dataType: 'json',
                success: (data) => {
                    resolve(data);
                },
                error: () => {
                    console.log("error in getting route by id");
                    reject();
                }
            });
        });
    }

    showRoute(){
        this.removeMarkers();
        this.control.setAlternatives(this.route);
        var tmp = [];
        for (var i in this.waypoints){
            tmp.push(this.waypoints[i]);
        }

        this.setMarkers(tmp);
    }

    setLabel(label){
        this.label = label;
    }

    GSItineraryFromDB(label, username){ //get and show itinerary from mongodb
        var parentUrl = this.url;
        if (username) return new Promise(function(resolve,reject) {
            $.ajax({
                url: parentUrl+"/search?label="+label.toString()+"&username="+username.toString(),
                method: "GET",
                async: true,
                dataType: "json",
                success: (data) =>{console.log(data);resolve(data)},
                error: (err) => {reject(err)}
            });
        });
        else return new Promise(function(resolve,reject) {
            $.ajax({
                url: parentUrl+"/search?label="+label.toString(),
                method: "GET",
                async: true,
                dataType: "json",
                success: (data) =>{console.log(data);resolve(data)},
                error: (err) => {reject(err)}
            });
        });
    }

    getId(){
        return this.id;
    }

    postItineraryToDB(){
        var parentThis = this;
        var parentUrl = this.url;
        this.label = this.waypoints[0].title;
        this.route = L.routes;
        $.ajax({
            url: parentUrl,
            method: "POST",
            dataType: "json",
            data: {
                label: JSON.stringify(parentThis.label),
                waypoints: JSON.stringify(parentThis.waypoints),
                route: JSON.stringify(parentThis.route),
                user_id: JSON.stringify(parentThis.facade.getAccount()._id)
            },
            async: true,
            success: function(data){
                parentThis.id = data;
                var event = new CustomEvent("it_added", {});
                document.dispatchEvent(event);
                console.log("posted successfully");
            },
            error: function(){
                console.log("posted unsuccesfully");
            }
        });
    }

    setMarkers(waypoints){
        var parentThis = this;
        //var index = this.markers.length;
        for (var i in waypoints){
            var icon = L.icon({
                iconUrl: "./img/itmarker.png",
                iconSize: [40,40],
                iconAnchor: [20,40]
            });
            this.markers[i] = new L.Marker(
                waypoints[i].latLng,
                {
                    icon: icon
                }
            ).addTo(map);
            if (parentThis.mode) this.markers[i].dragging.enable();
            else this.markers[i].dragging.disable();
        }

        this.markers.forEach((obj, index) => {
            parentThis.markers[index].on('drag', () => {
                parentThis.block = 1;
            });

            parentThis.markers[index].on('dragend', (e) => {
                parentThis.removeWaypoint(index);
                var tmp = parentThis.getLatlngs();
                tmp.splice(index,0,e.target._latlng);
                parentThis.setWaypoints(tmp);
                //parentThis.showOnMap(false);
                setTimeout(() => {
                    parentThis.block = 0;
                }, 500); //serious doubts
            });
            parentThis.markers[index].on('click', (e) => {
                var waypoints = parentThis.waypoints;
                //if (index > 0)
                    if (parentThis.mode && waypoints[index].write_permit == true){
                        parentThis.graphics.loadMenu(waypoints, index, true, true);
                    }
                    else parentThis.graphics.loadMenu(waypoints, index, false, true);
                /*else
                    if (parentThis.mode && waypoints[index].write_permit == true){ //se si vuole mettere comportamento diverso per primo punto itinerario
                        loadMenu(waypoints, index, true, true);
                    }
                    else loadMenu(waypoints, index, false, true);*/
            });
        });
    }

    postPoint(){
        var parentThis = this;
        this.waypoints[0].startItinerary = false;
        this.waypoints[0].user_id = parentThis.facade.getAccount()._id;
        $.ajax({
            url: parentThis.url+"/postAdded",
            method: "POST",
            async: true,
            dataType: "json",
            data: {
                point: JSON.stringify(parentThis.waypoints[0])
            },
            success: () => {
                console.log("added point posted successfully");
            },
            error: () => {
                console.log("added point posted unsuccessfully");
            }
        });
    }

    removeMarkers(){
        while(this.markers.length > 0){
            map.removeLayer(this.markers[0]);
            this.markers.splice(0,1);
        }
    }

    removeMarker(pos){
        map.removeLayer(this.markers[pos]);
        this.markers.splice(pos,1);
    }

    removePoint(){
        var parentThis = this;
        var parse = []; //when a marker is deleted, it messes up the events. this fixes it
        $('#inspect').html(itineraryHTML);
        if (this.mode == 1)
        {
            this.setMode(2);
            this.markers.forEach((obj, index) => {
                parse.push(index);
                parentThis.markers[index].off('click');
                parentThis.markers[index].on('click', (e) => {
                    parentThis.removeWaypoint(parse[index]);
                    parentThis.removeMarker(parse[index]);
                    parentThis.showOnMap(false);
                    for (var i = parse.length-1; i>index; i--) parse[i]--;
                    parse[index]=-1;
                });

            });
        }
        else {
            this.setMode(1);
            this.markers.forEach((obj,index) => {
                parentThis.markers[index].off('click');
                parentThis.markers[index].on('click', (e) => {
                    var waypoints = parentThis.waypoints;
                    if (parentThis.mode) parentThis.graphics.loadMenu(waypoints, index);
                    else parentThis.graphics.loadMenu(waypoints, index, false);
                });
            });
        }
    }

    setMode(mode){
        this.mode = mode;
    }

    getMode(){
        return this.mode;
    }

    getBlock(){
        return this.block;
    }

    setBlock(value){
        this.block = value;
    }

    getControl(){
        return this.control;
    }

    checkWaypointInRange(){
        var tmp;
        if (L.userPosition)
            for (var i in this.waypoints){
                tmp = this.waypoints[i];
                if (this.distance(L.userPosition.lat, L.userPosition.lng, tmp.latLng.lat, tmp.latLng.lng, 'K') < 50){
                    console.log(tmp.description);
                }
            }
    }

}
