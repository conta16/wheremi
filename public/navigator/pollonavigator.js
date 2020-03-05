function polloNavigator(usr_onpoint, usr_onstop, usr_wondering){
			var parent = this;

			this._LIMIT = 0.030;
			this.RECALCULATE_LIMIT = 0.060;
			this.NEAR_LIMIT = 0.020;

			this.onstop = ()=>{};
			this.onpoint = ()=>{};
			this.wondering = ()=>{};
			console.log(typeof usr_onpoint);
			if (typeof usr_onpoint == "function")
				this.onpoint = usr_onpoint;
			if (typeof usr_onstop == "function")
				this.onstop = usr_onstop;
			if (typeof usr_wondering == "function")
				this.wondering = usr_wondering;


			function init (){
				parent._prevdist=Infinity;
				parent._prevpos={lat: undefined, lng:undefined};
				parent._targetindex = 0;
				console.log(L.routes);
				parent.stopped=false;
				parent._targetpoint = L.routes[0].coordinates[L.routes[0].instructions[parent._targetindex].index];
			};

			this.nearestPoint= function (latlng){
				var min=Infinity;
				var dist;
				for (var i=0; i< L.routes[0].coordinates.length; i++){
					dist=parent._calculate_distance(L.routes[0].coordinates[i], latlng);
					if (dist<min){
						min=dist;
						index=i;
					}
				}
				return{
					index: index,
					dist: min
				};
			}

			this._wondering = function(e){
				var v=parent.nearestPoint(L.userPosition.latLng)
				if (parent.RECALCULATE_LIMIT<v.dist){
					parent.stopped=true;
					parent.wondering(parent._targetindex);
				}
				else {
						for (var i=0; i < L.routes[0].instructions.length-1; i++){
						if (L.routes[0].instructions[i].index<=v.index && L.routes[0].instructions[i+1].index>=v.index){
							parent._targetindex = i+1;
							parent._targetpoint = L.routes[0].coordinates[L.routes[0].instructions[parent._targetindex].index];
							parent._prevpos={lat:undefined, lng:undefined};
							parent._prevdist=Infinity;
						}
					}
				}
			}

			this._initListeners = function (){
				document.addEventListener('instruction-available', parent._onpoint);
				document.addEventListener('distance-increasement', parent._wondering);
			}

			this.__distance = function (lat1, lon1, lat2, lon2, unit) {
				if (lat2==undefined)
					return Infinity;
				if ((lat1 == lat2) && (lon1 == lon2)) {
					return 0;
				}
				else {
					var radlat1 = Math.PI * lat1/180;
					var radlat2 = Math.PI * lat2/180;
					var theta = lon1-lon2;
					var radtheta = Math.PI * theta/180;
					var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
					if (dist > 1) {
						dist = 1;
					}
					dist = Math.acos(dist);
					dist = dist * 180/Math.PI;
					dist = dist * 60 * 1.1515;
					if (unit=="K") { dist = dist * 1.609344 }
					if (unit=="N") { dist = dist * 0.8684 }
					return dist;
					}
				};

				this.__better_distance =function(lat1, lon1, lat2, lon2, unit){
					function toRadians(deg){return (Math.PI/180)*deg;};

					var R = 6371e3; // metres
					var φ1 = toRadians(lat1);
					var φ2 = toRadians(lat2);
					var Δφ = toRadians(lat2-lat1);
					var Δλ = toRadians(lon2-lon1);

					var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        	Math.cos(φ1) * Math.cos(φ2) *
        	Math.sin(Δλ/2) * Math.sin(Δλ/2);
					var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

					var d = R * c/1000;
					return d;
				};

				this._calculate_distance= function (latlng1, latlng2){
					return this.__better_distance(latlng1.lat, latlng1.lng, latlng2.lat, latlng2.lng, 'K')
				};

				this.stop= function(){
					parent.stopped=true;
					clearTimeout(parent._timeoutChain)
				}

				this._onpoint= function(){
				if (parent._targetindex>=L.routes[0].instructions.length){
					parent.stop();
					parent.onstop();
					parent.stopped=true;
					return;
				}
				parent.onpoint(L.routes[0].instructions[parent._targetindex])
				parent._targetindex+=1;
				parent._prevpos={lat:undefined, lng:undefined};
				parent._prevdist=Infinity;
				if (parent._targetindex>L.routes[0].instructions.length-1)
					parent._targetpoint= undefined;
				else
					parent._targetpoint = L.routes[0].coordinates[L.routes[0].instructions[parent._targetindex].index];
				};

				this._positionCheck= function (){
					var dist = parent._calculate_distance(L.userPosition.latLng, parent._prevpos);
					if (dist>parent.WONDERING_LIMIT /*&& parent.nearest(L.userPosition).index<=parent.nearest(parent._prevpos).index*/){
						var distincr=new Event('distance-increasement', {
							curDist: dist,
							prevDist: parent._prevdist
						});
						document.dispatchEvent(distincr);
						return;
					}
					if (parent._targetindex==0 && parent._calculate_distance(L.userPosition.latLng, parent._targetpoint)>parent.WONDERING_LIMIT){
						parent.stopped=true;
						parent.wondering(0)
					}
				}

				function f (){
					if (parent.stopped)
						return
					if (!parent._targetpoint)
						return;
					var dist = parent._calculate_distance(L.userPosition.latLng, parent._targetpoint);
					if (dist<parent._prevdist){
						parent._prevdist=dist;
						parent._prevpos=Object.assign({}, L.userPosition.latLng);
					}
					parent._positionCheck()
					if (dist<parent.NEAR_LIMIT){
						e = new Event('instruction-available');
						document.dispatchEvent(e);
					}
					if (!parent.stopped)
						parent._timeoutChain=setTimeout(f, 300);
				}

				this.navigate= function(begin_itinerary = false){
					parent._initListeners();
					//if (!L.routes || !L.routes[0]){
						if (facade.selectedWaypoint){
							document.removeEventListener("route-available", this.navigate);
							document.addEventListener("route-available", this.navigate);
							var itin = Object.assign({},facade.getItinerary().getWaypoints());
							facade.getItinerary().setWaypoints([]);
							facade.getItinerary().pushWaypoints([L.userPosition.latLng],undefined, false);
							if (!begin_itinerary) facade.getItinerary().pushWaypoints([facade.selectedWaypoint.latLng],undefined, false);
							else {
								for (var i in itin){
									facade.getItinerary().pushWaypoints([{}], itin[i], false);
									i++;
								}
							}
							facade.getItinerary().showOnMap();
							return;
					//	}
					//	else return;
					}
					init();
					parent._timeoutChain= setTimeout(f,300);
				};

				if (!'routes' in L)
					return;
				if (!'userPosition'in L || L.userPosition==undefined)
					return;
				if (!'latLng' in L.userPosition)
					return;

}
