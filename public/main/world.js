class World {
    constructor(){
        this.itinerary = new Itinerary();
        this.pointsOfInterest = new PointOfInterest(this.itinerary, 5);
        this.user = new Users(this.itinerary);
    }

    setAccount(obj){
        this.user.setAccount(obj);
    }

    getAccount(){
        return this.user.getAccount();
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