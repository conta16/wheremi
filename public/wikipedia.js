function wikiSearcher(options){

    parent = this;
  
    function init(){
      for (var i in options){
        if (typeof(i) === 'object')
          _options[i].extend(options[i]);
        else
          _options[i]=options[i]
      }
    }
  
    function parse_params(ext_url, params){
      var url=ext_url;
      Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});
      if (url.match(/&/).length){
        url=url.substr(0, url.search('&'))+'?'+url.substr(url.search('&')+1);
      }
      return url;
    }
  
    function requestAndCallback(get_url, success, failure){
      $.ajax({
        method: "GET",
        url: get_url,
        contentType: "application/json",
        format: "json",
        success: success,
        error: failure
      });
    }
  
    this.get_wikipage=function (pages, intro){ //pages is a list like this [{pageid: 123456, title: ABC}, ...]
      var wiki_url=options.wiki_search_url+"?origin=*&format=json&action=query&prop=extracts&exlimit=max&explaintext&"+(intro ? "exintro&" : "&")+ "pageids=";
  
      for (var i=0; i<pages.length; i++){
        wiki_url+=pages[i].pageid;
        if (i!=pages.length-1)
          wiki_url+="|"
          }
  
      if (pages) requestAndCallback(wiki_url, function(res){
           for (var i in res.query.pages){
                 res.query.pages[i].latLng={lat: parent.posDictionary[i].lat, lng: parent.posDictionary[i].lng};
                 }
      if (intro) options.introCallback(res);
      else options.pageCallback(res);
      },
      function(a,b,c){console.log(a,b,c)})
      }
  
    this.get_wiki_radius = function(_params){
      var params={
      gsradius: _params.gsradius,
      action: "query",
      list: "geosearch",
      gslimit: _params.num,
      gscoord: _params.coords.latitude+"|"+_params.coords.longitude,
      format: "json",
      gsradius: _params.radius+"m",
      origin: "*"
      }
  
      get_url=options.wiki_search_url;
      get_url=parse_params(get_url, params);
  
    requestAndCallback(get_url, function(res){parent.get_wikipage(res.query.geosearch, true)}, function(a,b,c){console.log(a,b,c)})
    }
  
    this.dictionarize = function(){
      parent.posDictionary={};
      for (var i in parent.lastResponse.query.geosearch){
          parent.posDictionary[parent.lastResponse.query.geosearch[i].pageid]={lat: parent.lastResponse.query.geosearch[i].lat, lng: parent.lastResponse.query.geosearch[i].lon}
          }
      }
  
    this.get_wiki_bbox = function(_params){
      var params={
        action: "query",
        list: "geosearch",
        gslimit: _params.num,
        gsbbox: _params.coords1.latitude+"|"+_params.coords1.longitude+'|'+_params.coords2.latitude+"|"+_params.coords2.longitude,
        format: "json",
      origin: "*"
        }
  
      get_url=options.wiki_search_url;
      get_url=parse_params(get_url, params);
      requestAndCallback(get_url, function(res){if (res.query==undefined) return; parent.lastResponse=Object.assign({}, res); parent.dictionarize(); parent.get_wikipage(res.query.geosearch, true)}, function(a,b,c){console.log(a,b,c)})
      }
  
      this.bboxFromLeaflet=function(map){
        bounds=map.getBounds();
        var east=bounds._northEast.lng;
        var north=bounds._northEast.lat;
        var south=bounds._southWest.lat;
        var west=bounds._southWest.lng;
        return {coords1:{latitude: north, longitude: west}, coords2:{latitude: south, longitude: east }}
      }
  
      this.searchOnMap= function(map, num){
        bounds= parent.bboxFromLeaflet(map);
        parent.get_wiki_bbox({num: num, coords1: bounds.coords1, coords2: bounds.coords2});
      }
  }

  //https://en.wikipedia.org/w/api.php