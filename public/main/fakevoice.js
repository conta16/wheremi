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

var tmpuser = L.userPosition/*{}
tmpuser.latLng = {lat: '44.488998044', lng: '11.339498642'}*/

function badPaulWmi(){//wheremi

           wmi_search(1, tmpuser.latLng, {purpose: "what"}, function(videos){
           console.log(videos);
           var url;
           if (videos.length > 0){
            if (videos[0].id){
                 url = "https://www.youtube.com/embed/" + videos[0].id
                badPaul.say("Playing a video to tell you where you are")
            } else if (videos.id){ url = "https://www.youtube.com/embed/" + videos.id
              badPaul.say("Playing a video to tell you where you are")
            }}
            else {badPaul.say("We couldn't find the right video for the occasion")
            }
            if (url){$("#video-frame").attr('src', url); $("#video-frame").play()}
         });
}

function badPaulWhy(){
    wmi_search(1, tmpuser.latLng, {purpose: "why", level: badLvlSpec[0]}, function(videos){
        console.log(videos);
        var url;
        if (videos.length > 0){
         if (videos[0].id){
              url = "https://www.youtube.com/embed/" + videos[0].id
             badPaul.say("Playing a video to tell you why this place is interesting. Level "+ badLvlSpec[0])
             badCurrentLvlSpec += 1;
         } else if (videos.id){ url = "https://www.youtube.com/embed/" + videos.id
           badPaul.say("Playing a video to tell you why this place is interesting. Level "+ badLvlSpec[0])
           badCurrentLvlSpec += 1;
         }
        }
        else {badPaul.say("We couldn't find the right video for the occasion")
         }
         if (url){$("#video-frame").attr('src', url); $("#video-frame").play()}
        
      });
}

function badPaulMore(){
    if (badCurrentLvlSpec == 0){badPaulWhy()}
    else{
        wmi_search(1, tmpuser.latLng, {purpose: "why", level: badLvlSpec[badCurrentLvlSpec]}, function(videos){
            console.log(videos);
            var url;
            if (videos.length > 0){
             if (videos[0].id){
                 url = "https://www.youtube.com/embed/" + videos[0].id
                 badPaul.say("Playing a video to tell you why this place is interesting. Level "+ badLvlSpec[badCurrentLvlSpec])
                 if (badCurrentLvlSpec < 6){
                 badCurrentLvlSpec += 1;}
             } else if (videos.id){url = "https://www.youtube.com/embed/" + videos.id
               badPaul.say("Playing a video to tell you why this place is interesting. Level "+ badLvlSpec[badCurrentLvlSpec])
               if (badCurrentLvlSpec < 6){
                badCurrentLvlSpec += 1;}
             }}
             else {badPaul.say("We couldn't find the right video for the occasion")
             }
             if (url){$("#video-frame").attr('src', url); $("#video-frame").play()}
          });
    }

}

function badPaulHow(){
    wmi_search(1, tmpuser.latLng, {purpose: "how"}, function(videos){
        console.log(videos);
        var url;
        if (videos.length > 0){
         if (videos[0].id){
              url = "https://www.youtube.com/embed/" + videos[0].id + "?autoplay=1s"
             badPaul.say("Playing a video to tell you how to visit this place.")
         } else if (videos.id){ url = "https://www.youtube.com/embed/" + videos.id +"?autoplay=1"
           badPaul.say("Playing a video to tell you how to visit this place.");
         }}
         else {badPaul.say("We couldn't find the right video for the occasion")
         }
         if (url){$("#video-frame").attr('src', url); $("#video-frame").playVideo()}
        
      });
    }

function badPaulNext(){
    badCurrentLvlSpec = 0

}

function badPaulPrev(){
    badCurrentLvlSpec = 0
}

function badPaulPause(){
    //stoppa la riproduzione del video corrente
    $("#video-frame").pause();
    badPaul.say("Current video paused");

}

function badPaulContinue(){
    //continua la riproduzione del video corrente
    badPaul.say("Resuming play");
    $("#video-frame").play()
}
