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
  var htmlPerLaBioVecchia = `<span class = "bio-span" id="spanbio"><%= user.bio %><img src ="../img/editbio.png" onclick="cambiaLayoutBio('nuova')" height="20px"></span>`            
  
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
    cambiaLayoutBio('vecchia');
  }