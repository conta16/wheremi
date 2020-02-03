class Users{
    constructor(itinerary){
        this.itinerary = itinerary;
        this.account = {};
        this.itineraries = [];
        this.pointsOfInterest = [];
        this.logged = false;
        document.addEventListener("it_added", () => {

        });
    }

    getLogged(){
        return this.logged;
    }

    setLogged(value){
        this.logged = value;
    }

    setAccount(obj){
        //var o = obj[0]+'"'+obj[2]+'"'+obj.slice(4); //json properties must have double quotes instead of single ones
        //console.log("o");
        //console.log(o);
        this.account = JSON.parse(obj);
        console.log(this.account);

        this.itinerary.setUserID(this.account._id);
        this.setLogged(true);
    }

    getAccount(){
        return this.account;
    }
}