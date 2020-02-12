const FEED_TAB=0;
const INSPECT_TAB=1;
const PROFILE_TAB=2;

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
