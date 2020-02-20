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

  <div class="col-auto my-1">
	<p>Purpose:</p>
	<label class="mr-sm-2 sr-only" for="purp"></label>
	<select class="custom-select mr-sm-2" id="purp">
	  <option value="what"selected>What</option>
	  <option value="how">How</option>
	  <option value="why">Why</option>
	</select>
  </div>
	  <div class="form-group">
		  <label for="lang">Language</label>
		  <select class="custom-select mr-sm-2 y-formLanguage" id="lang" rows="1">
			<option val="aar">Afar</option>
			<option val="abk">Abkhazian</option>
			<option val="ace">Achinese</option>
			<option val="ach">Acoli</option>
			<option val="ada">Adangme</option>
			<option val="ady">Adygei</option>
			<option val="afa">Afro-Asiatic Languages</option>
			<option val="afh">Afrihili</option>
			<option val="afr">Afrikaans</option>
			<option val="ain">Ainu</option>
			<option val="aka">Akan</option>
			<option val="akk">Akkadian</option>
			<option val="alb">Albanian</option>
			<option val="sqi">Albanian</option>
			<option val="ale">Aleut</option>
			<option val="alg">Algonquian Languages</option>
			<option val="alt">Southern Altai</option>
			<option val="amh">Amharic</option>
			<option val="ang">English Old (ca.450-1100)</option>
			<option val="anp">Angika</option>
			<option val="apa">Apache Languages</option>
			<option val="ara">Arabic</option>
			<option val="arc">Imperial Aramaic (700-300 BCE)</option>
			<option val="arg">Aragonese</option>
			<option val="arm">Armenian</option>
			<option val="hye">Armenian</option>
			<option val="arn">Mapuche</option>
			<option val="arp">Arapaho</option>
			<option val="art">Artificial Languages</option>
			<option val="arw">Arawak</option>
			<option val="asm">Assamese</option>
			<option val="ast">Asturian</option>
			<option val="ath">Athapascan Languages</option>
			<option val="aus">Australian Languages</option>
			<option val="ava">Avaric</option>
			<option val="ave">Avestan</option>
			<option val="awa">Awadhi</option>
			<option val="aym">Aymara</option>
			<option val="aze">Azerbaijani</option>
			<option val="bad">Banda Languages</option>
			<option val="bai">Bamileke Languages</option>
			<option val="bak">Bashkir</option>
			<option val="bal">Baluchi</option>
			<option val="bam">Bambara</option>
			<option val="ban">Balinese</option>
			<option val="baq">Basque</option>
			<option val="eus">Basque</option>
			<option val="bas">Basa</option>
			<option val="bat">Baltic Languages</option>
			<option val="bej">Bedawiyet</option>
			<option val="bel">Belarusian</option>
			<option val="bem">Bemba</option>
			<option val="ben">Bengali</option>
			<option val="ber">Berber Languages</option>
			<option val="bho">Bhojpuri</option>
			<option val="bih">Bihari Languages</option>
			<option val="bik">Bikol</option>
			<option val="bin">Bini</option>
			<option val="bis">Bislama</option>
			<option val="bla">Siksika</option>
			<option val="bnt">Bantu (Other)</option>
			<option val="bos">Bosnian</option>
			<option val="bra">Braj</option>
			<option val="bre">Breton</option>
			<option val="btk">Batak Languages</option>
			<option val="bua">Buriat</option>
			<option val="bug">Buginese</option>
			<option val="bul">Bulgarian</option>
			<option val="bur">Burmese</option>
			<option val="mya">Burmese</option>
			<option val="byn">Bilin</option>
			<option val="cad">Caddo</option>
			<option val="cai">Central American Indian Languages</option>
			<option val="car">Galibi Carib</option>
			<option val="cat">Catalan</option>
			<option val="cau">Caucasian Languages</option>
			<option val="ceb">Cebuano</option>
			<option val="cel">Celtic Languages</option>
			<option val="cha">Chamorro</option>
			<option val="chb">Chibcha</option>
			<option val="che">Chechen</option>
			<option val="chg">Chagatai</option>
			<option val="chi">Chinese</option>
			<option val="zho">Chinese</option>
			<option val="chk">Chuukese</option>
			<option val="chm">Mari</option>
			<option val="chn">Chinook Jargon</option>
			<option val="cho">Choctaw</option>
			<option val="chp">Chipewyan</option>
			<option val="chr">Cherokee</option>
			<option val="chu">Church Slavic</option>
			<option val="chv">Chuvash</option>
			<option val="chy">Cheyenne</option>
			<option val="cmc">Chamic Languages</option>
			<option val="cop">Coptic</option>
			<option val="cor">Cornish</option>
			<option val="cos">Corsican</option>
			<option val="cpe">Creoles And Pidgins</option>
			<option val="cpf">Creoles And Pidgins</option>
			<option val="cpp">Creoles And Pidgins</option>
			<option val="cre">Cree</option>
			<option val="crh">Crimean Tatar</option>
			<option val="crp">Creoles And Pidgins</option>
			<option val="csb">Kashubian</option>
			<option val="cus">Cushitic Languages</option>
			<option val="cze">Czech</option>
			<option val="ces">Czech</option>
			<option val="dak">Dakota</option>
			<option val="dan">Danish</option>
			<option val="dar">Dargwa</option>
			<option val="day">Land Dayak Languages</option>
			<option val="del">Delaware</option>
			<option val="den">Slave (Athapascan)</option>
			<option val="dgr">Dogrib</option>
			<option val="din">Dinka</option>
			<option val="div">Dhivehi</option>
			<option val="doi">Dogri</option>
			<option val="dra">Dravidian Languages</option>
			<option val="dsb">Lower Sorbian</option>
			<option val="dua">Duala</option>
			<option val="dum">Dutch Middle (ca.1050-1350)</option>
			<option val="dut">Dutch</option>
			<option val="nld">Dutch</option>
			<option val="dyu">Dyula</option>
			<option val="dzo">Dzongkha</option>
			<option val="efi">Efik</option>
			<option val="egy">Egyptian (Ancient)</option>
			<option val="eka">Ekajuk</option>
			<option val="elx">Elamite</option>
			<option val="eng">English</option>
			<option val="enm">English Middle (1100-1500)</option>
			<option val="epo">Esperanto</option>
			<option val="est">Estonian</option>
			<option val="ewe">Ewe</option>
			<option val="ewo">Ewondo</option>
			<option val="fan">Fang</option>
			<option val="fao">Faroese</option>
			<option val="fat">Fanti</option>
			<option val="fij">Fijian</option>
			<option val="fil">Filipino</option>
			<option val="fin">Finnish</option>
			<option val="fiu">Finno-Ugrian Languages</option>
			<option val="fon">Fon</option>
			<option val="fre">French</option>
			<option val="fra">French</option>
			<option val="frm">French Middle (ca.1400-1600)</option>
			<option val="fro">French Old (842-ca.1400)</option>
			<option val="frr">Northern Frisian</option>
			<option val="frs">Eastern Frisian</option>
			<option val="fry">Western Frisian</option>
			<option val="ful">Fulah</option>
			<option val="fur">Friulian</option>
			<option val="gaa">Ga</option>
			<option val="gay">Gayo</option>
			<option val="gba">Gbaya</option>
			<option val="gem">Germanic Languages</option>
			<option val="geo">Georgian</option>
			<option val="kat">Georgian</option>
			<option val="ger">German</option>
			<option val="deu">German</option>
			<option val="gez">Geez</option>
			<option val="gil">Gilbertese</option>
			<option val="gla">Gaelic</option>
			<option val="gle">Irish</option>
			<option val="glg">Galician</option>
			<option val="glv">Manx</option>
			<option val="gmh">German Middle High (ca.1050-1500)</option>
			<option val="goh">German Old High (ca.750-1050)</option>
			<option val="gon">Gondi</option>
			<option val="gor">Gorontalo</option>
			<option val="got">Gothic</option>
			<option val="grb">Grebo</option>
			<option val="grc">Greek Ancient (to 1453)</option>
			<option val="gre">Greek Modern (1453-)</option>
			<option val="ell">Greek Modern (1453-)</option>
			<option val="grn">Guarani</option>
			<option val="gsw">Alemannic</option>
			<option val="guj">Gujarati</option>
			<option val="gwi">Gwich'in</option>
			<option val="hai">Haida</option>
			<option val="hat">Haitian</option>
			<option val="hau">Hausa</option>
			<option val="haw">Hawaiian</option>
			<option val="heb">Hebrew</option>
			<option val="her">Herero</option>
			<option val="hil">Hiligaynon</option>
			<option val="him">Himachali Languages</option>
			<option val="hin">Hindi</option>
			<option val="hit">Hittite</option>
			<option val="hmn">Hmong</option>
			<option val="hmo">Hiri Motu</option>
			<option val="hrv">Croatian</option>
			<option val="hsb">Upper Sorbian</option>
			<option val="hun">Hungarian</option>
			<option val="hup">Hupa</option>
			<option val="iba">Iban</option>
			<option val="ibo">Igbo</option>
			<option val="ice">Icelandic</option>
			<option val="isl">Icelandic</option>
			<option val="ido">Ido</option>
			<option val="iii">Nuosu</option>
			<option val="ijo">Ijo Languages</option>
			<option val="iku">Inuktitut</option>
			<option val="ile">Interlingue</option>
			<option val="ilo">Iloko</option>
			<option val="ina">Interlingua (International Auxiliary Language Association)</option>
			<option val="inc">Indic Languages</option>
			<option val="ind">Indonesian</option>
			<option val="ine">Indo-European Languages</option>
			<option val="inh">Ingush</option>
			<option val="ipk">Inupiaq</option>
			<option val="ira">Iranian Languages</option>
			<option val="iro">Iroquoian Languages</option>
			<option val="ita">Italian</option>
			<option val="jav">Javanese</option>
			<option val="jbo">Lojban</option>
			<option val="jpn">Japanese</option>
			<option val="jpr">Judeo-Persian</option>
			<option val="jrb">Judeo-Arabic</option>
			<option val="kaa">Kara-Kalpak</option>
			<option val="kab">Kabyle</option>
			<option val="kac">Jingpho</option>
			<option val="kal">Greenlandic</option>
			<option val="kam">Kamba</option>
			<option val="kan">Kannada</option>
			<option val="kar">Karen Languages</option>
			<option val="kas">Kashmiri</option>
			<option val="kau">Kanuri</option>
			<option val="kaw">Kawi</option>
			<option val="kaz">Kazakh</option>
			<option val="kbd">Kabardian</option>
			<option val="kha">Khasi</option>
			<option val="khi">Khoisan Languages</option>
			<option val="khm">Central Khmer</option>
			<option val="kho">Khotanese</option>
			<option val="kik">Gikuyu</option>
			<option val="kin">Kinyarwanda</option>
			<option val="kir">Kirghiz</option>
			<option val="kmb">Kimbundu</option>
			<option val="kok">Konkani</option>
			<option val="kom">Komi</option>
			<option val="kon">Kongo</option>
			<option val="kor">Korean</option>
			<option val="kos">Kosraean</option>
			<option val="kpe">Kpelle</option>
			<option val="krc">Karachay-Balkar</option>
			<option val="krl">Karelian</option>
			<option val="kro">Kru Languages</option>
			<option val="kru">Kurukh</option>
			<option val="kua">Kuanyama</option>
			<option val="kum">Kumyk</option>
			<option val="kur">Kurdish</option>
			<option val="kut">Kutenai</option>
			<option val="lad">Ladino</option>
			<option val="lah">Lahnda</option>
			<option val="lam">Lamba</option>
			<option val="lao">Lao</option>
			<option val="lat">Latin</option>
			<option val="lav">Latvian</option>
			<option val="lez">Lezghian</option>
			<option val="lim">Limburgan</option>
			<option val="lin">Lingala</option>
			<option val="lit">Lithuanian</option>
			<option val="lol">Mongo</option>
			<option val="loz">Lozi</option>
			<option val="ltz">Letzeburgesch</option>
			<option val="lua">Luba-Lulua</option>
			<option val="lub">Luba-Katanga</option>
			<option val="lug">Ganda</option>
			<option val="lui">Luiseno</option>
			<option val="lun">Lunda</option>
			<option val="luo">Luo (Kenya And Tanzania)</option>
			<option val="lus">Lushai</option>
			<option val="mac">Macedonian</option>
			<option val="mkd">Macedonian</option>
			<option val="mad">Madurese</option>
			<option val="mag">Magahi</option>
			<option val="mah">Marshallese</option>
			<option val="mai">Maithili</option>
			<option val="mak">Makasar</option>
			<option val="mal">Malayalam</option>
			<option val="man">Mandingo</option>
			<option val="mao">Maori</option>
			<option val="mri">Maori</option>
			<option val="map">Austronesian Languages</option>
			<option val="mar">Marathi</option>
			<option val="mas">Masai</option>
			<option val="may">Malay</option>
			<option val="msa">Malay</option>
			<option val="mdf">Moksha</option>
			<option val="mdr">Mandar</option>
			<option val="men">Mende</option>
			<option val="mga">Irish Middle (900-1200)</option>
			<option val="mic">Mi'kmaq</option>
			<option val="min">Minangkabau</option>
			<option val="mis">Uncoded Languages</option>
			<option val="mkh">Mon-Khmer Languages</option>
			<option val="mlg">Malagasy</option>
			<option val="mlt">Maltese</option>
			<option val="mnc">Manchu</option>
			<option val="mni">Manipuri</option>
			<option val="mno">Manobo Languages</option>
			<option val="moh">Mohawk</option>
			<option val="mon">Mongolian</option>
			<option val="mos">Mossi</option>
			<option val="mul">Multiple Languages</option>
			<option val="mun">Munda Languages</option>
			<option val="mus">Creek</option>
			<option val="mwl">Mirandese</option>
			<option val="mwr">Marwari</option>
			<option val="myn">Mayan Languages</option>
			<option val="myv">Erzya</option>
			<option val="nah">Nahuatl Languages</option>
			<option val="nai">North American Indian Languages</option>
			<option val="nap">Neapolitan</option>
			<option val="nau">Nauru</option>
			<option val="nav">Navaho</option>
			<option val="nbl">Ndebele</option>
			<option val="nde">Ndebele</option>
			<option val="ndo">Ndonga</option>
			<option val="nds">Low</option>
			<option val="nep">Nepali</option>
			<option val="new">Nepal Bhasa</option>
			<option val="nia">Nias</option>
			<option val="nic">Niger-Kordofanian Languages</option>
			<option val="niu">Niuean</option>
			<option val="nno">Norwegian</option>
			<option val="nob">Bokmål</option>
			<option val="nog">Nogai</option>
			<option val="non">Norse</option>
			<option val="nor">Norwegian</option>
			<option val="nqo">N'Ko</option>
			<option val="nso">Northern Sotho</option>
			<option val="nub">Nubian Languages</option>
			<option val="nwc">Classical Nepal Bhasa</option>
			<option val="nya">Chewa</option>
			<option val="nym">Nyamwezi</option>
			<option val="nyn">Nyankole</option>
			<option val="nyo">Nyoro</option>
			<option val="nzi">Nzima</option>
			<option val="oci">Occitan (post 1500)</option>
			<option val="oji">Ojibwa</option>
			<option val="ori">Oriya</option>
			<option val="orm">Oromo</option>
			<option val="osa">Osage</option>
			<option val="oss">Ossetian</option>
			<option val="ota">Turkish Ottoman (1500-1928)</option>
			<option val="oto">Otomian Languages</option>
			<option val="paa">Papuan Languages</option>
			<option val="pag">Pangasinan</option>
			<option val="pal">Pahlavi</option>
			<option val="pam">Kapampangan</option>
			<option val="pan">Panjabi</option>
			<option val="pap">Papiamento</option>
			<option val="pau">Palauan</option>
			<option val="peo">Persian Old (ca.600-400 B.C.)</option>
			<option val="per">Persian</option>
			<option val="fas">Persian</option>
			<option val="phi">Philippine Languages</option>
			<option val="phn">Phoenician</option>
			<option val="pli">Pali</option>
			<option val="pol">Polish</option>
			<option val="pon">Pohnpeian</option>
			<option val="por">Portuguese</option>
			<option val="pra">Prakrit Languages</option>
			<option val="pro">Provençal Old (to 1500)</option>
			<option val="pus">Pashto</option>
			<option val="que">Quechua</option>
			<option val="raj">Rajasthani</option>
			<option val="rap">Rapanui</option>
			<option val="rar">Cook Islands Maori</option>
			<option val="roa">Romance Languages</option>
			<option val="roh">Romansh</option>
			<option val="rom">Romany</option>
			<option val="rum">Moldavian</option>
			<option val="ron">Moldavian</option>
			<option val="run">Rundi</option>
			<option val="rup">Aromanian</option>
			<option val="rus">Russian</option>
			<option val="sad">Sandawe</option>
			<option val="sag">Sango</option>
			<option val="sah">Yakut</option>
			<option val="sai">South American Indian (Other)</option>
			<option val="sal">Salishan Languages</option>
			<option val="sam">Samaritan Aramaic</option>
			<option val="san">Sanskrit</option>
			<option val="sas">Sasak</option>
			<option val="sat">Santali</option>
			<option val="scn">Sicilian</option>
			<option val="sco">Scots</option>
			<option val="sel">Selkup</option>
			<option val="sem">Semitic Languages</option>
			<option val="sga">Irish Old (to 900)</option>
			<option val="sgn">Sign Languages</option>
			<option val="shn">Shan</option>
			<option val="sid">Sidamo</option>
			<option val="sin">Sinhala</option>
			<option val="sio">Siouan Languages</option>
			<option val="sit">Sino-Tibetan Languages</option>
			<option val="sla">Slavic Languages</option>
			<option val="slo">Slovak</option>
			<option val="slk">Slovak</option>
			<option val="slv">Slovenian</option>
			<option val="sma">Southern Sami</option>
			<option val="sme">Northern Sami</option>
			<option val="smi">Sami Languages</option>
			<option val="smj">Lule Sami</option>
			<option val="smn">Inari Sami</option>
			<option val="smo">Samoan</option>
			<option val="sms">Skolt Sami</option>
			<option val="sna">Shona</option>
			<option val="snd">Sindhi</option>
			<option val="snk">Soninke</option>
			<option val="sog">Sogdian</option>
			<option val="som">Somali</option>
			<option val="son">Songhai Languages</option>
			<option val="sot">Sotho</option>
			<option val="spa">Castilian</option>
			<option val="srd">Sardinian</option>
			<option val="srn">Sranan Tongo</option>
			<option val="srp">Serbian</option>
			<option val="srr">Serer</option>
			<option val="ssa">Nilo-Saharan Languages</option>
			<option val="ssw">Swati</option>
			<option val="suk">Sukuma</option>
			<option val="sun">Sundanese</option>
			<option val="sus">Susu</option>
			<option val="sux">Sumerian</option>
			<option val="swa">Swahili</option>
			<option val="swe">Swedish</option>
			<option val="syc">Classical Syriac</option>
			<option val="syr">Syriac</option>
			<option val="tah">Tahitian</option>
			<option val="tai">Tai Languages</option>
			<option val="tam">Tamil</option>
			<option val="tat">Tatar</option>
			<option val="tel">Telugu</option>
			<option val="tem">Timne</option>
			<option val="ter">Tereno</option>
			<option val="tet">Tetum</option>
			<option val="tgk">Tajik</option>
			<option val="tgl">Tagalog</option>
			<option val="tha">Thai</option>
			<option val="tib">Tibetan</option>
			<option val="bod">Tibetan</option>
			<option val="tig">Tigre</option>
			<option val="tir">Tigrinya</option>
			<option val="tiv">Tiv</option>
			<option val="tkl">Tokelau</option>
			<option val="tlh">Klingon</option>
			<option val="tli">Tlingit</option>
			<option val="tmh">Tamashek</option>
			<option val="tog">Tonga (Nyasa)</option>
			<option val="ton">Tonga (Tonga Islands)</option>
			<option val="tpi">Tok Pisin</option>
			<option val="tsi">Tsimshian</option>
			<option val="tsn">Tswana</option>
			<option val="tso">Tsonga</option>
			<option val="tuk">Turkmen</option>
			<option val="tum">Tumbuka</option>
			<option val="tup">Tupi Languages</option>
			<option val="tur">Turkish</option>
			<option val="tut">Altaic Languages</option>
			<option val="tvl">Tuvalu</option>
			<option val="twi">Twi</option>
			<option val="tyv">Tuvinian</option>
			<option val="udm">Udmurt</option>
			<option val="uga">Ugaritic</option>
			<option val="uig">Uighur</option>
			<option val="ukr">Ukrainian</option>
			<option val="umb">Umbundu</option>
			<option val="und">Undetermined</option>
			<option val="urd">Urdu</option>
			<option val="uzb">Uzbek</option>
			<option val="vai">Vai</option>
			<option val="ven">Venda</option>
			<option val="vie">Vietnamese</option>
			<option val="vol">Volapük</option>
			<option val="vot">Votic</option>
			<option val="wak">Wakashan Languages</option>
			<option val="wal">Walamo</option>
			<option val="war">Waray</option>
			<option val="was">Washo</option>
			<option val="wel">Welsh</option>
			<option val="cym">Welsh</option>
			<option val="wen">Sorbian Languages</option>
			<option val="wln">Walloon</option>
			<option val="wol">Wolof</option>
			<option val="xal">Kalmyk</option>
			<option val="xho">Xhosa</option>
			<option val="yao">Yao</option>
			<option val="yap">Yapese</option>
			<option val="yid">Yiddish</option>
			<option val="yor">Yoruba</option>
			<option val="ypk">Yupik Languages</option>
			<option val="zap">Zapotec</option>
			<option val="zbl">Bliss</option>
			<option val="zen">Zenaga</option>
			<option val="zgh">Standard Moroccan Tamazight</option>
			<option val="zha">Chuang</option>
			<option val="znd">Zande Languages</option>
			<option val="zul">Zulu</option>
			<option val="zun">Zuni</option>
			<option val="zxx">No Linguistic Content</option>
			<option val="zza">Dimili</option>
		</select>
	  </div>
	  <div class="col-auto my-1">
	  <p>Content:</p>
	  <label class="mr-sm-2 sr-only" for="cont"></label>
	  <select class="custom-select mr-sm-2 y-formCategory" id="cont">
		<option value="none" selected>none</option>
		<option value="nat">nature</option>
		<option value="art">art</option>
		<option value="his">history</option>
		<option value="flk">folklore</option>
		<option value="mod">modern culture</option>
		<option value="rel">religions</option>
		<option value="cui">cuisine</option>
		<option value="spo">sport</option>
		<option value="mus">music</option>
		<option value="mov">movies</option>
		<option value="fas">fashion</option>
		<option value="shp">shopping</option>
		<option value="tec">technology</option>
		<option value="pop">pop culture and gossip</option>
		<option value="prs">personal experiences</option>
		<option value="oth">other</option>
	  </select>
	</div>
	<div class="col-auto my-1">
	<p>Audience:</p>
	<label class="mr-sm-2 sr-only y-valoreDettaglio" for="aud"></label>
	<select class="custom-select mr-sm-2" id="aud">
		<option value="gen" selected>generical audience</option>
		<option value="pre">pre-school audience</option>
		<option value="elm">primary school</option>
		<option value="mid">middle school</option>
		<option value="scl">specialists</option>
	</select>
  </div>
  <div class="col-auto my-1">
	<p>Detail level:</p>
	<label class="mr-sm-2 sr-only" for="det"></label>
	<input class="mr-sm-2" id="det" type="number" min="1" max="16" value="1">
	</inpue>
  </div>
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
