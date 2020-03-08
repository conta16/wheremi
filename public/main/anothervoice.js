var what=[];
var why=[];
var how=[];

var first;
var current_video;

var point_list=[];

function same_olc(olc){
  return function(item){return item.olc==olc};
}

function different_olc(olc){
  return !same_olc(olc);
}

function badPaulWmi(){//wheremi
    if (L.userPosition){
        var pointsOfInterest = facade.getPointsOfInterest();
        pointsOfInterest.yt_visitedPlaces = []; pointsOfInterest.wiki_visitedPlaces = []; pointsOfInterest.points_visitedPlaces = [];
        pointsOfInterest.listOfPlacesVisited = [];
        badCurrentLvlSpec = 1;
        search();

    }
    else if (!L.userPosition) badPaul.say("You have to activate the geolocation");
}

function search(){
  function distance_sort(a, b){
    return facade.distance(L.userPosition.latlng, a.latLng)-facade.distance(L.userPosition.latlng, b.latLng);
  }
    wmi_search(100, L.userPosition.latLng, {language: $("#language option:selected").val()}, function(videos){
      videos.sort(distance_sort);
      what=Object.assign({}, result_filter(videos, {purpose: "what"}));
      how=Object.assign({}, result_filter(videos, {purpose: "how"}));
      why=Object.assign({}, result_filter(videos, {purpose: "why"}));
      current_video=0
      first=what[0];
      createPointList();
      //qui occorre caricare first in inspect e chiamare facade.go()(conta, se lo fai tu lo fai in 2 minuti)
      reproduce(current_video++);
    });
}

function createPointList(){
  var pont_why=why.filter(same_olc(first.olc));
  var point_how=how.filter(same_olc(first.olc));
  var point_what=what.filter(same_olc(first.olc));

  point_why.sort(function(a,b){
    return a.detail-b.detail;
  });

  point_list.push(point_what[0])
  point_list.push(point_how[0])
  point_list.concat(point_why);

}

function reproduce(video_index){
  if (!point_list[video_index]){
    next()
  }
  else{
    //
  }
}

function more(){
  reproduce(current_video++)
}


// function badPaulWhy(){
//     if (why.length!=0){
//       if (why[0].id){
//         facade.getGraphics().loadVideoAndPlay(videos[0].id);
//         badPaul.say("Playing a video to tell you why this place is interesting")
//       }
//     }
// }
//
// function badPaulMore(){
//     var url;
//     if (L.userPosition){
//         wmi_search(1, L.userPosition.latLng, {purpose: purpose, level: ++badCurrentLvlSpec, audience: $("#audience option:selected").val(), language: $("#language option:selected").val()}, function(videos){
//             console.log(videos);
//             if (videos.length > 0 && badCurrentLvlSpec <= 10){
//              if (videos[0].id){
//                 badPaul.say("Playing a video to tell you why this place is interesting. Level "+ badCurrentLvlSpec)
//                 facade.getGraphics().loadVideoAndPlay(videos[0].id);
//              } else if (videos.id){
//                 url = "https://www.youtube.com/embed/" + videos.id //videos non dovrebbe essere sempre un vettore??
//                 facade.getGraphics().loadVideoAndPlay(videos.id);
//                 badPaul.say("Playing a video to tell you why this place is interesting. Level "+ badCurrentLvlSpec)
//              }
//             }
//              else {
//                  //badPaul.say("We couldn't find the right video for the occasion");
//                  if (badCurrentLvlSpec > 10){
//                      badPaul.say("Reached maximum detail level");
//                      badCurrentLvlSpec = 10;
//                  }
//                  else badPaulMore();
//              }
//              //if (url){$("#video-frame").attr('src', url); $("#video-frame").play()}
//           });
//     }
//     else badPaul.say("You have to activate the geolocation");
//
// }
//
// function badPaulHow(){
//     if (L.userPosition){
//         purpose = "how";
//         badCurrentLvlSpec = 1;
//     wmi_search(1, tmpuser.latLng, {purpose: purpose, level: badLvlSpec[0], audience: $("#audience option:selected").val(), language: $("#language option:selected").val()}, function(videos){
//         console.log(videos);
//         var url;
//         if (videos.length > 0){
//          if (videos[0].id){
//              badPaul.say("Playing a video to tell you how to visit this place.");
//              facade.getGraphics().loadVideoAndPlay(videos[0].id);
//          }/* else if (videos.id){ url = "https://www.youtube.com/embed/" + videos.id +"?autoplay=1"
//            badPaul.say("Playing a video to tell you how to visit this place.");
//          }*/
//         }
//          else badPaul.say("We couldn't find the right video for the occasion");
//       });
//     }
//     else badPaul.say("You have to activate the geolocation");
// }
//
// function badPaulNext(){
//     if (L.userPosition){
//         purpose = "what";
//         badCurrentLvlSpec = 1;
//         next = 1;
//         prev_value = 0;
//         search();
//     }
//     else if (!L.userPosition) badPaul.say("You have to activate the geolocation");
// }
//
// function badPaulPrev(){
//     if (L.userPosition){
//         if (dest_point.type){
//             next = 0;
//             var pointsOfInterest = facade.getPointsOfInterest();
//             var len = pointsOfInterest.listOfPlacesVisited.length;
//             if (len > prev_value){
//                 dest_point = Object.assign({},pointsOfInterest.listOfPlacesVisited[len-1-prev_value]); //important
//                 var tmp = []; tmp.push(L.userPosition.latLng); tmp.push(dest_point.data.latLng);
//                 facade.getItinerary().setWaypoints(tmp);
//                 prev_value++;
//             }
//             else badPaul.say("You can't go back anymore");
//         }
//     }
//     else badPaul.say("You have to activate the geolocation");
// }
//
// /*function badPaulPause(){
//     //stoppa la riproduzione del video corrente
//     //$("#video-frame").pause();
//     badPaul.say("Current video paused");
//
// }
//
// function badPaulContinue(){
//     //continua la riproduzione del video corrente
//     badPaul.say("Resuming play");
//     //$("#video-frame").play()
// }*/
