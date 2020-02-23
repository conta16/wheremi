/*
Copyright 2015 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var BLOCK_YT=0

var STATUS_POLLING_INTERVAL_MILLIS = 60 * 1000; // One minute.


/**
 * YouTube video uploader class
 *
 * @constructor
 */
var UploadVideo = function() {
  /**
   * The array of tags for the new YouTube video.
   *
   * @attribute tags
   * @type Array.<string>
   * @default ['google-cors-upload']
   */
  this.tags = ['wheremi', 'clarissa'];

  /**
   * The numeric YouTube
   * [category id](https://developers.google.com/apis-explorer/#p/youtube/v3/youtube.videoCategories.list?part=snippet®ionCode=us).
   *
   * @attribute categoryId
   * @type number
   * @default 22
   */
  this.categoryId = 22;

  /**
   * The id of the new video.
   *
   * @attribute videoId
   * @type string
   * @default ''
   */
  this.videoId = '';

  this.uploadStartTime = 0;
};

parentThis=this;

client_init = function(){
  gapi.load('client:youtube');
}

UploadVideo.prototype.ready = function(accessToken, show_progress, done) {
  this.accessToken = accessToken;
  this.gapi = gapi;
  this.show_progress = show_progress;
  this.done = done;
  this.authenticated = true;
  $.ajax({
    url: "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
    method: "GET",
    success: function (data){
      console.log(data);
      this.gapi.client.init({
              apiKey: "AIzaSyD3_AOCz72jah1UDnRW6Gga8n3T3TX9Rq0",
              clientId: "1082311706769-imjjc300bk99fval3kanm2u86ioaagud.apps.googleusercontent.com",
              discoveryDocs: [data],
              scope: "https://www.googleapis.com/auth/youtube"
      }).then(function(){
        this.gapi.client.request({
          path: '/youtube/v3/channels',
          headers: {'Authorization': 'Bearer '+this.accessToken},
          params: {
            part: 'snippet',
            mine: true
          },
          callback: function(response) {
            if (response.error) {
              console.log(response.error.message);
            }
          }.bind(this),
          onerror: function(response){
            alert("We are having some trouble with the authentication service. Please, log in again")
          }
        });
      }.bind(this)).catch(error =>{
        console.log(error)
      });
    }.bind(this)
  });
};

/**
 * Uploads a video file to YouTube.
 *
 * @method uploadFile
 * @param {object} file File object corresponding to the video to upload.
 */

UploadVideo.prototype.uploadFile = function(file, metadata) {
  metadata.snippet.tags=this.tags;
  if (!this.accessToken)
    return;
  if (BLOCK_YT===1) return;
  console.log(file, metadata)
  var uploader = new MediaUploader({
    baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
    file: file,
    token: this.accessToken,
    metadata: metadata,
    params: {
      part: Object.keys(metadata).join(',')
    },
    onError: function(data) {
      var message = data;
      // Assuming the error is raised by the YouTube API, data will be
      // a JSON string with error.message set. That may not be the
      // only time onError will be raised, though.
      try {
        var errorResponse = JSON.parse(data);
        message = errorResponse.error.message;
      } finally {
        console.log('errore');
        alert(message);
      }
    }.bind(this),
    onProgress: function(data) {
      var currentTime = Date.now();
      var bytesUploaded = data.loaded;
      var totalBytes = data.total;
      // The times are in millis, so we need to divide by 1000 to get seconds.
      var bytesPerSecond = bytesUploaded / ((currentTime - this.uploadStartTime) / 1000);
      var estimatedSecondsRemaining = (totalBytes - bytesUploaded) / bytesPerSecond;
      var percentageComplete = (bytesUploaded * 100) / totalBytes;

      this.show_progress(percentageComplete);


    }.bind(this),
    onComplete: function(data) {
      var uploadResponse = JSON.parse(data);
      this.videoId = uploadResponse.id;
      this.pollForVideoStatus();
    }.bind(this)
  });
  // This won't correspond to the *exact* start of the upload, but it should be close enough.
  this.uploadStartTime = Date.now();
  uploader.upload();
};

UploadVideo.prototype.uploadBlob = function(blob, metadata) {
    if(blob != undefined)
      this.uploadFile(blob, metadata);
}

UploadVideo.prototype.pollForVideoStatus = function() {
  this.gapi.client.request({
    path: '/youtube/v3/videos',
    params: {
      part: 'status,player',
      id: this.videoId
    },
    callback: function(response) {
      if (response.error) {
        // The status polling failed.
        console.log(response.error.message);
        setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
      } else {
        if (!response.items[0])
          return;
        var uploadStatus = response.items[0].status.uploadStatus;
        switch (uploadStatus) {
          // This is a non-final status, so we need to poll again.
          case 'uploaded':
            //console.log(uploadStatus)
            // TODO: dire che abbiamo caricato il video
            setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
            break;
          // The video was successfully transcoded and is available.
          case 'processed':
            this.done();
            break;
          // All other statuses indicate a permanent transcoding failure.
          default:
          // TODO: Segnalare errore
            break;
        }
      }
    }.bind(this)
  });
};

UploadVideo.prototype.setVideoPrivacy=function(id, value, done){
  this.gapi.client.request({
    path:"youtube/v3/videos",
    method:"PUT",
    headers: {'Authorization': 'Bearer '+this.accessToken},
    params:{part: 'status', key:this.accessToken},
    body:{
      id: id,
      status: {
        privacyStatus: value
      }
    }
  }).then( function(response) {
    if (response.error) {
      return console.log(response.error);
    }
    return done(response.result)

  }.bind(this),function(response){
    if (response.status=="404"){
      //il video non è più online, rimuovere la clip dal nostro db
      return;
    }
  })
}

UploadVideo.prototype.getVideos=function(done){
  this.gapi.client.request({
    path:"youtube/v3/search",
    method:"GET",
    headers: {'Authorization': 'Bearer '+this.accessToken},
    params:{part: 'snippet', key:this.accessToken, forMine: true, type:"video", maxResults:"50"},
  }).then( function(response) {
    if (response.error) {
      return console.log(response.error);
    }
    return done(response.result)

  }.bind(this),function(response){
    if (response.status!="200"){

      return;
    }
  })
}

UploadVideo.prototype.retreiveVideos=function(id, done){  //come YTSearcher.get_yt_videos, ma più potente perché vede anche i video dell'utente
  this.gapi.client.request({
    path:"youtube/v3/videos",
    method:"GET",
    headers: {'Authorization': 'Bearer '+this.accessToken},
    params:{part: 'snippet, status', key:this.accessToken, type:"video", maxResults:"50", id:id},
  }).then( function(response) {
    if (response.error) {
      return console.log(response.error);
    }
    return done(response.result)

  }.bind(this),function(response){
    if (response.status!="200"){

      return;
    }
  })
}

UploadVideo.prototype.deleteVideo=function(id, done){
  this.gapi.client.request({
    path:"youtube/v3/videos",
    method:"DELETE",
    headers: {'Authorization': 'Bearer '+this.accessToken},
    params: {id:id},
  }).then( function(response) {
    if (response.error) {
      return console.log(response.error);
    }
    return done(response.result)

  }.bind(this),function(response){
    if (response.status!="204"){
      return;
    }
  })
}
