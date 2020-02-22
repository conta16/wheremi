function initBadPaul(){
    $("#buttonWmi",'#buttonMore','#buttonNext','#buttonPrev','#buttonWhy','#buttonStop','#buttonCont').prop('disabled',false);
}

var htmlVideoPopup = `<div id="headerPopup" class="mfp-hide embed-responsive embed-responsive-21by9">
                              <iframe class="embed-responsive-item video-frame" width="854" height="480" src="" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                              </div>`;

function badPaulWmi(){
    facade.loadHtmlInspectBefore();
                    //var olcCurrentPosition = getOlcForUser();
                  var params = {
                        coords: {latitude: L.userPosition.latLng.lat, longitude: L.userPosition.latLng.lng},
                        //per quando leggerai: topicid è deprecato ed è un prametro di YT, pageID è, se vuoto, quello della prima pagina, altrimenti non va specificato perché già gestito dall'api
                    }
                    //riproduci un video per dire dove sei (WHERE)
                    Paul.say('Playing a video to tell you where you are');
                     /*trova dove sei (usando olc) e poi carica un video di quel tipo*/
                     
                     this.saveHtmlInspectBefore($("#inspect").html());
                     while (resultJson.purpose.toLowerCase() != 'where'){
                         var res = wmivideo_search(params);
                         var resultJson = utils.mahmood(res);
                    }
                     
                     $("#vid-container").append(htmlVideoPopup);
                     //$(".video-container").append(htmlVideoPopup);
                     $(".video-frame").attr('src', res);
                     $('#headerVideoLink').magnificPopup({
                        type:'inline',
                        midClick: true
                     }); //a sto punto il video dovrebbe essere un popup.
}


function badPaulMore(){
    
}

function badPaulNext(){
    
}

function badPaulPrev(){
    
}

function badPaulStop(){
    //stoppa la riproduzione del video corrente
    $(".video-frame").pause()
    Paul.say("Current video paused");
    
}

function badPaulContinue(){
    //continua la riproduzione del video corrente
    Paul.say("Resuming play");
    $(".video-frame").play()
}