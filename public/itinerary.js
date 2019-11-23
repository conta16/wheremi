class Itinerary {
    constructor(map, control){
        this.waypoints = [];
        this.map = map;
        this.control = control;
        this.url = "http://localhost:3000";
        this.load_itinerary(this.waypoints);
    }

    /*pushWaypoints(waypoints){
        for (var i in waypoints){
            this.waypoints.push(waypoints[i]);
            control.options.waypoints.push(L.latLng(waypoints[i].lat, waypoints[i].lng));
        }
        this.showOnMap();
    }*/


    load_itinerary(itinerary){
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
        console.log("setWaypoints: "+this.waypoints);
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


}