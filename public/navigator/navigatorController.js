class navigatorController{
    constructor(itinerary){
        this.itinerary = itinerary;
        this.reachItinerary = this.reachItinerary.bind(this);
        this.wondering = this.wondering.bind(this);
        this.onpoint = this.onpoint.bind(this);
        this.onend = this.onend.bind(this);
        this.listOfPoints = [];
		this.indexOfList = -1;
    }

    reachItinerary(position, itin) {
        var control = this.itinerary.getControl();
        if (control)
          map.removeControl(control);
        //console.log([position], itinerary)
        /*var tmp_itinerary={}
        tmp_itinerary.waypoints=Object.assign([], itinerary);
        tmp_itinerary.waypoints=([position].concat(tmp_itinerary.waypoints));
        tmp_itinerary.waypoints[0]=L.userPosition.latLng;
        console.log(tmp_itinerary.waypoints);*/
       // this.itinerary.setWaypoints([L.userPosition.latLng]);
        var l = itin.length;
        console.log (itin);
        this.itinerary.setWaypoints();
        var a=[position];
        for (var i in itin){
          a.push(itin[i])
        }
        console.log(a);
        this.itinerary.setWaypoints(a);
    }

    // wondering(nearest){
    //     document.removeEventListener("route-available", nav.navigate);
    //     function coordsFromInstructin(i){
    //         return L.routes[0].coordinates[i.index];
    //     }
    //     function preserve_waypoints(i){
    //         return (L.routes[0].waypointIndices.includes(i.index)) && i.index>=nearest;
    //     }
    //     //console.log(L.routes[0].instructions, L.routes[0].waypointIndices	)
    //     document.addEventListener("route-available", nav.navigate);
    //     nav.stop();
    //     var tmp_route=Object.assign([], L.routes[0].instructions)
    //     //tmp_route=tmp_route.map(coordsFromInstructin);
    //     tmp_route = Object.assign({},this.itinerary.getWaypoints());
    //     //tmp_route=tmp_route.filter(preserve_waypoints).map(coordsFromInstructin);
    //     //console.log(tmp_route)
    //     L.routes[0]=undefined;
    //     this.reachItinerary(L.latLng(L.userPosition.lat, L.userPosition.lng), tmp_route/*.splice(nearest)*/)
    // }

    wondering(nearest){
      console.log("wondering")
        document.removeEventListener("route-available", nav.navigate);
        function coordsFromInstruction(i){
            return L.routes[0].coordinates[i.index];
        }
        function preserve_waypoints(i){
            return (L.routes[0].waypointIndices.includes(i.index)) && i.index>=nearest;
        }
        //console.log(L.routes[0].instructions, L.routes[0].waypointIndices	)
        document.addEventListener("route-available", nav.navigate);
        nav.stop();
        var tmp_route=Object.assign([], L.routes[0].instructions)
        //tmp_route=tmp_route.map(coordsFromInstruction);
        //tmp_route = Object.assign({},this.itinerary.getWaypoints());
        tmp_route=tmp_route.filter(preserve_waypoints).map(coordsFromInstruction);
        //console.log(tmp_route)
        L.routes[0]=undefined;
        this.reachItinerary(L.userPosition.latLng, tmp_route.splice(nearest))
    }


    onpoint (waypoint){
        console.log(waypoint.text);
        badPaul.say(waypoint.text);
    }

    onend (){
        this.indexOfList += 1;
        this.listOfPoints[this.indexOfList] = L.userPosition
        L.routes=[];
        facade.setWaypoints([]);
    }
}
