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
        this.account = obj;
        console.log(this.account);

        this.itinerary.setUserID(this.account._id);
        this.setLogged(true);
    }

    getAccount(){
        return this.account;
    }

    getItineraries(){
        for (var i in this.account.itinerary_id){
            this.itinerary.getRouteFromDB(this.account.itinerary_id[i])
            .then((data) => {
                if (!data.inputWaypoints[0].img[0]) $(".profile-usermenu").append(
                    "<img src='./img/unknown_person.png' class='img-thumbnail' style='width:33%; display: inline' alt=''>"
                );
                else $(".profile-usermenu").append(
                    "<img src='"+data.inputWaypoints[0].img[0]+"' class='img-thumbnail' style='width:33%; display: inline' alt=''>"
                );
                var w = $(".img-thumbnail:nth-of-type(1)").width();
                $('.img-thumbnail').css({'height':w+'px'});
            }).catch(() => {});
        }
    }
}