function aggiornaBio(){
    var x = $('#bioAggiornata');
    $.post("/newbio",{newbio: x.val()}, function(data){
            if(data==='done')
              {
                console.log("bio update ok");
              }
          });
  }
  var htmlPerLaBioNuova = `<input type="text" name="newBio" placeholder="Inserisci la tua nuova bio!" class="bio-container" id="bioAggiornata" style ="height: 35px;">
              <span class="input-group-btn" style="border-radius: 4px;"><button class="btn btn-primary" type="button" onclick="aggiornaBioPresente()" style="line-height: 21px;">Salva</button></span>`
  var htmlPerLaBioVecchia = `<span class = "bio-span" id="spanbio"><div id = "spazioperlabio" style ="display: inline-block;"></div><img src ="../img/editbio.png" onclick="cambiaLayoutBio('nuova')" height="20px"></span>`

  function cambiaLayoutBio(mode){
    if (mode === 'nuova'){
      $('#spanbio').html(htmlPerLaBioNuova);
    }
    else if (mode === 'vecchia'){
      $('#spanbio').html(htmlPerLaBioVecchia);
    }
    else {console.log("pirla hai sbagliato")}
  }
  function aggiornaBioPresente(){
    aggiornaBio();
    var x = $('#bioAggiornata');
    cambiaLayoutBio('vecchia');
    $("#spazioperlabio").html(x.val());
  }

function privacyupload_done(){
  carica_video()
  console.log("fatto")
}

function video_deleted(){
  carica_video()
  console.log("fatto")
}

function carica_video(){
  $("#usersvideos")[0].innerHTML=''
  YTUploader.getVideos(function(response){
    cb=function(res){
      console.log(res);
      items=res.items;
      for (var i in items){
        var card=`
              <div class="card mt-3">
              <div class="card-horizontal" id="${items[i].id}">
              <img class="card-img w-50" style="height: ${items[i].snippet.thumbnails.medium.height};" src="${items[i].snippet.thumbnails.medium.url}" alt="${items[i].snippet.title}">
              <div class="card-body" style="text-align: left; overflow: hidden"><div class="container"><h5 class="card-title">${items[i].snippet.title}</h5><h6 class="card-subtitle text-muted"><small> ${items[i].snippet.description}</small></h6>
              <button class="btn" onclick="YTUploader.setVideoPrivacy(${"'"+items[i].id+"'"}, ${"'"+(items[i].status.privacyStatus=='private'?'public':'private')+"'"}, privacyupload_done)">Set ${items[i].status.privacyStatus=='private'?'public':'private'}</button>
              <button class="btn btn-danger" onclick="YTUploader.deleteVideo(${"'"+items[i].id+"'"}, video_deleted)">Delete</button>
              </div>
              </div>
              </div>
              </div>`
        $("#usersvideos")[0].innerHTML=$("#usersvideos")[0].innerHTML+card;
      }

    };
    var list="";
    response=response.items;
    if (response.length)
      list+=response[0].id.videoId;
    for (var i=1; i<response.length; i++)
      list+=","+response[i].id.videoId;
      console.log(response)
    YTUploader.retreiveVideos(list, cb);
  })
}

function carica_clip(selector, clip){
  $(selector)[0].innerHTML=''
    var card=`
              <div class="card mt-3">
              <div class="card-horizontal" id="${items[i].id}">
              <img class="card-img w-50" style="height: ${items[i].snippet.thumbnails.medium.height};" src="${items[i].snippet.thumbnails.medium.url}" alt="${items[i].snippet.title}">
              <div class="card-body" style="text-align: left; overflow: hidden"><div class="container"><h5 class="card-title">${items[i].snippet.title}</h5><h6 class="card-subtitle text-muted"><small> ${items[i].snippet.description}</small></h6>
              <button class="btn" onclick="YTUploader.setVideoPrivacy(${"'"+items[i].id+"'"}, ${"'"+(items[i].status.privacyStatus=='private'?'public':'private')+"'"}, privacyupload_done)">Set ${items[i].status.privacyStatus=='private'?'public':'private'}</button>
              <button class="btn btn-danger" onclick="YTUploader.deleteVideo(${"'"+items[i].id+"'"}, video_deleted)">Delete</button>
              </div>
              </div>
              </div>
              </div>`
    $(selector)[0].innerHTML=$(selector)[0].innerHTML+card;
}
