var places={};
var sorted_places=[];
var first;
var current_video=0;
var current_place=0;

var rollback=0;

var visited_olcs=[];

var point_list=[];

function same_olc(olc){
  return function(item){return item.olc==olc};
}

function different_olc(olc){
  return !same_olc(olc);
}

function badPaulWmi(){//wheremi
    if (L.userPosition)
      search();
    else if (!L.userPosition)
      badPaul.say("You have to activate the geolocation");
}

function search(){
  wmi_search(100, L.userPosition.latLng, {language: $("#language option:selected").val(), audience: $("#audience option:selected").val()}, function(videos){
      var tmp_places=videos.classize(videos, 'olc')//dividiamo i video in classi di olc per ottenere un oggetto contentente tutti i video divisi per olc
      for (var i in tmp_places){ //dividiamo i video, oltre che per olc, per purpose
        var what=Object.assign({}, result_filter(tmp_places[i], {purpose: "what"}));
        var how=Object.assign({}, result_filter(tmp_places[i], {purpose: "how"}));
        var why=Object.assign({}, result_filter(tmp_places[i], {purpose: "why"}));
        if (!places[i])
          places[i]={}
        places[i]=Object.assign(places[i], {what: what, why: why, how:how, olc:i});
      } //a questo punto places è un oggetto del tipo {"8FPHF8VV+X2":{what:[...(video obj)...], why:[...], how:[...], olc:"8FPHF8VV+X2"}, ...}
      var tmp_list=sort_places();//a questo punto tmp_list è un oggetto del tipo [{what:[...(video obj)...], why:[...], how:[...], olc:"8FPHF8VV+X2"}, ...] ordinati per distanza dalla posizione dell'utente
      tmp_list=tmp_list.filter(function(item){
        if (item.olc in visited_olcs)
          return false;
        return true;
      }); //teniamo solamente i posti non già visitati;
      for (var i in tmp_list){
        tmp_list[i].why.sort(function(a,b){
          if (!a.part && !b.part)
            return 0
          if (!a.part)
            return 1
          if (!b.part)
            return -1
          return a.part-b.part;
        });//ordiniamo le clip why per livello di dettaglio
        sorted_places[i]=[];
        if (tmp_list[i].what[0])
          sorted_places[i].push(tmp_list[i].what[0]);
        if (tmp_list[i].how[0])
          sorted_places[i].push(tmp_list[i].how[0])
        sorted_places[i].concat(tmp_list[i].why);//a questo punto tmp_list è un oggetto del tipo [[...video obj...], ...] ordinati per distanza dalla posizione dell'utente di cui, come ha detto vitali, il primo è un what,il secondo un how, poi una lista di why
      }
      //in questo modo scorrendo la matrice sorted_places è tale che sorted_places[0] dovrebbe avere tutti i video inerenti al punto più vicino all'utente in ordine di riproduzione. sorted_places[1] è il punto più vicino all'utente con già i video ordinati in ordine di riproduzione, mentre sorted_places[3] è il punto più vicino alla posizione iniziale dell'utente, ma non necessariamente alla posizione dell'utente
      rollback=0;//per implementare previous, i posti visitati sono inseriti in visited_olcs. al crescere di rollback la posizione del video corrente retrocede (ciò avviene al comando previous) ed avanza al comando next. Quando rollback è 0, current_video cresce. se è maggiore di 1, allora non abbiamo la certezza che il video ottenuto sia il più vicino, dunque ne cerchiamo dei nuovi per assicuraci che il primo ottenuto sia il più vicino non ancora visitato.
      current_place=0;
      current_video=0;
      next(current_place++);
    });
  return sorted_places;
}

function sort_places(){
  function distance_sort(a, b){
    return facade.distance(L.userPosition.latlng, a.latLng)-facade.distance(L.userPosition.latlng, b.latLng);
  }

  tmp_list=[]

  for (var i in places)
    tmp_list.push(places[i])

  tmp_list.sort(function(a, b){
    latLngA={lat:OpenLocationCode.decode(a.olc).latitudeCenter, lng:OpenLocationCode.decode(a.olc).longitudeCenter};
    latLngB={lat:OpenLocationCode.decode(b.olc).latitudeCenter, lng:OpenLocationCode.decode(b.olc).longitudeCenter};
    return facade.distance(L.userPosition.latLng, latLngA)-facade.distance(L.userPosition.latLng, latLngB);
  })
  return tmp_list;
}

function play(video_index){
  if (!(visited_places[visited_places.length-1-rollback][video_index].olc in visited_olcs))
    visited_olcs.push(visited_places[visited_places.length-1-rollback][video_index].olc);
  //mettiamo il video dove va messo ed iniziamo la riproduzione
}

function more(){
  if (current_video!=sorted_places[current_place].length-1)
    play(current_video++)
  else
    next(current_place++);
}

function previous(){
  if (rollback<visited_places.length-1)
    rollback++;
  startPlace()
}

function next(place){
  if (rollback>0){
    rollback--;
    current_place--;
    }
  else if (rollback==0){
    if (place<2 && sort_places[places])
      visited_places.push(sort_places[places]);
    else
      return search();
  }
  startPlace()
}

function startPlace(){
  current_video=0;
  //raggiungiamo il posto visited_places[visited_places.length-1-rollback] mediante visited_places[visited_places.length-1-rollback][current_video].latLng
  document.addEventListener("destinationReached", playController);
}

function playController(){
  document.removeEventListener("destinationReached", playController);//in ogni caso, che il posto sia quello gusto o meno, non ha senso che alla prossima nvigazione effettuata venga chaimata questa funzione
  if (facade.distance(L.userPosition, visited_olcs[visited_olcs.length-1-rollback][0].olc)<0.02)//se siamo nel punto giusto
    play(current_video++);
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
