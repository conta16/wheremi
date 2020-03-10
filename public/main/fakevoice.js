var badLvlSpec = ['gen','pre','elm','mid','scl','all']
var badCurrentLvlSpec = 0;
var purpose = "";
var dest_point = {};
var next = 1; //1 when next, 0 when previous
var prev_value = 0 //when you're always pressing previous, this keeps track of how far back you've gone
var filterForPaul = {}
var wmiBookmark = 0;

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var listeroni;
var listaId;

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
      height: '360px',
      width: '480px',
      videoId: 'dQw4w9WgXcQ',
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  }
function onPlayerReady(){}
function onPlayerStateChange(){
    if (player.getPlayerState() == 0){ //Se la riproduzione di un video è terminata
        wmiBookmark += 1;
        player.loadVideoById(); //carica il prossimo video
    }
}

var badPaul = new Artyom();
badPaul.initialize({
    lang: initLanguagePaul(),
    continuous: false, // Listen forever
    soundex: true,// Use the soundex algorithm to increase accuracy
    debug: true, // Show messages in the console
    executionKeyword: "",//Esegui dopo questa spressione
    listen: false, // Start to listen commands !
    // If providen, you can only trigger a command if you say its name
    // e.g to trigger Good Morning, you need to say "Bad Paul Good Morning"
    name: "Bad Paul"
    });

function initLanguagePaul(){
    var userLang = navigator.language || navigator.userLanguage;
    return userLang;
}

//var tmpuser = {}
//tmpuser.latLng = {lat: '44.488998044', lng: '11.339498642'}

function NOTbadPaulWmi(){//wheremi

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

/*function search(){
    wmi_search(20, L.userPosition.latLng, {purpose: purpose,language: $("#language option:selected").val()}, function(videos){
        if (videos[0] && videos[0].id) facade.getPointsOfInterest().setYTPoint(videos[0].id, videos[0].latLng);
        dest_point = facade.getPointsOfInterest().calculateClosestPoint();
        //da mettere un qualcosa se non trova nulla
        var tmp = []; tmp.push(L.userPosition.latLng); tmp.push(dest_point.data.latLng);
        facade.getItinerary().setWaypoints(tmp); // per wiki e point l'audio parte quando viene cambiato L.userPosition e diventa <20, guarda su l0controllocate (mi sembra)
            //if (next) facade.getPointsOfInterest().yt_visitedPlaces.push({"id": dest_point.data.id, "latLng": {"lat": dest_point.data.latLng.lat, "lng": dest_point.data.latLng.lng}});
    });
}*/

function gotoClip(clip){
  /*function autoPlay(event){
    if (facade.distance(L.userPosition.lat, L.userPosition.lng, event.detail.latLng.lat, event.detail.latLng.lat)<0.02){
      player.loadVideoById(clip.id);
      player.playVideo();
    }
    document.removeEventListener("destinationReached", autoPlay);
  }*/
  facade.selectedWaypoint = clip;
  facade.go();
  //document.addEventListener("destinationReached", autoPlay)
}



function badPaulWheremi(){
    badPaul.say("This is what we found for this place!");
    wmiBookmark = 0;
    search(function (listbaby) {
        listeroni = listbaby;
        facade.getPointsOfInterest().removeYTMarkers();
        facade.getPointsOfInterest().setYTMarkers(listeroni);
        //gotoClip(listeroni[0][wmiBookmark])
        visited_places.push(listeroni[0]);
        startPlace();
    });

}


// function badPaulWhy(){
//     if (L.userPosition){
//         purpose = "why";
//         badCurrentLvlSpec = 0;
//         wmi_search(20, L.userPosition.latLng, {purpose: purpose, level: badLvlSpec[0], audience: $("#audience option:selected").val(), language: $("#language option:selected").val()}, function(videos){
//             console.log(videos);
//             var url;
//             if (videos.length > 0){
//                 if (videos[0].id){
//                     player.loadVideoById(videos[0].id);
//                     player.playVideo();
//                     //facade.getGraphics().loadVideoAndPlay(videos[0].id);
//                 badPaul.say("Playing a video to tell you why this place is interesting. Level "+ badLvlSpec[0])
//             } else if (videos.id){ //url = "https://www.youtube.com/embed/" + videos.id
//                 player.loadVideoById(videos.id);
//                 player.playVideo();
//                 badPaul.say("Playing a video to tell you why this place is interesting. Level "+ badLvlSpec[0])
//             }
//         }
//         else badPaul.say("We couldn't find the right video for the occasion");
//       });
//     }
//     else badPaul.say("You have to activate the geolocalisation");
// }

function badPaulWhy(){
}


function badPaulMore(){
    var url;
    if (L.userPosition){
        wmi_search(20, L.userPosition.latLng, {purpose: purpose, level: badLvlSpec[++badCurrentLvlSpec], audience: $("#audience option:selected").val(), language: $("#language option:selected").val()}, function(videos){
            console.log(videos);
            if (videos.length > 0 && badCurrentLvlSpec <= 5){
             if (videos[0].id){
                badPaul.say("Playing a video to tell you why this place is interesting. Level "+ badLvlSpec[badCurrentLvlSpec])
                player.loadVideoById(videos[0].id);
                player.playVideo();
                //facade.getGraphics().loadVideoAndPlay(videos[0].id);
             } else if (videos.id){
                url = "https://www.youtube.com/embed/" + videos.id //videos non dovrebbe essere sempre un vettore??
                player.loadVideoById(videos.id);
                player.playVideo();
                //facade.getGraphics().loadVideoAndPlay(videos.id);
                badPaul.say("Playing a video to tell you why this place is interesting. Level "+ badLvlSpec[badCurrentLvlSpec])
             }
            }
             else {
                 //badPaul.say("We couldn't find the right video for the occasion");
                 if (badCurrentLvlSpec > 5){
                     badPaul.say("Reached maximum detail level");
                     badCurrentLvlSpec = 0;
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
        badCurrentLvlSpec = 0;
    wmi_search(1, tmpuser.latLng, {purpose: purpose, part: badLvlSpec[0], audience: $("#audience option:selected").val(), language: $("#language option:selected").val()}, function(videos){
        console.log(videos);
        var url;
        if (videos.length > 0){
         if (videos[0].id){
             badPaul.say("Playing a video to tell you how to visit this place.");
             player.loadVideoById(videos[0].id);
             player.playVideo();
             //facade.getGraphics().loadVideoAndPlay(videos[0].id);
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
        badCurrentLvlSpec = 0;
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

function badPaulPause(){
    //stoppa la riproduzione del video corrente
    player.pauseVideo();
    badPaul.say("Current video paused");

}

function badPaulContinue(){
    //continua la riproduzione del video corrente
    badPaul.say("Resuming play");
    player.playVideo();
}
