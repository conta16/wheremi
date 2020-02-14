function SimpleRecorder(){
var cStream,
  aStream,
  recorder,
  dataArray,
  chunks = [],
  video;
  this.videoBlob=undefined;

  parentThis=this;

var lorem="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque congue ante eu facilisis malesuada. Maecenas pharetra ante vitae suscipit mattis. Nulla at suscipit mauris, non fermentum neque. Aliquam ullamcorper ornare consectetur. Aenean feugiat enim quis dictum elementum. Sed pharetra cursus metus."

this.initVideoStream=function(button){
  button.innerHTML="Click to start";
  $("#recordvideo").prop("disabled", true);
  this.initMediaStream({'audio': true, 'video': {facingMode:"user"}})
}

this.initAudioStream=function(button){
  button.innerHTML="Click to start";
  $("#recordAudio").prop("disabled", true);
  this.initMediaStream({'audio': true, 'video': false})
}

this.clickHandler=function() {

  this.textContent = 'Stop recording';

  var options = {
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 2500000,
    mimeType: 'video/mp4'
  }

  var mixedStream = new MediaStream([('getVideoTracks' in cStream) ? cStream.getVideoTracks()[0]: cStream, ('getAudioTracks' in aStream) ? aStream.getAudioTracks()[0]: aStream], options);
  recorder = new MediaRecorder(mixedStream);
  console.log(recorder);
  recorder.start();

  recorder.ondataavailable = SimpleRecorder.saveChunks;
  recorder.onerror = (e) =>{console.log("errore: "+e);}
  recorder.onwarning = (e) =>{console.log("warning: "+e);}
  recorder.onstop = SimpleRecorder.exportStream;

  this.onclick = SimpleRecorder.stopRecording;

};

this.set_video_src=function(src){
  if ('srcObject' in video)
    video.srcObject = src;
  else
    video.src = URL.createObjectURL(src);
}

this.exportStream=function(e) {
  e.target.stream.getTracks().forEach(function(track) {
  track.stop();
  });
  if (chunks.length) {
    var blob = new Blob(chunks, {type:"video/mp4"});
    SimpleRecorder.videoBlob=new Blob(chunks, {type:"video/mp4"});
    var vidURL = URL.createObjectURL(blob);
    if ('srcObject'in video)
      video.srcObject=undefined;
    video.src=vidURL;
    video.autoplay=false;
    } else {
    document.body.insertBefore(document.createTextNode('no data saved'), canvas);

  }
}

this.saveChunks=function(e) {
  e.data.size && chunks.push(e.data);

}

this.stopRecording=function() {
	this.disabled = true;
  video.controls=true;
  recorder.stop();
}

this.drawCanvas=function(canvasCtx, img){
  title=$("textarea#title");
  description=$("textarea#description");
  canvasCtx.drawImage(img, 0, 0, 1920, 1080);
  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx.font = "96px Comic Sans MS";
  canvasCtx.fillStyle = "black";
  canvasCtx.textAlign = "center";
  canvasCtx.fillText(title.val(), 1440, 200);
  canvasCtx.textAlign = "left";

  var size=36;
  canvasCtx.font = size+"px Comic Sans MS";
  var towrite=[];
  var desc=[];

  Object.assign(desc, description.val().split(' '));

    i=0;
    while (desc.length!=0 && i<desc.length){
      var measure = canvasCtx.measureText(desc.slice(0, i).join(' '))
      if ((measure.width >900 && i!=0 )){
        towrite.push(desc.slice(0, i-1).join(' '))
        desc=desc.slice(i-1);
        i=0;
        }
      else if (i==0 && measure.width > 900){
        if (size >20)
          size -= 10;
        else
          size=size/2;
        break;
        }
      i++;
    }
    towrite.push(desc.slice(0, desc.length).join(' '))
    for (i=0; i<towrite.length && i*1.5*size<1000; i++){
      canvasCtx.fillText(towrite[i], 960, 360+i*1.5*size);
      }
}

this.only_audio=function(stream){
  aStream=stream;
  var canvasCtx = canvas.getContext('2d');
  var img= new Image(1920, 1080);
  img.src='/img/paul16-9.png';
  canvasCtx.fillStyle = 'rgb(255, 255, 255)';
  img.onload= ()=>{SimpleRecorder.drawCanvas(canvasCtx, img);};
  cStream = canvas.captureStream(30);
  this.set_video_src(cStream);
  }

this.audio_video=function(stream){
  console.log(stream);
  aStream=stream.getAudioTracks()[0];
  var canvasCtx = canvas.getContext('2d');
  cStream = stream.getVideoTracks()[0];
  video.volume=0;
  this.set_video_src(stream);
}

this.initMediaStream=function(descriptor) {
  var pThis=parentThis
  video=$('#monitor')[0];
  if ('error' in descriptor)
    console.log(descriptor);
  var audioCtx = new AudioContext();
  // create a stream from our AudioContext

  navigator.mediaDevices.getUserMedia(descriptor)
  .then(function(stream) {
    if (!descriptor.video){
      SimpleRecorder.only_audio(stream);
      recordAudio.onclick = SimpleRecorder.clickHandler;
    }
    else{
      SimpleRecorder.audio_video(stream);
      recordVideo.onclick = SimpleRecorder.clickHandler;
    }
  })
  .catch(function(err) {
    console.log('ERROR '+err)
  });

};

this.enable_button=function(el){
  el.removeAttr('disabled');
}
}


var SimpleRecorder=new SimpleRecorder();
