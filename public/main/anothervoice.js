var badCurrentLvlSpec = 1;
var purpose = "";
var dest_point = {};
var next = 1; //1 when next, 0 when previous
var prev_value = 0 //when you're always pressing previous, this keeps track of how far back you've gone
var filterForPaul = {}

var what;
var why;
var how;


function badPaulWmi(){//wheremi

    if (L.userPosition){
        var pointsOfInterest = facade.getPointsOfInterest();
        pointsOfInterest.yt_visitedPlaces = []; pointsOfInterest.wiki_visitedPlaces = []; pointsOfInterest.points_visitedPlaces = [];
        pointsOfInterest.listOfPlacesVisited = [];
        purpose = "what";
        badCurrentLvlSpec = 0;
        next = 1;
        prev_value = 0;
        search();
    }
    else if (!L.userPosition) badPaul.say("You have to activate the geolocation");
}

function search(){
    wmi_search(100, L.userPosition.latLng, {language: $("#language option:selected").val()}, function(videos){
      why=Object.assign({}, videos.result_filter({purpose: "why"}));
      what=Object.assign({}, videos.result_filter({purpose: "what"}));
      how=Object.assign({}, videos.result_filter({purpose: "how"}));
    });
}

function badPaulWhy(){
    if (L.userPosition){
        purpose = "why";
        badCurrentLvlSpec = 1;
        wmi_search(1, L.userPosition.latLng, {purpose: purpose, level: badLvlSpec[0], audience: $("#audience option:selected").val(), language: $("#language option:selected").val()}, function(videos){
            console.log(videos);
            var url;
            if (videos.length > 0){
                if (videos[0].id){
                facade.getGraphics().loadVideoAndPlay(videos[0].id);
                badPaul.say("Playing a video to tell you why this place is interesting. Level "+ badLvlSpec[0])
            } else if (videos.id){ url = "https://www.youtube.com/embed/" + videos.id
                badPaul.say("Playing a video to tell you why this place is interesting. Level "+ badLvlSpec[0])
            }
        }
        else badPaul.say("We couldn't find the right video for the occasion");
      });
    }
    else badPaul.say("You have to activate the geolocalisation");
}

function badPaulMore(){
    var url;
    if (L.userPosition){
        wmi_search(1, L.userPosition.latLng, {purpose: purpose, level: ++badCurrentLvlSpec, audience: $("#audience option:selected").val(), language: $("#language option:selected").val()}, function(videos){
            console.log(videos);
            if (videos.length > 0 && badCurrentLvlSpec <= 10){
             if (videos[0].id){
                badPaul.say("Playing a video to tell you why this place is interesting. Level "+ badCurrentLvlSpec)
                facade.getGraphics().loadVideoAndPlay(videos[0].id);
             } else if (videos.id){
                url = "https://www.youtube.com/embed/" + videos.id //videos non dovrebbe essere sempre un vettore??
                facade.getGraphics().loadVideoAndPlay(videos.id);
                badPaul.say("Playing a video to tell you why this place is interesting. Level "+ badCurrentLvlSpec)
             }
            }
             else {
                 //badPaul.say("We couldn't find the right video for the occasion");
                 if (badCurrentLvlSpec > 10){
                     badPaul.say("Reached maximum detail level");
                     badCurrentLvlSpec = 10;
                 }
                 else badPaulMore();
             }
             //if (url){$("#video-frame").attr('src', url); $("#video-frame").play()}
          });
    }
    else badPaul.say("You have to activate the geolocation");

}

function badPaulHow(){
    if (L.userPosition){
        purpose = "how";
        badCurrentLvlSpec = 1;
    wmi_search(1, tmpuser.latLng, {purpose: purpose, level: badLvlSpec[0], audience: $("#audience option:selected").val(), language: $("#language option:selected").val()}, function(videos){
        console.log(videos);
        var url;
        if (videos.length > 0){
         if (videos[0].id){
             badPaul.say("Playing a video to tell you how to visit this place.");
             facade.getGraphics().loadVideoAndPlay(videos[0].id);
         }/* else if (videos.id){ url = "https://www.youtube.com/embed/" + videos.id +"?autoplay=1"
           badPaul.say("Playing a video to tell you how to visit this place.");
         }*/
        }
         else badPaul.say("We couldn't find the right video for the occasion");
      });
    }
    else badPaul.say("You have to activate the geolocation");
}

function badPaulNext(){
    if (L.userPosition){
        purpose = "what";
        badCurrentLvlSpec = 1;
        next = 1;
        prev_value = 0;
        search();
    }
    else if (!L.userPosition) badPaul.say("You have to activate the geolocation");
}

function badPaulPrev(){
    if (L.userPosition){
        if (dest_point.type){
            next = 0;
            var pointsOfInterest = facade.getPointsOfInterest();
            var len = pointsOfInterest.listOfPlacesVisited.length;
            if (len > prev_value){
                dest_point = Object.assign({},pointsOfInterest.listOfPlacesVisited[len-1-prev_value]); //important
                var tmp = []; tmp.push(L.userPosition.latLng); tmp.push(dest_point.data.latLng);
                facade.getItinerary().setWaypoints(tmp);
                prev_value++;
            }
            else badPaul.say("You can't go back anymore");
        }
    }
    else badPaul.say("You have to activate the geolocation");
}

/*function badPaulPause(){
    //stoppa la riproduzione del video corrente
    //$("#video-frame").pause();
    badPaul.say("Current video paused");

}

function badPaulContinue(){
    //continua la riproduzione del video corrente
    badPaul.say("Resuming play");
    //$("#video-frame").play()
}*/
