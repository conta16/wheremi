class Graphics{
    constructor(facade){
        this.facade = facade;
    }

    loadPoints(){
        var last_event_ts= new Date()
        setTimeout(function(){
          //console.log(new Date()-last_event_ts)
          if (new Date()-last_event_ts>=100)
            pointsOfInterest.loadPoints();
        },100); //cambio 800 in 100
    }

    styleInspect(str){
        $("#inspect").html(str);
    }

    loadMenu(waypoints, index, write_permit = true, nextnprevious = false){
        var parentThis = this;
        if (this.facade.getItinerary().user_id == this.facade.getAccount()._id && this.facade.getItinerary().getMode() == 0) write_permit = true;
        this.styleInspect(itineraryHTML);
        gotoTab(INSPECT_TAB);
        if (!write_permit) {
            $('.p').css('display','none');
            $(".fileinput-button").css("display", "none");
            $(".nopermit").css("display", "inline");
            $(".d").prop("disabled", true);
            $(".custom-select").prop('disabled', true);
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
            $(".custom-select").prop('disabled', false);
            $(".comment").css("display", "none");
            $("#send_comment").prop("disabled", true);
        }
        if (nextnprevious) $('.footer').css('display', 'inline');
        else $('.footer').css('display', 'none');
          var slideItem;
          for (var i in waypoints[index].img){
          if (i==0) slideItem = "<div class='carousel-item active'><img class='d-inline-block w-100' style='height:300px;' src='"+waypoints[index].img[0]+"' alt=''></div>";
          else slideItem = "<div class='carousel-item'><img class='d-inline-block w-100' style='height:300px;' src='"+waypoints[index].img[i]+"' alt=''></div>";
          $('.carousel-inner').append(slideItem);
        }
        var e;
          $('#title').val(waypoints[index].title);
        $('#description').val(waypoints[index].description);
    
        $("select#purp option").filter(function() {
            return $(this).text() == waypoints[index].purpose;
        }).prop('selected', true);
    
        $('#lang').val(waypoints[index].lang);
    
        $("select#cont option").filter(function() {
            return $(this).text() == waypoints[index].content;
        }).prop('selected', true);
    
        $("select#aud option").filter(function() {
            return $(this).text() == waypoints[index].audience;
        }).prop('selected', true);
    
        $("select#det option").filter(function() {
            return $(this).text() == waypoints[index].detail;
        }).prop('selected', true);
    
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
        $('#purp').on('change', () => {
            e = document.getElementById("purp");
            waypoints[index].purpose = e.options[e.selectedIndex].text;
        });
        $('#lang').on('input', () => {
            waypoints[index].lang = $('#lang').val();
        });
        $('#cont').on('input', () => {
            e = document.getElementById("cont");
            waypoints[index].content = e.options[e.selectedIndex].text;
            console.log(waypoints[index].content);
        });
        $('#aud').on('input', () => {
            e = document.getElementById("aud");
            waypoints[index].audience = e.options[e.selectedIndex].text;
        });
        $('#det').on('input', () => {
            e = document.getElementById("det");
            waypoints[index].detail = e.options[e.selectedIndex].text;
        });
        for (var i in waypoints[index].comments){
            $('#comment-list').append("<p>"+waypoints[index].comments[i].madeBy.name+": "+waypoints[index].comments[i].text+"</p><br>");
        }
        document.removeEventListener('loadimg', parentThis.eventListener);
        document.addEventListener('loadimg', parentThis.eventListener);
        index1 = index;
        waypoints1 = waypoints;
    }

    eventListener(event){ //mmm function inside function
        var fd = new FormData();
        fd.append('file', event.detail.files[0]);
        waypoints1[index1].img.push(event.detail.src);
        waypoints1[index1].files.push(event.detail.files);
      }

      clearCards(){
        $('#feed').html("");
        num_cards = 0;
    }

    loadCard(waypoints, index){
        if (!waypoints[index].inputWaypoints){
            $('#feed').html($('#feed').html()+cardHTML);
            num_cards++;
            $('div.card:nth-child('+num_cards+')').attr('data-key', index);
            $('div.card:nth-child('+num_cards+')').attr('data-type', 1);
            if (waypoints[index].img[0]) $('div.card:nth-child('+num_cards+') img').attr('src', waypoints[index].img[0]);
            else $('div.card:nth-child('+num_cards+') img').attr('src', "./img/Question_Mark.svg");
            $('div.card:nth-child('+num_cards+') .card-body').html("<div class='container'><h5 class='card-title'>"+waypoints[index].title+"</h5><h6 class='card-subtitle text-muted'><small> Point by "+waypoints[index].username+"</small></h6></div>");
        }
        else{
            $('#feed').html($('#feed').html()+cardHTML);
            num_cards++;
            $('div.card:nth-child('+num_cards+')').attr('data-key', index);
            $('div.card:nth-child('+num_cards+')').attr('data-type', 0);
            if (waypoints[index].inputWaypoints[0].img[0]) $('div.card:nth-child('+num_cards+') img').attr('src', waypoints[index].inputWaypoints[0].img[0]);
            else $('div.card:nth-child('+num_cards+') img').attr('src', "./img/Question_Mark.svg");
            $('div.card:nth-child('+num_cards+') .card-body').html("<div class='container'><h5 class='card-title'>"+waypoints[index].inputWaypoints[0].title+"</h5><h6 class='card-subtitle text-muted'><small>Itinerary by "+waypoints[index].username+"</small></h6></div>");
        }
      }

      cardClicked(item){
        var datakey = $(item).attr("data-key");
        var datatype = $(item).attr("data-type");
        if (datakey) this.facade.getPointsOfInterest().onclick_card(datakey, datatype);
      }
    
      change(){
        if (!screen){
            $('body').addClass("mp");
            $('body').removeClass("me");
            screen = 1;
        }
        else{
            $('body').addClass("me");
            $('body').removeClass("mp");
            screen = 0;
        }
      }
}