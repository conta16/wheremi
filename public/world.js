class World {
    constructor(){
        this.itinerary = new Itinerary();
        this.pointsOfInterest = new PointOfInterest(this.itinerary);
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