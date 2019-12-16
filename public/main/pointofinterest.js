class PointOfInterest{
    constructor(itinerary, maxPoints){
        this.itineraryStartPoints = [];
        this.points = [];
        this.wikipediaPoints = [];
        this.wikipediaMarkers = [];
        this.markers = [];
        this.itineraryStartMarkers = [];
        this.currentItinerary = itinerary;
        this.addedPointMarker = {};
        this.addedPoint = {};
        this.searchPoint = {};
        this.searchPointMarker = {}
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
            url: parentThis.url+"/about?swlat="+bound._southWest.lat+"&swlng="+bound._southWest.lng+"&nelat="+bound._northEast.lat+"&nelng="+bound._northEast.lng+"&maxpoints="+parentThis.maxPoints,
            method: "GET",
            dataType: "json",
            async: true,
            success: (data) => {
                parentThis.itineraryStartPoints = data.itineraryStartPoints;
                parentThis.points = data.points;
                while (parentThis.markers.length > 0) parentThis.removePointsMarker(0);
                while (parentThis.itineraryStartMarkers.length > 0) parentThis.removeItineraryMarker(0);
                for (var i in parentThis.itineraryStartPoints) parentThis.setItineraryMarker(parentThis.itineraryStartPoints[i].inputWaypoints[0].latLng);
                for (var i in parentThis.points) parentThis.setPointsMarker(parentThis.points[i].latLng);
                parentThis.itineraryStartPoints.forEach((obj, index) => {
                    parentThis.itineraryStartMarkers[index].on('click', () => {
                        parentThis.removeSearchMarker();
                        parentThis.currentItinerary.getRouteFromDB(parentThis.itineraryStartPoints[index]._id)
                            .then((data) => {
                                for (var i in data.route[0].waypoints) data.route[0].waypoints[i].description = "a little description";
                                parentThis.currentItinerary.setRoute(data.route);
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
                            parentThis.setWikipediaMarker(a.query.pages[i].latLng);
                }}};
                var wiki = new wikiSearcher(options);
                wiki.searchOnMap(map,10);
                while(parentThis.wikipediaMarkers.length > 0) parentThis.removeWikipediaMarker(0);

            },
            error: (data) => {
                console.log("getting points failed");
            }
        });
}

    setPointsMarker(latLng){
        var parentThis = this;
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

    setItineraryMarker(latLng){
        var parentThis = this;
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

    setWikipediaMarker(latLng){
        var parentThis = this;
        var len = this.wikipediaMarkers.length;
        var icon = L.icon({
            iconUrl: "./img/wikipedia.svg"
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
                iconUrl: "./img/wikipedia.svg"
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

    setSearchMarker(point){
        var parentThis = this;
        this.searchPoint = point;
        this.searchPointMarker = new L.Marker(
            point.latLng,
            {
                draggable: false
            }
        );
        this.searchPointMarker.bindPopup(this.searchPoint.description.toString());
        this.searchPointMarker.on('mouseover', () => {
            parentThis.searchPointMarker.openPopup();
        });
        this.searchPointMarker.on('mouseout', () => {
            parentThis.searchPointMarker.closePopup();
        });
        this.searchPointMarker.addTo(map);
        return this.searchPointMarker;
    }

    removePointsMarker(position){
        map.removeLayer(this.markers[position]);
        this.markers.splice(position,1);
    }

    removeItineraryMarker(position){
        map.removeLayer(this.itineraryStartMarkers[position]);
        this.itineraryStartMarkers.splice(position,1);
    }

    removeWikipediaMarker(position){
        map.removeLayer(this.wikipediaMarkers[position]);
        this.wikipediaMarkers.splice(position,1);
    }

    removeSearchMarker(){
        map.removeLayer(this.searchPointMarker);
    }

    removeAddedPointMarker(){
        map.removeLayer(this.addedPointMarker);
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
        if (this.searchPointMarker) map.removeLayer(this.searchPointMarker);
        if (this.addedPointMarker) map.removeLayer(this.addedPointMarker);
    }

    addPoint(latLng){
        var popup = "<input id='popupInput' type='text'><button onclick='apply()'>Apply</button>";
        var customOptions =
        {
            'maxWidth': '500',
        };
        if (this.addedPointMarker) this.removeAddedPointMarker();
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
