class navigatorController{
    constructor(itinerary){
        this.itinerary = itinerary;
        this.reachItinerary = this.reachItinerary.bind(this);
        this.wondering = this.wondering.bind(this);
        this.onpoint = this.onpoint.bind(this);
        this.onend = this.onend.bind(this);
    }

    reachItinerary(position, itinerary) {
        var control = this.itinerary.getControl();
        if (control)
          map.removeControl(control);
        console.log([position], itinerary)
        var tmp_itinerary={}
        tmp_itinerary.waypoints=Object.assign([], itinerary);
        tmp_itinerary.waypoints=([position].concat(tmp_itinerary.waypoints));
          console.log(tmp_itinerary.waypoints)
        this.itinerary.setWaypoints(tmp_itinerary.waypoints.map(function(i){return {latLng: i}}));
    }
 
    wondering(nearest){
        function coordsFromInstructin(i){
            return L.routes[0].coordinates[i.index];
        }
        function preserve_waypoints(i){
            return (L.routes[0].waypointIndices.includes(i.index)) && i.index>=nearest;
        }
        console.log(L.routes[0].instructions, L.routes[0].waypointIndices	)
        document.addEventListener("route-available", nav.navigate)
        nav.stopped=true;
        var tmp_route=Object.assign([], L.routes[0].instructions)
        //tmp_route=tmp_route.map(coordsFromInstructin);
        tmp_route=tmp_route.filter(preserve_waypoints).map(coordsFromInstructin);
        console.log(tmp_route)
        L.routes[0]=undefined;
        this.reachItinerary(L.latLng(L.userPosition.lat, L.userPosition.lng), tmp_route/*.splice(nearest)*/)
    }

    onpoint (waypoint){
        console.log(waypoint.text)
        //Paul.say(waypoint.text);
    }
    
    onend (){
        //Paul.say("You reached your destination");
    }
}