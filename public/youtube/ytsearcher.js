YTSearcher = function (options){ //var yt=new YTSearcher({googlekey: "AIzaSyD3_AOCz72jah1UDnRW6Gga8n3T3TX9Rq0",yt_url: "https://www.googleapis.com/youtube/v3/", successCallback: function(res){console.log(res);}, wmiCallback:function(){}});

  parent = this;
  this._options={};

  this.final_data=undefined;

  function init(){
    for (var i in options){
      if (typeof(i) === 'object')
        parent._options[i].extend(options[i]);
      else
        parent._options[i]=options[i]
    }
        parent.items=[]
  }

  function cleanItems(){parent.items=[];parent.final_data=undefined;}

  function yt_geovideo_search(_params){
    var params={
      part: "snippet",
      location: _params.coords.latitude+","+_params.coords.longitude,
      locationRadius: _params.radius*1000+"m",
      maxResults: 50,
      key: parent._options.googlekey,
      type: "video",
      videoEmbeddable: true
    }
    // TODO: aggiungere topicId

    if (_params.pageToken)
      params["pageToken"]=_params.pageToken;

    if (_params.topicId)
        params["topicId"]=_params.topicId;
    get_url=parse_params(parent._options.yt_url+"search", params);

    $.ajax({
      method: "GET",
      url: get_url,
      contentType: "application/json",
      format: "json",
      success: function(res){
        parent.items=parent.items.concat(res.items);
        if (res.nextPageToken && _params.results-res.items.length>0)
          yt_geovideo_search(Object.assign(_params, {pageToken: res.nextPageToken, results:_params.results-res.items.length}))
        else
        parent.get_yt_videos(parent.items);
      return res;
      },
      error: function(a,b,c){
        console.log(a,b,c);
      }
    });
  }

  _wmivideo_search = function(_params, latLng, spec_level){
    console.log(parent.items);
    if (spec_level<6 || _params.results<=0){
      parent.get_yt_videos(parent.items.map(function(item){return item.id.videoId}));
      return;
    }
    var params={
      part: "snippet",
      q: facade.locationString(latLng, spec_level, spec_level), //maybe _params.coords ???? -squest-
      key: parent._options.googlekey,
      type: "video",
      maxResults: 50,
      videoEmbeddable: true
    }
    // TODO: aggiungere topicId
    if (_params.pageToken)
      params["pageToken"]=_params.pageToken;

    if (_params.topicId)
        params["topicId"]=_params.topicId;
    get_url=parse_params(parent._options.yt_url+"search", params);

    $.ajax({
      method: "GET",
      url: get_url,
      contentType: "application/json",
      format: "json",
      success: function(res){
        console.log(res);
        //if (res.items.length > 0){
        //  var yt_points = facade.getPointsOfInterest().yt_points;
        //  yt_points = Object.assign({},res.items);
        //  for (var i in yt_points){
        //      var latLn = ytOLCtolatlng(yt_points[i]);
        //      yt_points[i].latLng = Object.assign({},latLn);
        //      facade.getPointsOfInterest().setYoutubeMarker(latLn, i);
        //  }
        //}
        parent.items=parent.items.concat(res.items);
        if (res.nextPageToken && _params.results-res.items.length>0)
          _wmivideo_search(Object.assign(_params, {pageToken: res.nextPageToken, results:_params.results-res.items.length}), latLng, spec_level)
        else {
          delete _params.pageToken;
          _wmivideo_search(Object.assign(_params, {results:_params.results-res.items.length}), latLng, spec_level-2)
        }
      }.bind(this),
      error: function(a,b,c){
        console.log(a,b,c);
      }
    });
  }

  this.wmivideo_search=function(_params, latLng){
      _wmivideo_search(_params, latLng, 10);
  }

  this.get_yt_videos = function (search_resource_array){
    console.log(search_resource_array);
    if(!search_resource_array || search_resource_array.length==0){
      console.log(parent.final_data);
      var data=parent.final_data?Object.assign({}, parent.final_data):{};
      cleanItems();
      parent._options.successCallback(data);
      return;
    }
    var list=search_resource_array.splice(0,25).join(',');

    var params={
      part: "snippet,recordingDetails",
      key: parent._options.googlekey,
      maxResults:50,
      id: list
    };

    get_url=parse_params(parent._options.yt_url+"videos", params);

    $.ajax({
      method: "GET",
      url: get_url,
      contentType: "application/json",
      format: "json",
      success: function(res){
        if (!parent.final_data)
          parent.final_data=Object.assign({}, res);
        else
          parent.final_data.items=parent.final_data.items.concat(res.items);
        parent.get_yt_videos(search_resource_array);
        },
      error: function(a,b,c){
        parent._options.errorCallback(a, b, c);
      }
    });
  }

  function parse_params(ext_url, params){
    var url=ext_url;
    Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});
    if (url.match(/&/).length){
      url=url.substr(0, url.search('&'))+'?'+url.substr(url.search('&')+1);
    }
    return url;
  }

  function onYouTubeIframeAPIReady(id) {
    $('#inspect').html(itineraryHTML);
    player = new YT.Player('video-frame', {
      height: '360',
      width: '640',
      //videoId: id, //'M7lc1UVf-VE',
      events: {
        'onReady': onPlayerReady
        //'onStateChange': onPlayerStateChange
      }
    });
  }

  function onPlayerReady(event) {
    event.target.playVideo();
  }



  this.videoOnMap = function(map, params){
    radius=L.getRadius(map);
    center=map.getCenter();
    yt_geovideo_search({coords:{latitude: center.lat, longitude:center.lng}, radius:radius, results:params.results});
  }
  init();
}
