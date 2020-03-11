class Graphics{
    constructor(facade){
        this.facade = facade;
        this.zoom = {};
        this.create = {};
        this.upload = {};
        this.removeButton = {};
        this.num_cards = 0;
        this.tmp_index = 0;
        this.tmp_waypoint = {};
        this.screen = 1;
	this.eventListener=this.eventListener.bind(this);
        //this.loadControllers();
    }

    loadControllers(){
        this.zoom = L.control.zoom({
            position:'bottomleft'
        }).addTo(map);



        this.create = L.control.custom({
            position: 'topleft',
            content : '<div class=""><a class="leaflet-bar-part leaflet-bar-part-single" width="30px" style="line-height: 30px height: 30px; width: 30px" height="30px"><img src="./img/travel.png" width="30px" height="30px"></img></a></div>',
            classes : 'leaflet-control leaflet-bar',
            events : {
                click : function(e){
                    facade.createMode();
                },
            }
        }); //visible when user logged in


        this.upload = L.control.custom({
            position: 'topleft',
            content : '<div class=""><a class="leaflet-bar-part leaflet-bar-part-single" width="30px" style="line-height: 30px height: 30px; width: 30px" height="30px"><img src="./img/upload.png" width="30px" height="30px"></img></a></div>',
            classes : 'leaflet-control leaflet-bar',
            events : {
                click : function(e){
                    facade.ldItinerary();
                },
            }
        }); //visible when user logged in

        this.removeButton = L.control.custom({
            position: 'topleft',
            content : '<div class="big-control"><a class="leaflet-bar-part leaflet-bar-part-single" width="30px" style="line-height: 40px height: 40px; width: 40px" height="30px"><img src="./img/load_point.svg" width="40px" height="40px"></img></a></div>',
            classes : 'leaflet-control leaflet-bar round',
            events : {
                click : function(e){
                    facade.getItinerary().removePoint();

                },
            }
        });
    }

    loadPoints(){
        var parentThis = this;
        console.log(parentThis);
        var last_event_ts= new Date()
        setTimeout(function(){
          //console.log(new Date()-last_event_ts)
          if (new Date()-last_event_ts>=100)
            parentThis.facade.getPointsOfInterest().loadPoints();
        },100); //cambio 800 in 100
    }

    styleInspect(str){
        $("#inspect").html(str);
    }

    loadMenu(waypoints, index, write_permit = true, nextnprevious = false){
        var parentThis = this;

        facade.selectedWaypoint=Object.assign({}, waypoints[index]);

        if (this.facade.getItinerary().user_id === this.facade.getAccount()._id && this.facade.getItinerary().getMode() == 0){
            write_permit = true;
        }
        this.styleInspect(itineraryHTML);
        gotoTab(INSPECT_TAB);
        if (!write_permit) {
            $('.p').css('display','none');
            $(".fileinput-button").css("display", "none");
            $(".nopermit").css("display", "inline");
            $(".d").prop("disabled", true);
            $("#saveChanges").css("display", "none");
            if (!$.isEmptyObject(this.facade.getAccount())){
                $(".comment").css("display", "inline");
                $("#send_comment").prop("disabled", false);
            }
            else{
                $(".comment").css("display", "none");
                $("#send_comment").prop("disabled", true);
            }
        }
        else {
            $('.p').css('display','inline');
            $(".fileinput-button").css("display", "relative");
            $(".nopermit").css("display", "none");
            $(".d").prop("disabled", false);
            $(".custom-select").css('display', "inline");
            if (!$.isEmptyObject(this.facade.getAccount())){
                $(".comment").css("display", "inline");
                $("#send_comment").prop("disabled", false);
            }
            else{
                $(".comment").css("display", "none");
                $("#send_comment").prop("disabled", true);
            }
            if (this.facade.getItinerary().user_id == this.facade.getAccount()._id && this.facade.getItinerary().getMode() == 0){
                $("#saveChanges").css("display", "inline");
            }
            else $("#saveChanges").css("display", "none");


        }
        if (nextnprevious) $('.footer').css('display', 'inline');
        else $('.footer').css('display', 'none');
          var i = 0;
          var slideItem;
          var numslides = 0;
          for (i in waypoints[index].img){
          if (i==0) slideItem = "<div class='carousel-item active'><img class='d-inline-block w-100' style='height:300px;' src='"+waypoints[index].img[0]+"' alt=''></div>";
          else slideItem = "<div class='carousel-item'><img class='d-inline-block w-100' style='height:300px;' src='"+waypoints[index].img[i]+"' alt=''></div>";
          $('.carousel-inner').append(slideItem);
        }
        for (var num in waypoints[index].clips){
            if (i == 0 && num == 0)
                slideItem = "<div class='carousel-item active' data-id='"+numslides+"'><div class='carousel-video-inner'><iframe type='text/html' class='d-inline-block w-100' style='height:300px;' src='https://www.youtube.com/embed/"+waypoints[index].clips[0]+"' alt='' frameborder='0'></iframe></div></div>";
                else slideItem = "<div class='carousel-item' data-id='"+numslides+"'><div class='carousel-video-inner'><iframe type='text/html' class='d-inline-block w-100' style='height:300px;' src='https://www.youtube.com/embed/"+waypoints[index].clips[num]+"' alt='' frameborder='0'></div></div>";
            numslides++;
            $('.carousel-inner').append(slideItem);
        }

        var e;
        $('#title').val(waypoints[index].title);
        $('#description').val(waypoints[index].description);

        $('.nopermit').html("<p class='h2'>"+waypoints[index].title+"</p><p class='h6'>"+waypoints[index].description+"</p>");
        $('#left').on('click',() => {
            if (index > 0) parentThis.loadMenu(waypoints, index-1, write_permit, nextnprevious);
        });
        $('#right').on('click',() => {
            if (index < waypoints.length-1) parentThis.loadMenu(waypoints, index+1, write_permit, nextnprevious);
        });
        $('#send_comment').on('click',() => {
            this.facade.sendComment(waypoints[index]._id, $('#com').val(), this.facade.getAccount());
        });
          $('#title').on('input', function(){
          waypoints[index].title = $('#title').val();
         });
          $('#description').on('input', function(){
          waypoints[index].description = $('#description').val();
        });

        for (var i in waypoints[index].comments){
            $('#comment-list').append("<p>"+waypoints[index].comments[i].madeBy.name+": "+waypoints[index].comments[i].text+"</p><br>");
        }

        $("#saveChanges").on("click", () => {
            parentThis.facade.saveChanges(waypoints[index]);
        });

        console.log(waypoints[index].startItinerary);
        if (waypoints[index].startItinerary && L.userPosition) $(".startItinerary").css("display", "inline");
        else $(".startItinerary").css("display", "none");

        document.removeEventListener('loadimg', parentThis.eventListener);
        document.addEventListener('loadimg', parentThis.eventListener);
        this.tmp_index = index;
        this.tmp_waypoint = Object.assign({},waypoints);
    }

    eventListener(event){
        var fd = new FormData();
        fd.append('file', event.detail.files[0]);
        console.log(this);
        this.tmp_waypoint[this.tmp_index].img.push(event.detail.src);
        this.tmp_waypoint[this.tmp_index].files.push(event.detail.files);
      }

      clearCards(){
        $('#feed').html("");
        this.num_cards = 0;
    }

    loadCard(waypoints, index){
        if (!waypoints[index].inputWaypoints){
            $('#feed').html($('#feed').html()+cardHTML);
            this.num_cards++;
            $('div.card-feed:nth-child('+this.num_cards+')').attr('data-key', index);
            $('div.card-feed:nth-child('+this.num_cards+')').attr('data-type', 1);
            if (waypoints[index].img[0]) $('div.card-feed:nth-child('+this.num_cards+') img').attr('src', waypoints[index].img[0]);
            else $('div.card-feed:nth-child('+this.num_cards+') img').attr('src', "./img/Question_Mark.svg");
            $('div.card-feed:nth-child('+this.num_cards+') .card-body').html("<div class='container'><h5 class='card-title'>"+waypoints[index].title+"</h5><h6 class='card-subtitle text-muted'><small> Point by "+waypoints[index].username+"</small></h6></div>");
        }
        else{
            $('#feed').html($('#feed').html()+cardHTML);
            this.num_cards++;
            $('div.card-feed:nth-child('+this.num_cards+')').attr('data-key', index);
            $('div.card-feed:nth-child('+this.num_cards+')').attr('data-type', 0);
            if (waypoints[index].inputWaypoints[0].img[0]) $('div.card-feed:nth-child('+this.num_cards+') img').attr('src', waypoints[index].inputWaypoints[0].img[0]);
            else $('div.card-feed:nth-child('+this.num_cards+') img').attr('src', "./img/Question_Mark.svg");
            $('div.card-feed:nth-child('+this.num_cards+') .card-body').html("<div class='container'><h5 class='card-title'>"+waypoints[index].inputWaypoints[0].title+"</h5><h6 class='card-subtitle text-muted'><small>Itinerary by "+waypoints[index].username+"</small></h6></div>");
        }
      }

      cardClicked(item){
        var datakey = $(item).attr("data-key");
        var datatype = $(item).attr("data-type");
        if (datakey) this.facade.getPointsOfInterest().onclick_card(datakey, datatype);
      }

      change(){
        if (!this.screen){
            this.toMap();
        }
        else{
            this.toMenu();
        }
        map.invalidateSize()
      }

      toMenu(){
        $('body').addClass("me");
        $('body').removeClass("mp");
        this.screen = 0;
      }

      toMap(){
        $('body').addClass("mp");
        $('body').removeClass("me");
        this.screen = 1;
      }

      addStopButton(title, description){
          var parentThis = this;
          $('#inspect').append('<button type="button" class="btn btn-primary" id="stop" onclick="">Stop audio</button>');
          $('#stop').on('click', () => {
            parentThis.facade.Paul.shutUp();
            //$('#stop').css('display', 'none');
            document.getElementById("stop").remove();
            parentThis.addBeginButton(title, description);
          });
      }

      addBeginButton(title, description){
          var parentThis = this;
        $('#inspect').append('<button type="button" class="btn btn-primary" id="begin" onclick="">Start audio</button>');
        $('#begin').on('click', () => {
            parentThis.facade.Paul.say(title);
            parentThis.facade.Paul.say(description);
            //$('#begin').css('display', 'none');
            document.getElementById("begin").remove();
            parentThis.addStopButton(title, description);
        });
      }
      loadVideoAndPlay(video_id){
        var url = "https://www.youtube.com/embed/" + video_id +"?enablejsapi=1&version=3&playerapiid=ytplayer";
        $("#video-frame").attr('src', url);
        setTimeout(() => {
          $('.embed-responsive-item').each(function(){
              this.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          });
        },2000);
      }

      videoToCard(video){
        function f (item){
          var obj={
            none: "none",
            nat: "nature",
            art: "art",
            his: "history",
            prs: "personal",
            pop: "pop and gossip",
            flk: "folklore",
            mod: "modern culture",
            rel: "religions",
            cui: "cuisine",
            shp: "shopping",
            tec: "technology",
            spo: "sport",
            mus: "music",
            mov: "movies",
            oth: "other",
            fas: "fashion"
          }
          return obj[item];
        }
        var card=`
                  <div class="card mt-3" onclick="voicePlayer.loadVideoById('${video.id}');player.playVideo()">
                  <div class="card-horizontal" id="${video.id}">
                  <img class="card-img w-50" style="height: 180px;" src="${video.thumbnail}" alt="${video.title}">
                  <div class="card-body" style="text-align: left; overflow: hidden"><div class="container"><h5 class="card-title">${video.title}</h5>
                  Purpose: ${video.purpose}<br/>
                  Content: ${video.content.map(f).join(', ')}<br/>
		              Detail: ${video.detail}
                  </div>
                  </div>
                  </div>
                  </div>`
        return card;
        }

        videosToCards(list){
          if (list)
            return list.map(this.videoToCard).join('');
          else return '';
        }

	 displayVideos(list){
		gotoTab(VOICE_TAB)
		$("#voice #videocards")[0].innerHTML=$("#voice #videocards")[0].innerHTML+this.videosToCards(list);
	 }

  cleanVideos(){
    if ($("#voice #videocards")[0])
      $("#voice #videocards")[0].innerHTML=''
  }
}
