class PointOfInterest{
    constructor(maxPoints){
        this.points = [];
        this.markers = [];
        this.currentItinerary = new Itinerary();
        this.maxPoints = maxPoints;
        this.url = "http://localhost:3000";
    }

    getItinerary(){
        return this.currentItinerary;
    }

    loadItineraries(){
        var bound = map.getBounds();
        var parentThis = this;
        $.ajax({
            url: parentThis.url+"/about?swlat="+bound._southWest.lat+"&swlng="+bound._southWest.lng+"&nelat="+bound._northEast.lat+"&nelng="+bound._northEast.lng,
            method: "GET",
            dataType: "json",
            async: true,
            success: (data) => {
                parentThis.points = data.result;
                while (parentThis.markers.length > 0) parentThis.removeMarker(parentThis.markers[0], 0);
                for (var i in parentThis.points) parentThis.setMarker(parentThis.points[i].waypoints[0].latLng);
                parentThis.points.forEach((obj, index) => {
                    parentThis.markers[index].on('click', () => {
                        var tmp = [];
                        for (var i in parentThis.points[index].waypoints)
                            tmp.push(parentThis.points[index].waypoints[i].latLng);
                        parentThis.currentItinerary.setWaypoints(tmp.slice(0));
                        parentThis.currentItinerary.showOnMap();
                    });
                });
            }
        });
    }

    setMarker(latLng){
        this.markers[this.markers.length] = new L.Marker(
            latLng,
            {
                draggable: false
            }
        ).addTo(map);
    }

    removeMarker(marker, i){
        map.removeLayer(marker);
        this.markers.splice(i,1);
    }

    removeAllMarkers(){
        while (this.markers.length > 0){
            map.removeLayer(this.markers[0]);
            this.markers.splice(0,1);
        }
    }
}