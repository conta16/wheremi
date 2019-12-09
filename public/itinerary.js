class Itinerary {
    constructor(){
        this.itinerary = {
            label: "",
            waypoints: [],
            route:[]
        }; //waypoints of the itinerary shown on the map. there can only be one itinerary showed at a time
        this.markers = [];
        this.url = "http://localhost:3000";
        this.control = undefined;
        this.mode = 0; //0 when in visit mode, 1 when in create itinerary mode
        this.block = 0; //to prevent click event after drag event
        this.init_itinerary(this.itinerary);
    }

    init_itinerary(itinerary){
        this.control = L.Routing.control({
          waypoints: itinerary.waypoints,
          routeWhileDragging: true
        }).on('routesfound', function(e) {
            L.routes = e.routes;
            var f= new Event ("route-available");
            document.dispatchEvent(f);
        });
        this.control.addTo(map);
    }

    pushWaypoints(waypoints){
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
            this.itinerary.waypoints.push(Object.assign({}, obj));
        }
        //this.showOnMap();
    }

    setWaypoints(waypoints){
        this.itinerary.waypoints = [];
        this.pushWaypoints(waypoints);
    }

    getWaypoints(){
        var tmp = [];
        for (var i in this.itinerary.waypoints)
            tmp.push(this.itinerary.waypoints[i].latLng);
        return tmp.slice(0);
    }

    removeWaypoints(pos, delta){
        this.itinerary.waypoints.splice(pos, delta);
    }

    showOnMap(markerUpdate = true){
        var tmp = [];
        for (var i in this.itinerary.waypoints)
            tmp.push(this.itinerary.waypoints[i].latLng);

        this.control.setWaypoints(tmp.slice(0));
        if (markerUpdate){
            while (this.markers.length > 0) this.removeMarker(this.markers[0], 0);
            for (var i in this.itinerary.waypoints) this.setMarker(this.itinerary.waypoints[i].latLng);
        }
        map.removeControl(this.control);
        this.control.addTo(map);
    }

    GSItineraryFromDB(query){ //get and show itinerary from mongodb
        var parentUrl = this.url;
        return new Promise(function(resolve,reject) {
            $.ajax({
                url: parentUrl+"?query="+query.toString(),
                method: "GET",
                async: true,
                dataType: "json",
                success: (data) =>{resolve(data)},
                error: (err) => {reject(err)}
            });
        });
    }

    postItineraryToDB(name){
        var parentThis = this;
        var parentUrl = this.url;
        this.itinerary.label = name;
        this.itinerary.route = L.routes;
        $.ajax({
            url: parentUrl,
            method: "POST",
            dataType: "json",
            data: {
                itinerary: JSON.stringify(parentThis.itinerary),
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

    setMarker(latLng){
        var parentThis = this;
        var index = this.markers.length;
        /*var redMarker = L.ExtraMarkers.icon({
            icon: 'fa-coffee',
            markerColor: 'red',
            shape: 'square',
            prefix: 'fa'
          });*/
        this.markers[index] = new L.Marker(
            latLng,
            {
                draggable: parentThis.mode? true : false,
                //icon: redMarker
            }
        ).addTo(map);

        this.markers[index].on('drag', () => {
            parentThis.block = 1;
        });

        this.markers[index].on('dragend', (e) => {
            parentThis.removeWaypoints(index,1);
            var tmp = parentThis.getWaypoints();
            tmp.splice(index,0,e.target._latlng);
            parentThis.setWaypoints(tmp);
            parentThis.showOnMap(false);
            setTimeout(() => {
                parentThis.block = 0;
            }, 500); //serious doubts
        });
    }

    removeMarker(marker, i){
        map.removeLayer(marker);
        this.markers.splice(i,1);
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
            for (var i in this.itinerary.waypoints){
                tmp = this.itinerary.waypoints[i];
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