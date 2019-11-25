class Itinerary {
    constructor(map, control, maxItineraries){
        this.itineraries = []; //itineraries shown on zoom event
        this.waypoints = []; //waypoints of the itinerary shown on the map. there can only be one itinerary showed at a time
        /*this.map = map;
        this.control = control;*/
        this.markers = [];
        this.maxItineraries = maxItineraries;
        this.url = "http://localhost:3000";
        this.init_itinerary(this.waypoints);
    }

    /*pushWaypoints(waypoints){
        for (var i in waypoints){
            this.waypoints.push(waypoints[i]);
            control.options.waypoints.push(L.latLng(waypoints[i].lat, waypoints[i].lng));
        }
        this.showOnMap();
    }*/


    init_itinerary(itinerary){
        control = L.Routing.control({
          waypoints: itinerary.waypoints,
          routeWhileDragging: true
      }).on('routesfound', function(e) {
                 L.routes = e.routes;
                      var f= new Event ("route-available");
                      document.dispatchEvent(f)
          })
      
        control.addTo(map);
      }

    setWaypoints(waypoints){
        this.waypoints = [];
        for (var i in waypoints){
            //this.waypoints = waypoints;
            this.waypoints.push(waypoints[i].latLng);
        }
        this.showOnMap();
    }

    showOnMap(){
        control.setWaypoints(this.waypoints);
        map.removeControl(control);
        control.addTo(map);
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
        $.ajax({
            url: parentUrl,
            method: "POST",
            dataType: "json",
            data: {
                waypoints: JSON.stringify(parentThis.waypoints),
                name: name,
                length: parentThis.waypoints.length
            },
            async: true,
            success: function(){
                console.log("posted successfully");
            }
        });
    }

    loadItineraries(){
        var bound = map.getBounds();
        var parentThis = this;
        $.ajax({
            url: parentThis.url+"/about?swlat="+bound._southWest.lat+"&swlng="+bound._southWest.lng+"&nelat="+bound._northEast.lat+"&nelng="+bound._northEast.lng,
            method: "GET",
            dataType: "json",
            async: true,
            /*data: {
                bounds: JSON.stringify(bound)
            },*/
            success: (data) => {
                parentThis.itineraries = data.result;
                for (var i = 0; i<parentThis.maxItineraries; i++){
                    if (parentThis.markers[i]) {
                        map.removeLayer(parentThis.markers[i]);
                        parentThis.markers[i] = undefined;
                    }
                }
                parentThis.itineraries.forEach((obj, index) => {
                    parentThis.markers[index] = new L.Marker(parentThis.itineraries[index].waypoints[0].latLng).addTo(map);
                    parentThis.markers[index].on('click', () => {
                        map.removeLayer(parentThis.markers[index]);
                        parentThis.markers[index] = undefined;
                        parentThis.setWaypoints(parentThis.itineraries[index].waypoints);
                    });
                });
            }
        });
    }


}