var map;
var url = "https://site181951.tw.cs.unibo.it";
var tmp_index;
var tmp_waypoint;
var YTUploader;

/*const choiceControl = new ChoiceControl({
    provider: provider,
});*/

//map.addControl(choiceControl);
var nav;

$(document).ready(function() {
	facade = new Facade();

	navigatorControl = new navigatorController(facade.getItinerary());

	var provider = new OpenStreetMapProvider(facade.getItinerary(), facade.getPointsOfInterest());

	var searchControl = new GeoSearchControl({
    	provider: provider,
	});

  map.addControl(searchControl);
  facade.getGraphics().loadControllers();
	gapi.load('client:youtube', {
		callback: function(){
		YTUploader = new UploadVideo();
			$.ajax({
			url:'/user',
			method:'GET',
			success:function(data){
				console.log("accessToken "+data.accessToken);
				if (data.accessToken)
					YTUploader.ready(data.accessToken);
			}
		});
}
});
	loadPoints();

	facade.checkLoggedIn();
	map.on('zoomend', loadPoints);
	map.on('drag', loadPoints);

});
/*
function apply(){
	pointsOfInterest.addedPoint.description = $("#popupInput").val();
	console.log($("#popupInput"));
}*/

function loadPoints(){
	ts=new Date()
	setTimeout(function(){
		if (new Date()-ts<800)
			return;
		var point = facade.getPointsOfInterest();
	  point.loadPoints(point);

	}, 800)
}

function youtubeUpload(){
  var file = $('#me')[0].files[0];
	var fileReader = new FileReader();
	fileReader.onloadend = function (e) {
		array=new Uint8Array(e.target.result);
		let blob = new Blob([array], {type: file.type });
    console.log(blob);
    YTUploader.uploadBlob(blob);
	};
	fileReader.readAsArrayBuffer(file);
}

function checkDistance(){
  facade.checkDistance();
}


  var itineraryHTML = `<div id="carouselExampleIndicators" class="carousel slide mb-1 mt-1" data-ride="carousel">
  <div class="carousel-inner w-100" style="height: 300px !important"></div>
  <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
	<span class="carousel-control-prev-icon" aria-hidden="true"></span>
	<span class="sr-only">Previous</span>
  </a>
  <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
	<span class="carousel-control-next-icon" aria-hidden="true"></span>
	  <span class="sr-only">Next</span>
  </a>
  </div>

  <form enctype="multipart/form-data" id="exportisexcel" class="form-horizontal">
  <div class="form-group">

	<div class="w-100">
	<video id="monitor" width="100%" autoplay="autoplay"></video>
  </div>
	<div class="panel-body">
		<div class="filesloader-wrap">
				<div class="fileupload-buttonbar">
					  <span class="btn btn-white fileinput-button">
						  <span>Add image</span>
						  <input id="f" class="y-me y-inputLocation" type="file" accept="image/*" ></input>
            </span>
						<span class="btn btn-danger fileinput-button" id="recordVideo" onclick="SimpleRecorder.initVideoStream(this)">
						  <span>Record video</span>
            </span>
						<span id="recordAudio" class="btn btn-secondary fileinput-button" onclick="SimpleRecorder.initAudioStream(this)">
						  <span>Record audio</span>
            </span>
						<span id="uploadOnYT" class="btn btn-primary fileinput-button" onclick="facade.uploadVideo()">
							Upload on Youtube
						</span>
				</div>
		</div>
	</div>

  </div>

  <div class="form-group p">
	<label for="title">Title:</label>
	<textarea class="form-control d" id="title"></textarea>
  </div>

  <div class="form-group p">
	<label for="description">Description:</label>
	<textarea class="form-control d y-descrizioneLuogo" id="description" rows="3"></textarea>
  </div>

  <div class="nopermit"></div>

  <div class="category align-items-center" style="margin-bottom: 50px">


  <div class="comment">
	  <div class="form-group">
		  <label for="com">Leave a comment</div>
		  <textarea class="form-control" id="com" rows="1"></textarea>
		  <button type="button" class="btn btn-primary" id="send_comment" disabled>Send comment</button>
	  </div>
  </div>
  <input id="saveChanges" type="submit" value="Submit" class="btn btn-primary" > <!--onclick="youtubeUpload()"-->
</form>
  <div class="comment-section">
	  <p>Comments:</p>
	  <div id="comment-list">

	  </div>
  </div>
  <div style="margin-bottom: 50px">
    <button type="button" class="btn btn-primary" id="startItinerary" onclick="facade.startItinerary()">Start Itinerary</button>
  </div>
  </div>

  <div class="footer" style="margin-left:-50%;">
	  <button type="button" class="btn btn-primary" id="left">Previous</button>
	  <button type="button" class="btn btn-primary" id="right">Next</button>
  </div>
  `;

  var cardHTML = `<div class="card mt-3" style="height:20%; overflow: hidden" onclick="facade.getGraphics().cardClicked(this)" data-key="" data-type="">
  <div class="card-horizontal">
	<img class="card-img w-50" style="height: 200px;" src="" alt="Card image cap">
	<div class="card-body" style="text-align: left; overflow: hidden">
	</div>
  </div>
  </div>`;

  var profileHTML = "<iframe src='/profile' class='h-100'></iframe>";
