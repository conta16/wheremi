class Users{
    constructor(itinerary, facade){
        this.facade = facade;
        this.itinerary = itinerary;
        this.account = {};
        this.itineraries = [];
        this.pointsOfInterest = [];
        this.logged = false;
        this.afterLogin();
    }

    afterLogin(){
        var parentThis = this;
        document.addEventListener('userLogged', function(e){
            parentThis.setAccount(e.detail.account);
            console.log(e.detail.account);
            parentThis.facade.getGraphics().create.addTo(map);
            parentThis.facade.getGraphics().upload.addTo(map);
            parentThis.getItineraries();
            var use=Object.assign({}, e.detail.account);
            $('img#profilepic').attr('src', e.detail.account.profilepic);
            function show_progress(percentage){
              $("#uploadOnYT")[0].innerHTML="uploading: "+percentage;
              $("#uploadOnYT").prop('disabled', true);
            }

            function done(){
              $("#uploadOnYT")[0].innerHTML='done'
              $("#recordAudio").prop('disabled', true);
              $("#recordVideo").prop('disabled', true);
              $("#uploadOnYT").prop('disabled', true);
            }
            YTUploader.ready(e.detail.account.accessToken, show_progress, done);
          });
          $(document).on('change','#uploadpic', function () {
            var file = this.files;
            console.log(file);
                  if (this.files.length == 1) {
                      //$.each(this.files, function (index, value) {
                          var reader = new FileReader();
                          reader.onload = function (e) {
                            $('img#profilepic').attr('src', e.target.result);
                            console.log(e.target.result);
                            console.log(parentThis.account);
                              $.ajax({
                    url: url+'/changeprofilepic',
                    method: 'POST',
                    dataType: 'json',
                    data: {
                      pic: JSON.stringify(e.target.result),
                      id: JSON.stringify(parentThis.getAccount()._id)
                    },
                    success: () => {
                      console.log("pic changed");
                    },
                    error: (error) => {
                      console.log("error in changing pic");
                      console.log(error);
                    }
                  });
                          };
                          reader.readAsDataURL(file[0]);
                      //});
                  }
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
        var parentThis = this;
        for (var i in this.account.itinerary_id){
            this.itinerary.getRouteFromDB(this.account.itinerary_id[i])
            .then((data) => {

                if (!data.inputWaypoints[0].img[0]) $(".profile-usermenu").prepend(
                    "<img src='./img/unknown_person.png' class='img-thumbnail' style='height:30%;width:33%; display: inline' alt=''>"
                );
                else $(".profile-usermenu").prepend(
                    "<img src='"+data.inputWaypoints[0].img[0]+"' class='img-thumbnail' style='height:30%;width:33%; display: inline' alt=''>"
                );
                parentThis.itineraries.unshift(data);
                var index = 1;
                $(".img-thumbnail:nth-of-type("+index+")").on("click", () => {
                    console.log($(".img-thumbnail:nth-of-type("+index+")"));
                    parentThis.itinerary.setRoute(data);
                    parentThis.facade.getGraphics().loadMenu(data.inputWaypoints, 0, true, true);
                })
            }).catch(() => {});
        }
    }
}
