class Itinerary {
    constructor(){
        this.label = "";
        this.waypoints = [];
        this.route = [];
        this.id = "";
        this.childrenId = [];
        this.markers = [];
        this.url = "http://localhost:3000";
        this.control = undefined;
        this.mode = 0; //0 when in visit mode, 1 when in create itinerary mode
        this.block = 0; //to prevent click event after drag event
        this.init_itinerary();
    }

    init_itinerary(){
        var parentThis = this;
        this.control = L.Routing.control({
          waypoints: parentThis.waypoints,
          routeWhileDragging: true
        }).on('routesfound', function(e) {
            var f= new Event ("route-available");
            document.dispatchEvent(f);
        });
        this.control.addTo(map);
    }

    pushWaypoints(waypoints, point){
        var obj;
        for (var i in waypoints){
            obj = {                
                options : {
                    "allowUTurn" : false
                },
                latLng: Object.assign({},waypoints[i]),
                _initHooksCalled : true,
                description: "a little description"
            }
            if (i==0 && point) obj._id = point._id;
            this.waypoints.push(Object.assign({}, obj));
        }
        this.showOnMap();
    }

    setWaypoints(waypoints){
        this.waypoints = [];
        this.pushWaypoints(waypoints);
    }

    getWaypoints(){
        var tmp = [];
        for (var i in this.waypoints)
            tmp.push(this.waypoints[i].latLng);
        return tmp.slice(0);
    }

    removeWaypoints(pos, delta){
        this.waypoints.splice(pos, delta);
    }

    showOnMap(markerUpdate = true){

        var tmp = [];
        for (var i in this.waypoints)
            tmp.push(this.waypoints[i].latLng);

        this.setLabel("");
        this.control.setWaypoints(tmp.slice(0));
        if (markerUpdate){
            this.removeMarkers();
            this.setMarkers(tmp);
        }
        map.removeControl(this.control);
        this.control.addTo(map);
        if (this.waypoints != []) L.routes = []; //without this, when you setWaypoints([]) it reloads the old route (stored in L.routes) instead of putting an empty route
        this.route = L.routes;
    }

    setRoute(data){
        this.route = data.route;
        this.waypoints = data.inputWaypoints;
        this.label = data.label;
        this.id = data._id;
        this.childrenId = data.waypoints;
        this.showRoute();
    }

    getRouteFromDB(id){
        var parentThis = this;
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
            tmp.push(this.waypoints[i].latLng);
        }

        this.setMarkers(tmp);
    }

    setLabel(label){
        this.label = label;
    }

    GSItineraryFromDB(query){ //get and show itinerary from mongodb
        var parentUrl = this.url;
        return new Promise(function(resolve,reject) {
            $.ajax({
                url: parentUrl+"/search?query="+query.toString(),
                method: "GET",
                async: true,
                dataType: "json",
                success: (data) =>{console.log(data);resolve(data)},
                error: (err) => {reject(err)}
            });
        });
    }

    postItineraryToDB(name){
        var parentThis = this;
        var parentUrl = this.url;
        this.label = name;
        this.route = L.routes;
        $.ajax({
            url: parentUrl,
            method: "POST",
            dataType: "json",
            data: {
                label: JSON.stringify(parentThis.label),
                waypoints: JSON.stringify(parentThis.waypoints),
                route: JSON.stringify(parentThis.route)
            },
            async: true,
            success: function(){
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
            this.markers[i] = new L.Marker(
                waypoints[i],
                {
                    draggable: parentThis.mode? true : false,
                }
            ).addTo(map);
        }

        this.markers.forEach((obj, index) => {
            parentThis.markers[index].on('drag', () => {
                parentThis.block = 1;
            });

            parentThis.markers[index].on('dragend', (e) => {
                parentThis.removeWaypoints(index,1);
                var tmp = parentThis.getWaypoints();
                tmp.splice(index,0,e.target._latlng);
                parentThis.setWaypoints(tmp);
                //parentThis.showOnMap(false);
                setTimeout(() => {
                    parentThis.block = 0;
                }, 500); //serious doubts
            });
            parentThis.markers[index].bindPopup(parentThis.waypoints[index].description.toString());
            parentThis.markers[index].on('mouseover', () => {
                parentThis.markers[index].openPopup();
            });
            parentThis.markers[index].on('mouseout', () => {
                parentThis.markers[index].closePopup();
            });
        });
    }

    removeMarkers(){
        while(this.markers.length > 0){
            map.removeLayer(this.markers[0]);
            this.markers.splice(0,1);
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

    distance(lat1,lon1,lat2,lon2,unit){
        if (lat2==undefined)
            return Infinity;
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            var radlat1 = Math.PI * lat1/180;
            var radlat2 = Math.PI * lat2/180;
            var theta = lon1-lon2;
            var radtheta = Math.PI * theta/180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180/Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit=="K") { dist = dist * 1.609344 }
            if (unit=="N") { dist = dist * 0.8684 }
            return dist;
    }
}
}