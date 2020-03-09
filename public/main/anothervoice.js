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
    if (clicked) //l.userposition
      search();
    else if (!clicked) //l.userposition
      badPaul.say("You have to activate the geolocation");
}

function search(callback){
  wmi_search(100, L.userPosition.latLng, {language: $("#language option:selected").val(), audience: $("#audience option:selected").val()}, function(videos){
      var tmp_places=classize(videos, 'olc')//dividiamo i video in classi di olc per ottenere un oggetto contentente tutti i video divisi per olc
      for (var i in tmp_places){ //dividiamo i video, oltre che per olc, per purpose
        var what=Object.assign([], result_filter(tmp_places[i], {purpose: "what"}));
        var how=Object.assign([], result_filter(tmp_places[i], {purpose: "how"}));
        var why=Object.assign([], result_filter(tmp_places[i], {purpose: "why"}));
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
        if(tmp_list[i].why[0])
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
      //next(current_place++);
      callback(sorted_places);
    });

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
