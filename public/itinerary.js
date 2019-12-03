class Itinerary {
    constructor(){
        this.itinerary = {
            label: "",
            waypoints: []
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
            document.dispatchEvent(f)
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
                _initHooksCalled : true 
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
        var i = this.markers.length;
        this.markers[i] = new L.Marker(
            latLng,
            {
                draggable: parentThis.mode? true : false
            }
        ).addTo(map);

        this.markers[i].on('drag', () => {
            parentThis.block = 1;
        });

        this.markers[i].on('dragend', (e) => {
            parentThis.removeWaypoints(i,1);
            var tmp = parentThis.getWaypoints();
            tmp.splice(i,0,e.target._latlng);
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

}