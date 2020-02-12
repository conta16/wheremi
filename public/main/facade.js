class Facade{
    constructor(){
        this.graphics = new Graphics(this);
        this.itinerary = new Itinerary(this.graphics);
        this.pointsOfInterest = new PointOfInterest(this.itinerary, 5, this.graphics);
        this.user = new Users(this.itinerary);
        this.url = "http://localhost:3000";
    }

    getGraphics(){
        return this.graphics;
    }

    setAccount(obj){
        this.user.setAccount(obj);
    }

    getAccount(){
        return this.user.getAccount();
    }

    getUser(){
        return this.user;
    }

    getItinerary(){
        return this.itinerary;
    }

    getPointsOfInterest(){
        return this.pointsOfInterest;
    }

    getUser(){
        return this.user;
    }

    sendComment(id, comment, account){
        var parentThis = this;
        $.ajax({
            url: parentThis.url+"/sendcomment",
            method: "POST",
            dataType: "json",
            data: {
                id: JSON.stringify(id),
                comment: JSON.stringify(comment),
                account: JSON.stringify(account)
            },
            success: () => {
                console.log("comment posted successfully");
            },
            error: (error) => {
                console.log("error in posting comment");
                console.log(error);
            }
        });
    }

    checkLoggedIn() {
        var a=false;
          $.ajax({
            url: "/user",
            method: "GET",
            success: function(data){
              if (!$.isEmptyObject(data)){
                  console.log(data);
                var event =new CustomEvent('userLogged', {detail: {account:data}});
                document.dispatchEvent(event);
              }
            }
          });
    }

    createMode(){
        var mode = this.itinerary.getMode();
        if (!mode){
            this.itinerary.setMode(!mode);
            map.off('zoomend', parentThis.graphics.loadPoints); //può essere cambiato in pointsofinterest.loadpoints?
            map.off('drag', parentThis.graphics.loadPoints);
            this.pointsOfInterest.removeAllMarkers();
            this.itinerary.setWaypoints([]);
            removeButton.addTo(map);
            map.on('click', (e) => {
                if (parentThis.itinerary.getMode() != 2){
                    parentThis.pointsOfInterest.loadPoints();
                    map.on('zoomend', loadPoints);
                    map.on('drag', loadPoints);
                    if (parenThis.itinerary.getBlock()) parentThis.itinerary.setBlock(0);
                    else {
                        e.latLng = e.latlng;
                        var waypoints = parentThis.itinerary.getWaypoints();
                    parentThis.graphics.styleInspect(itineraryHTML);
                        parentThis.itinerary.pushWaypoints([e.latLng]);
                    }
                }
            });
        }
        else{
            parentThis.graphics.styleInspect("");
            parentThis.itinerary.setMode(!mode);
            map.off('click');
            parentThis.itinerary.setWaypoints([]);
            map.removeControl(removeButton);
            parentThis.pointsOfInterest.loadPoints();
            map.on('zoomend', loadPoints);
            map.on('drag', loadPoints);
        }
    }

    ldItinerary(){
        this.graphics.styleInspect("");
        var str = this.itinerary.waypoints[0].title;
        if (!str || str.length == 0) alert("You have to insert a name to the itinerary");
        else if (this.itinerary.getWaypoints().length > 1 ) itinerary.postItineraryToDB();
        else this.itinerary.postPoint();
        this.itinerary.setWaypoints([]);
    }

    eventFire(el, etype){
        if (el.fireEvent) {
          el.fireEvent('on' + etype);
        } else {
          var evObj = document.createEvent('Events');
          evObj.initEvent(etype, true, false);
          el.dispatchEvent(evObj);
        }
      }
}