var badLvlSpec = ['gen','pre','elm','mid','scl','all']
var badCurrentLvlSpec = 0;


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

function badPaulWmi(){//wheremi

    if (L.userPosition){         
         badPaul.say('Playing a video to tell you where you are');

           wmi_search(1, L.userPosition.latLng, {purpose: "what"}, function(videos){
           var url = "https://www.youtube.com/embed/" + videos[0].id +"?enablejsapi=1&version=3&playerapiid=ytplayer";
           $("#video-frame").attr('src', url);
           $("#video-frame").contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');

           $("#buttonPause").on("click", () => {
               console.log("video");
               /*$('.embed-responsive-item').each(function(){
                this.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
              });*/
              $('#video-frame').contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
           });
           $("#buttonCont").on("click", () => {
            $('#video-frame').contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
           });
         });
    }
    else alert("You have to activate the geolocalisation");
}

function badPaulWhy(){
     facade.loadHtmlInspectBefore();

     badPaul.say("Playing a why clip. level "+badLvlSpec[badCurrentLvlSpec]);
     facade.saveHtmlInspectBefore($("#inspect").html());
     var video = wmi_search(1, L.userPosition.latLng, [{purpose: "why", level: badLvlSpec[0]}], function(videos){console.log(videos);return videos;});
     console.log(video);
     badCurrentLvlSpec += 1;
     var urlgiusto = "https://youtube.com/video/" + video;

     $("#inspect").append(htmlVideo);

     $(".video-frame").attr('src', urlgiusto);
     $('#headerVideoLink').magnificPopup({
        type:'inline',
        midClick: true
     }); //a sto punto il video dovrebbe essere un popup.
}

function badPaulMore(){
    facade.loadHtmlInspectBefore();
    //riproduci un video per dire dettagli sul posto dove sei
    var video = wmi_search(1, L.userPosition.latLng, {purpose: "why", level: badLvlSpec[badCurrentLvlSpec]}, function(videos){return videos;});

    badPaul.say("Playing a video to give you more details about the thing you're looking at. Level " + lvlSpec[currentLvlSpec]);
    if (badcurrentLvlSpec <= 6){
        badcurrentLvlSpec += 1;
    }
    var urlgiusto = "https://youtube.com/video/" + video;
    $("#inspect").append(htmlVideoPopup);

     $(".video-frame").attr('src', urlgiusto);
     $('#headerVideoLink').magnificPopup({
        type:'inline',
        midClick: true
     }); //a sto punto il video dovrebbe essere un popup.

}

function badPaulNext(){
    badCurrentLvlSpec = 0

}

function badPaulPrev(){
    badCurrentLvlSpec = 0
}

function badPaulPause(){
    //stoppa la riproduzione del video corrente
    //$("#video-frame").pause();
    badPaul.say("Current video paused");

}

function badPaulContinue(){
    //continua la riproduzione del video corrente
    badPaul.say("Resuming play");
    //$("#video-frame").play()
}
