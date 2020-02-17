const FEED_TAB=0;
const INSPECT_TAB=1;
const PROFILE_TAB=2;

const DESCRIPTION_REGEX=/([A-Z,0-9]{8}\+[A-Z,0-9]{0,8})+(-[A-Z,0-9]{8}\+[A-Z,0-9]{0,8})*(:(why|how|what))?(:[a-z]{3})?(:(none|nat|art|his|flk|mod|rel|cui|spo|mus|mov|fas|shp|tec|pop|prs|oth)+(-(none|nat|art|his|flk|mod|rel|cui|spo|mus|mov|fas|shp|tec|pop|prs|oth))*)?(:A(gen|pre|elm|mid|scl|all)(-(gen|pre|elm|mid|scl|all))*)?(:P1?[0-9])?/;
const OLC_REGEX=/([A-Z,0-9]{8}\+[A-Z,0-9]{0,8})/;
const PURP_REGEX=/(why|how|what)/i;
const CONTENT_REGEX=/(none|nat|art|his|flk|mod|rel|cui|spo|mus|mov|fas|shp|tec|pop|prs|oth)/i;
const AUDIENCE_REGEX=/(gen|pre|elm|mid|scl|all)/i;
const PART_REGEX=/P1?[0-9]/i;

function gotoTab(tab){
  $("a[href='#feed']").removeClass("active");
  $("a[href='#profile']").removeClass("active");
  $("a[href='#inspect']").removeClass("active");
  $("#feed").removeClass("active show");
  $("#profile").removeClass("active show");
  $("#inspect").removeClass("active show");
  switch(tab){
    case FEED_TAB:
    $("a[href='#feed']").addClass("active");
      $("#feed").addClass("active show");
      break;
    case INSPECT_TAB:
      $("a[href='#inspect']").addClass("active");
      $("#inspect").addClass("active show");
      break;
    case PROFILE_TAB:
    $("a[href='#profile']").addClass("active");
      $("#profile").addClass("active show");
      break;
  }
}

function selectedWaypoint(){
  return facade.itinerary.graphics.tmp_waypoint[facade.graphics.tmp_index];
}

function mahmood(res){
  var position;
  yt_videos=[]
  for (i in res.items){
    if ((position=res.items[i].snippet.description.search(DESCRIPTION_REGEX))!=-1){
      var desc=res.items[i].snippet.description.substring(position);
      var parts=desc.split(":");
      var last_olc='';
      var purp=undefined;
      var content=[];
      var audience=[];
      var tmp_obj={};
      var part=undefined;
      var lang=undefined;
      for (var j in parts){
        if (parts[j].search(OLC_REGEX)==0){
          last_olc='';
          olcs=content=Object.assign([], parts[j].split("-"))
          for (var k in olcs){
            if (olcs[k].length>last_olc.length && olcs[k].search(OLC_REGEX)==0)
              last_olc=olcs[k];
          }
          purp=(parseInt(j)+1<parts.length)?(parseInt(j)+1):undefined;
          lang=(parseInt(j)+2<parts.length)?(parseInt(j)+2):undefined;
        }
        else if (parts[j].search(DESCRIPTION_REGEX)==0){
          content=Object.assign([], parts[j].split("-"))
        }
        else if (parts[j].search(AUDIENCE_REGEX)==0){
          parts[j]=parts[j].substring(1,3);
          audience=Object.assign([], parts[j].split("-"))
        }
        else if (parts[j].search(PART_REGEX)==0){
          if(parts[j][0].toUpperCase()=='P')
            parts[j]=parts[j].substring(1);
          part=parts[j];
        }

      }
      tmp_obj.latLng={lat:OpenLocationCode.decode(last_olc).latitudeCenter, lng:OpenLocationCode.decode(last_olc).longitudeCenter};
      tmp_obj.title=res.items[i].snippet.title;
      tmp_obj.content=Object.assign([], content);
      tmp_obj.audience=Object.assign([], audience);
      tmp_obj.content=Object.assign([], content);
      if (purp)
        tmp_obj.purpose=parts[purp].toLowerCase();
      if (lang)
        tmp_obj.language=parts[lang].toLowerCase();
      if (part)
        tmp_obj.part=part;
      tmp_obj.id=res.items[i].id;
      yt_videos=yt_videos.concat([tmp_obj]);
      console.log(purp);
    }
  }
  return yt_videos;
}
