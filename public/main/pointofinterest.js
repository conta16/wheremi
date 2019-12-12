class PointOfInterest{
    constructor(itinerary, maxPoints){
        this.itineraryStartPoints = [];
        this.points = [];
        this.wikipediaPoints = [];
        this.wikipediaMarkers = [];
        this.markers = [];
        this.itineraryStartMarkers = [];
        this.currentItinerary = itinerary;
        this.addedPointMarker = undefined;
        this.addedPoint = {};
        this.maxPoints = maxPoints;
        this.url = "http://localhost:3000";
    }

    getItinerary(){
        return this.currentItinerary;
    }

    loadPoints(){
        var bound = map.getBounds();
        var parentThis = this;
        //this.removeAllMarkers();
        $.ajax({
            url: parentThis.url+"/about?swlat="+bound._southWest.lat+"&swlng="+bound._southWest.lng+"&nelat="+bound._northEast.lat+"&nelng="+bound._northEast.lng,
            method: "GET",
            dataType: "json",
            async: true,
            success: (data) => {
                parentThis.itineraryStartPoints = data.itineraryStartPoints;
                parentThis.points = data.points;
                while (parentThis.markers.length > 0) parentThis.removeMarker(parentThis.markers[0], 0, 0);
                while (parentThis.itineraryStartMarkers.length > 0) parentThis.removeMarker(parentThis.itineraryStartMarkers[0], 0, 1);
                for (var i in parentThis.itineraryStartPoints) parentThis.setMarker(parentThis.itineraryStartPoints[i].inputWaypoints[0].latLng, 1);
                for (var i in parentThis.points) parentThis.setMarker(parentThis.points[i].latLng, 0);
                parentThis.itineraryStartPoints.forEach((obj, index) => {
                    parentThis.itineraryStartMarkers[index].on('click', () => {
                        var tmp = [];
                        for (var i in parentThis.itineraryStartPoints[index].inputWaypoints)
                            tmp.push(parentThis.itineraryStartPoints[index].inputWaypoints[i].latLng);

                        parentThis.currentItinerary.getRouteFromDB(parentThis.itineraryStartPoints[index]._id)
                            .then((data) => {
                                parentThis.currentItinerary.setAll(parentThis.itineraryStartPoints[index].label, data.route, tmp.slice(0));
                            })
                            .catch(() => {});
                    });
                });
                parentThis.points.forEach((obj,index) => {
                    if (parentThis.markers[index]) parentThis.markers[index].on('click', () => {

                    });
                });

                this.wikipediaPoints = []; //with wikipedia stuff here, wikipedia links are loaded only if database responds successfully. Maybe it can be changed
                var options = {wiki_search_url: "https://en.wikipedia.org/w/api.php", introCallback: function(a){
                    if (a){
                        for (var i in a.query.pages)
                            parentThis.wikipediaPoints.push(a.query.pages[i]);
                        for (var i in a.query.pages)
                            parentThis.setMarker(a.query.pages[i].latLng, 2);
                }}};
                var wiki = new wikiSearcher(options);
                wiki.searchOnMap(map,10);
                while(parentThis.wikipediaMarkers.length > 0) parentThis.removeMarker(parentThis.wikipediaMarkers[0], 0, 2);

            },
            error: (data) => {
                console.log("getting points failed");
            }
        });
}

    setMarker(latLng, type){
        var parentThis = this;
        if (type == 0){
            var len = this.markers.length;
            this.markers[len] = new L.Marker(
                latLng,
                {
                    draggable: false
                }
            );
            this.markers[len].bindPopup(this.points[len].description.toString());
            this.markers[len].on('mouseover', () => {
                parentThis.markers[len].openPopup();
            });
            this.markers[len].on('mouseout', () => {
                parentThis.markers[len].closePopup();
            });
            this.markers[len].addTo(map);
        }
        if (type == 1){
            var len = this.itineraryStartMarkers.length;
            this.itineraryStartMarkers[len] = new L.Marker(
                latLng,
                {
                    draggable: false
                }
            );
            this.itineraryStartMarkers[len].bindPopup(this.itineraryStartPoints[len].label.toString());
            this.itineraryStartMarkers[len].on('mouseover', () => {
                parentThis.itineraryStartMarkers[len].openPopup();
            });
            this.itineraryStartMarkers[len].on('mouseout', () => {
                parentThis.itineraryStartMarkers[len].closePopup();
            });
            this.itineraryStartMarkers[len].addTo(map);
        }
        if (type == 2){
            var len = this.wikipediaMarkers.length;
            var icon = L.icon({
                iconUrl: "./wikipedia.svg"
            });
            this.wikipediaMarkers[len] = new L.Marker(
                latLng,
                {
                    icon: icon
                },
                {
                    draggable: false
                }
            );
            this.wikipediaMarkers[len].bindPopup(this.wikipediaPoints[len].title.toString());
            this.wikipediaMarkers[len].on('mouseover', () => {
                parentThis.wikipediaMarkers[len].openPopup();
            });
            this.wikipediaMarkers[len].on('mouseout', () => {
                parentThis.wikipediaMarkers[len].closePopup();
            });
            this.wikipediaMarkers[len].addTo(map);
        }
    }

    removeMarker(marker, position, type){
        map.removeLayer(marker);
        if (type == 0) this.markers.splice(position,1);
        if (type == 1) this.itineraryStartMarkers.splice(position,1);
        if (type == 2) this.wikipediaMarkers.splice(position,1);
    }

    removeAllMarkers(){
        while (this.markers.length > 0){
            map.removeLayer(this.markers[0]);
            this.markers.splice(0,1);
        }
        while (this.itineraryStartMarkers.length > 0){
            map.removeLayer(this.itineraryStartMarkers[0]);
            this.itineraryStartMarkers.splice(0,1);
        }
        while (this.wikipediaMarkers.length > 0){
            map.removeLayer(this.wikipediaMarkers[0]);
            this.wikipediaMarkers.splice(0,1);
        }
    }

    addPoint(latLng){
        var popup = "<input id='popupInput' type='text'><button onclick='apply()'>Apply</button>";
        var customOptions =
        {
            'maxWidth': '500',
        };
        if (this.addedPointMarker) this.removeMarker([this.addedPointMarker],0,0);
        this.addedPointMarker = new L.Marker(
            latLng,
            {
                draggable: true
            }
        ).bindPopup(popup, customOptions).addTo(map);
        this.addedPoint = {
            "options": { "allowUTurn" : false },
            "latLng" : latLng,
            "_initHooksCalled": true,
            "startItinerary": false,
            "description": ""
        }
    }

    postAddedPoint(){
        var parentThis = this;
        $.ajax({
            url: parentThis.url+"/postAdded",
            method: "POST",
            async: true,
            dataType: "json",
            data: {
                point: JSON.stringify(parentThis.addedPoint)
            },
            success: () => {
                console.log("added point posted successfully");
            },
            error: () => {
                console.log("added point posted unsuccessfully");
            }
        });
    }
}