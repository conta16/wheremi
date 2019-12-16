class World {
    constructor(){
        this.itinerary = new Itinerary();
        this.pointsOfInterest = new PointOfInterest(this.itinerary, 5);
        this.user = new Users();
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
}