angular.module('starter.controllers', [])

.controller('MapCtrl', function($scope, $ionicLoading, $ionicPopup){
	var ibarra = {
		lat: 0.3391763,
		lng: -78.12223360000002
	}

	var playas ={
		lat: 0.8680071,
		lng: -79.84648040000002
	}

	var estadio = {
		lat: -0.1777446,
		lng: -78.47697040000003
	}
	
	var miUbicacion={}

	//variables para controlar el toggle
	var toggleMarkerStatus= false;
	var theListner;

	//variable para marcadores
	var markerCount =1;

	//inizializacion del mapa al cargar
	initMap = function(){
		var mapDiv = document.getElementById('map');

		var mapOptions={
			center: ibarra,
			zoom: 10,

			//quitar todos los controles
			//disableDefaultUI: true
			zoomControl:true,
			//mapTypeControl:false,

			//añadir opciones
			//mapTypeId: google.maps.MapTypeId.SATELLITE
			//mapTypeId: google.maps.MapTypeId.TERRAIN
			//mapTypeId: google.maps.MapTypeId.ROADMAP
			//mapTypeId: google.maps.MapTypeId.HYBRID,

			//Desabilito el zoom con doble click
			disableDoubleClickZoom: true,

			//poner color al fondo del mapa
			backgroundColor:"#000",

			//no permitir que el mapa se mueva
			draggable:true,

			//definir niveles de zoom
			//minZoom:10,
			//maxZoom:15,

			//manejo de escala  
			scaleControl:true,

			//metodo para mostrar todos los tipos de mapas
			mapTypeControlOptions:{
				style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
				mapTypesIds: [
					google.maps.MapTypeId.SATELLITE,
					google.maps.MapTypeId.TERRAIN,
					google.maps.MapTypeId.ROADMAP,
					google.maps.MapTypeId.HYBRID
				],
				//poner la posicion
				//position: google.maps.ControlPosition.LEFT_BOTTOM
			},
			//poner la posicion
			zoomControlOptions:{
				position: google.maps.ControlPosition.LEFT_BOTTOM
			}



		}

		$scope.map = new google.maps.Map(mapDiv, mapOptions)
		searchPlace();

		//traceRoute();


		//ejecutar el encontrar mi position
		 $scope.locateMe();

		//llamada a la funcion de marca en el mapa
		//$scope.map.addListener('click',addMarkerAtMouse)
	}

	//Metodo que verifica el toggle y permite la funcionalidad
	$scope.toggleAddMarker = function(){
		if(toggleMarkerStatus){
			toggleMarkerStatus=false;
			google.maps.event.removeListener(theListner)
		}else{
			toggleMarkerStatus=true;
			theListner =$scope.map.addListener('click',addMarkerAtMouse)
		}
	}
 
	//funcion para crear marcadores
	addMarkerAtMouse= function(e){
		addMarker(e.latLng)
	}

	//metodo para obtener la ubicacion  propia 
	$scope.locateMe = function(){
		$ionicLoading.show({});

		navigator.geolocation.getCurrentPosition(function(pos){
			$ionicLoading.hide();

			miUbicacion.lat =pos.coords.latitude;
			miUbicacion.lng =pos.coords.longitude;

			$scope.map.setCenter(miUbicacion);

			$ionicLoading.hide();
			addMarker(miUbicacion);


		},function(error){
			$ionicLoading.hide();
			$ionicPopup.alert({
				title: 'Error de localizacion',
				template : error.message,
				okType: 'button-assertive'
			});
		})
	}

	//metodo para añadir un marcador en el mapa
	addMarker =function(ubicacion){
		//arreglo de todos los marcadores
		var markIcon = [
			'img/m1.png',
			'img/m2.png',
			'img/m3.png',
		];

		//obtencion randomica de los marcadores
		var random = Math.floor (Math.random()*3)

		var marker = new google.maps.Marker({
			map: $scope.map,
			position: ubicacion,
			//opcion de mover el marker
			draggable:false,

			//adicion de etiquetas del marcador(solo un caracter)
			//label:"Y"
			//label:String (markerCount),

			//poner icono a los marcadores
			icon: markIcon[random],

			//agregar animacion a los marker
			//animation:google.maps.Animation.DROP
			//animation:google.maps.Animation.BOUNCE
		})

		markerCount++;

		marker.addListener('dblclick',deleteMarker)
		//marker.addListener('click',addAnimation)
		marker.addListener('click',addInfoWindow)

	}

	addInfoWindow= function(e){
		var geocoder = new google.maps.Geocoder;
		var infoWindow = new google.maps.InfoWindow({
			maxWidth:100
		});

		var self = this;

		//infoWindow.setContent('Mensaje de prueba');
		// infoWindow.open($scope.map, this);

		geocoder.geocode({'location':e.latLng},function(results,status){
			if (status === google.maps.GeocoderStatus.OK){
				console.log (results);
				var placeName = results[1].address_components[1].short_name;
				var placeAddress = results[0].formatted_address;
				var info = placeName +"<hr>"+ placeAddress;

				infoWindow.setContent(info);
				infoWindow.open($scope.map,self)
			}
		})
	}

	//metodo para añadir animacion
	addAnimation = function(){
		this.setAnimation(google.maps.Animation.BOUNCE)
	}

	//metodo para eliminar marcador
	deleteMarker = function(){
		this.setMap(null);
	}

	//metodo para utilizar el buscador de google 
	searchPlace = function (){
		var search = document.getElementById('search');
		var searchBox = new google.maps.places.SearchBox(search);

		$scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(search);
	
		searchBox.addListener('places_changed',function(){
			var places = searchBox.getPlaces();

			places.forEach(function(place){
				var ubicacion =place.geometry.location;
				addMarker(ubicacion);
				$scope.map.setCenter(ubicacion);
				traceRoute(ubicacion);
			})
		})
	}

	//metoto de trazado de rutas para poder llegar
	traceRoute = function(ubicacion){
		var directionsDisplay = new google.maps.DirectionsRenderer({
			map:$scope.map
		});

		var request ={
			destination: ibarra,
			origin : estadio,
			travelMode: google.maps.TravelMode.DRIVING
		}

		var directionsService = new google.maps.DirectionsService();

		directionsService.route(request,function(response,status){
			if (status == google.maps.DirectionsStatus.OK){
				directionsDisplay.setDirections(response);
			}
		})
	}

	$scope.trazarRuta = function(){
		var directionsDisplay = new google.maps.DirectionsRenderer({
			map:$scope.map
		});

		var request ={
			destination: ibarra,
			origin : miUbicacion,
			travelMode: google.maps.TravelMode.DRIVING
		}

		var directionsService = new google.maps.DirectionsService();

		directionsService.route(request,function(response,status){
			if (status == google.maps.DirectionsStatus.OK){
				directionsDisplay.setDirections(response);
			}
		})
	}

	//metodo para poder observar la vista panoramica de google
	$scope.changeView = function(){
		var panorama = new google.maps.StreetViewPanorama(
			document.getElementById('map'),{
				position : ibarra
			}
			)
	}

	//metodo para pintar ruta de los lugares definidos en un array
	$scope.paintRoute = function(){
		var routeCoords =[ibarra,playas, miUbicacion,estadio];

		//var routePath =new google.maps.Polyline({
		var routePath =new google.maps.Polygon({
			path: routeCoords,
			strokeColor: '#0066ff',
			strokeOpacity:1.0,
			strokeWeight:2,

			fillColor:'#3385ff',
			fillOpacity: 0.35,

			geodesic:true,
			editable:true,
			draggable:true
		})

		routePath.setMap($scope.map); 
	}

	//metodo para dibujar un circulo en el mapa
	$scope.paintCircle = function(){
		var routeCoords =[ibarra,playas, miUbicacion,estadio];

		var color ="#"+Math.random().toString(16).slice(2,8)
		var randomRadius =Math.floor(Math.random()*1000000)
		var randomPlace = Math.floor(Mathrandom()*5)

		var routePath = new google.maps.Circle({
			strokeColor:'#0048b3',
			strokeOpacity:0.8,
			strokeWeight:2,
			fillColor:color,
			fillOpacity:0.35,
		})

		routePath.setRadius(randomRadius)
		routePath.setCenter(muPlaces[randomPlace])
		routePath.setMap($scope.map)
	}

	if(document.readyState === "complete"){
		initMap()
	} else {
		google.maps.event.addDomListener(window, 'load', initMap);
	}

})