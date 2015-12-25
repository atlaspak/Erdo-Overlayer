var overlay;

var focusLocation = new google.maps.LatLng(39.869967, 32.744971);
var srcImage = 'images/example.png';

DebugOverlay.prototype = new google.maps.OverlayView();


var bottomLeftPoint = new google.maps.LatLng((focusLocation.lat() - 0.001), (focusLocation.lng() - 0.001));
var topRightPoint = new google.maps.LatLng((focusLocation.lat() + 0.001), (focusLocation.lng() + 0.001));
var bottomRightPoint = new google.maps.LatLng((focusLocation.lat() - 0.001), (focusLocation.lng() + 0.001));
var topLeftPoint = new google.maps.LatLng((focusLocation.lat() + 0.001), (focusLocation.lng() - 0.001));
var rotateMarkerPoint = {lat: bottomRightPoint.lat(), lng: ((bottomRightPoint.lng() + bottomLeftPoint.lng())/2)};

var centerPoint;
var imgDegree = 0;
var imgRadian = 0;
var initialVector;
var deltaRadian = 0;
var dragAcc;  //Helper variable for dragMarker
var initalPosition;  //Initial position of the corner that is dragged

function initialize() {

	var bounds = new google.maps.LatLngBounds(bottomLeftPoint, topRightPoint);

	var mapOptions = {
		zoom : 18,
		center : focusLocation
	};
	
	var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	overlay = new DebugOverlay(bounds, srcImage, map);
	
	bottomLeftMarker = new google.maps.Marker({
			position : bottomLeftPoint,
			map : map,
			draggable : true,
			icon : 'icons/target1.png'
		});
		
	topLeftMarker = new google.maps.Marker({
			position : topLeftPoint,
			map : map,
			draggable : true,
			icon : 'icons/target2.png'
		});
		
	topRightMarker = new google.maps.Marker({
			position : topRightPoint,
			map : map,
			draggable : true,
			icon : 'icons/target3.png'
		});
		
	bottomRightMarker = new google.maps.Marker({
			position : bottomRightPoint,
			map : map,
			draggable : true,
			icon : 'icons/target4.png'
		});
				
	rotateMarker = new google.maps.Marker({
			position : rotateMarkerPoint,
			map : map,
			draggable : true,
			icon : 'icons/rotate.png'
		});
	
	dragMarker = new google.maps.Marker({
			position : overlay.calculateCenter(),
			map : map,
			draggable : true,
			icon : 'icons/drag.png'
	})
	
	//calculation of initial vector
	centerPoint = overlay.calculateCenter();
	initialVector = {x: rotateMarkerPoint.lat - centerPoint.lat , y: rotateMarkerPoint.lng - centerPoint.lng};
	
	//Resize markers "drag" events
	google.maps.event.addListener(bottomLeftMarker, 'drag', function () {

		bottomLeftPoint = bottomLeftMarker.getPosition();
	});
	
	google.maps.event.addListener(topLeftMarker, 'drag', function () {

		topLeftPoint = topLeftMarker.getPosition();
		
	});
	
	google.maps.event.addListener(topRightMarker, 'dragstart', function(){
		initialPosition = topRightMarker.getPosition();
	});
	
	google.maps.event.addListener(topRightMarker, 'drag', function () {

		var dragVector = {lat: topRightMarker.getPosition().lat() - initialPosition.lat(), lng : topRightMarker.getPosition().lng() - initialPosition.lng()};
		
		//bottomRightMarker.setPosition(new google.maps.LatLng(bottomRightMarker.getPosition().lat() + dragVector.lng * Math.tan(-deltaRadian), bottomRightMarker.getPosition().lng() + dragVector.lng));
		//topLeftMarker.setPosition(new google.maps.LatLng(topLeftMarker.getPosition().lat() + dragVector.lat, topLeftMarker.getPosition().lng() + dragVector));
		//topRightPoint = topRightMarker.getPosition();
		
		initialPosition = topRightMarker.getPosition();
		
	});
	
	google.maps.event.addListener(bottomRightMarker, 'drag', function () {

		bottomRightPoint = bottomRightMarker.getPosition();
	});	
	
	
	//rotate marker events
	google.maps.event.addListener(rotateMarker, 'dragstart', function () {
		
		var angle = overlay.calculateAngle(rotateMarker.getPosition());
		deltaRadian = angle.radian;
		
		bottomLeftMarker.setVisible(false);
		topLeftMarker.setVisible(false);
		topRightMarker.setVisible(false);
		bottomRightMarker.setVisible(false);
	});
	
	google.maps.event.addListener(rotateMarker, 'drag', function() {
		
		var angle = overlay.calculateAngle(rotateMarker.getPosition());
		imgDegree = angle.degree;
		document.getElementById("image").style.transform = 'rotate(' + imgDegree  + 'deg)';
		 
	});
	
	google.maps.event.addListener(rotateMarker, 'dragend', function(){
		
		var angle = overlay.calculateAngle(rotateMarker.getPosition());
		deltaRadian = angle.radian - deltaRadian;
		
		centerPoint = overlay.calculateCenter();
		bottomLeftMarker.setPosition(overlay.calculateRotatinMatrix(bottomLeftMarker,deltaRadian));
		topLeftMarker.setPosition(overlay.calculateRotatinMatrix(topLeftMarker,deltaRadian));
		topRightMarker.setPosition(overlay.calculateRotatinMatrix(topRightMarker,deltaRadian));
		bottomRightMarker.setPosition(overlay.calculateRotatinMatrix(bottomRightMarker,deltaRadian));
		
		bottomLeftMarker.setVisible(true);
		topLeftMarker.setVisible(true);
		topRightMarker.setVisible(true);
		bottomRightMarker.setVisible(true);
	});
	
	//Resize markers "dragEnd" events
	/*google.maps.event.addListener(bottomLeftMarker, 'dragend', function () {

		bottomLeftBound = bottomLeftMarker.getPositon;
		bottomRightBound = new google.maps.LatLng({lat: bottomRightBound.lat(), lng: bottomLeftBound.lng()});
		topLeftBound = new google.maps.LatLng({lat: bottomLeftBound.lat(), lng: topLeftBound.lng()});
	});
	
	google.maps.event.addListener(topLeftMarker, 'dragend', function () {

		topLeftBound = bottomLeftMarker.getPositon;
		topRightBound = new google.maps.LatLng({lat: topRightBound.lat(), lng: topLeftBound.lng()});
		bottomLeftBound = new google.maps.LatLng({lat: topLeftBound.lat() , lng: bottomLeftBound.lng()});
		
	});
	
	google.maps.event.addListener(topRightMarker, 'dragend', function () {

		topRightBound = bottomLeftMarker.getPositon;
		topLeftBound = new google.maps.LatLng({lat: topLeftBound.lat(), lng: topRightBound.lng()});
		bottomRightBound =	new google.maps.LatLng({lat: topRightBound.lat(), lng: bottomRightBound.lng()});
	});
	
	google.maps.event.addListener(bottomRightMarker, 'dragend', function () {

		bottomRightBound = bottomLeftMarker.getPositon;
		bottomLeftBound = new google.maps.LatLng({lat: bottomLeftBound.lat(), lng: bottomRightBound.lng()});
		topRightBound = new google.maps.LatLng({lat: bottomRightBound.lat(), lng: topRightBound.lng()});
	});	*/
	
	//dragMarker events
	google.maps.event.addListener(dragMarker, 'dragstart', function(){
		dragAcc = centerPoint;
		bottomLeftMarker.setVisible(false);
		topLeftMarker.setVisible(false);
		topRightMarker.setVisible(false);
		bottomRightMarker.setVisible(false);
		rotateMarker.setVisible(false);
		
	});
	
	google.maps.event.addListener(dragMarker, 'drag', function(){
		//Distance dragged between 'drag' events
		var deltaDistance = {lat: dragMarker.position.lat() - dragAcc.lat, lng:dragMarker.position.lng() - dragAcc.lng};
		//var deltaPixel = overlay.getProjection().fromLatLngToContainerPixel(new google.maps.LatLng(deltaDistance.lat, deltaDistance.lng));
		
		var newSWBound = new google.maps.LatLng(overlay.bounds_.getSouthWest().lat() + deltaDistance.lat, overlay.bounds_.getSouthWest().lng() + deltaDistance.lng);
		var newNEBound = new google.maps.LatLng(overlay.bounds_.getNorthEast().lat() + deltaDistance.lat, overlay.bounds_.getNorthEast().lng() + deltaDistance.lng);
		
		overlay.bounds_ = new google.maps.LatLngBounds(newSWBound, newNEBound);
		overlay.draw();
		
		//document.getElementById("image").style.transform = 'translate(' + deltaPixel.x  + 'px,' + deltaPixel.y + 'px)';
		dragAcc = {lat: dragAcc.lat + deltaDistance.lat, lng: dragAcc.lng + deltaDistance.lng};
		//dragMarker.setVisible(false);
	});
	
	google.maps.event.addListener(dragMarker, 'dragend', function(){
		//Total distance dragged during drag
		var totalDistance = {lat: dragMarker.position.lat() - centerPoint.lat, lng:dragMarker.position.lng() - centerPoint.lng};
		
		bottomLeftMarker.setPosition({lat:bottomLeftMarker.position.lat() + totalDistance.lat, lng:bottomLeftMarker.position.lng() + totalDistance.lng});
		bottomRightMarker.setPosition({lat:bottomRightMarker.position.lat() + totalDistance.lat, lng:bottomRightMarker.position.lng() + totalDistance.lng});
		topLeftMarker.setPosition({lat:topLeftMarker.position.lat() + totalDistance.lat, lng:topLeftMarker.position.lng() + totalDistance.lng});
		topRightMarker.setPosition({lat:topRightMarker.position.lat() + totalDistance.lat, lng:topRightMarker.position.lng() + totalDistance.lng});
		rotateMarker.setPosition({lat:rotateMarker.position.lat() + totalDistance.lat, lng:rotateMarker.position.lng() + totalDistance.lng});
		centerPoint = overlay.calculateCenter();
		
		bottomLeftMarker.setVisible(true);
		topLeftMarker.setVisible(true);
		topRightMarker.setVisible(true);
		bottomRightMarker.setVisible(true);
		rotateMarker.setVisible(true);
		//dragMarker.setVisible(true);
	})
};


DebugOverlay.prototype.calculateCenter = function()
{
	//calculates the center point between top left and bottom right
	latLng1 = topLeftMarker.getPosition();
	latLng2 = bottomRightMarker.getPosition();
	
	var newLat = (latLng1.lat() + latLng2.lat())/2;
	var newLng = (latLng1.lng() + latLng2.lng())/2;

	return {lat: newLat, lng: newLng};
}

DebugOverlay.prototype.calculateAngle = function(currentLatLng)
{
	//calculates the angle between the initial vector and current position of rotate marker
	var currentVector = {x: currentLatLng.lat() - centerPoint.lat , y: currentLatLng.lng() - centerPoint.lng};
	
	var angle = {degree: 0, radian: 0};
	
	angle.radian = (Math.atan2(currentVector.y, currentVector.x) - Math.atan2(initialVector.y, initialVector.x));
	angle.degree = angle.radian * 180 / Math.PI;
	return angle;
}

DebugOverlay.prototype.calculateRotatinMatrix = function(currentMarker, radian)
{
	var overlayProjection = this.getProjection();
    var divCurrentPoint = overlayProjection.fromLatLngToDivPixel(currentMarker.getPosition());
    
    var centerPointLatLng = new google.maps.LatLng(centerPoint)
    var divCenterPoint = overlayProjection.fromLatLngToDivPixel(centerPointLatLng);
    
	divCurrentPoint.x = divCurrentPoint.x - divCenterPoint.x;
	divCurrentPoint.y = divCurrentPoint.y - divCenterPoint.y;
	
	var newPosition = {x: 0, y: 0};
	
	newPosition.x = (divCurrentPoint.x * Math.cos(radian)) - (divCurrentPoint.y * Math.sin(radian));
	newPosition.y = (divCurrentPoint.x * Math.sin(radian)) + (divCurrentPoint.y * Math.cos(radian));
	
	newPosition.x = newPosition.x + divCenterPoint.x;
	newPosition.y = newPosition.y + divCenterPoint.y;
	
	newPosition = overlayProjection.fromDivPixelToLatLng(newPosition);
	
	return newPosition;
}

DebugOverlay.prototype.dragInitialVector = function()
{
	//TODO drag initial vector with the center
	//TODO not tested yet
	centerPoint = this.calculateCenter();
	initialVector = {x: initialVector.x + centerPoint.lat , y: initialVector.y + centerPoint.lng};
}

DebugOverlay.prototype.onAdd = function()
{	
	var div = document.createElement('div');
	div.style.borderStyle = 'none';
	div.style.borderWidth = '0px';
	div.style.position = 'absolute';
	
	var divOverlay = document.createElement('div');
	divOverlay.setAttribute("id", "divOverlay");
	divOverlay.style.width = '100%';
	divOverlay.style.height = '100%';
	divOverlay.style.position = 'absolute';
	//divOverlay.style.border = "solid 3px";
	div.appendChild(divOverlay);
	
	var img = document.createElement('img');
	img.src = this.image_;
	img.setAttribute("id", "image");
	img.style.width = '100%';
	img.style.height = '100%';
	img.style.opacity = '0.5';
	img.style.position = 'absolute';
	divOverlay.appendChild(img);
	
	this.div_ = div;
	var panes = this.getPanes();
	panes.overlayLayer.appendChild(div);
	
};

DebugOverlay.prototype.draw = function () 
{
	var overlayProjection = this.getProjection();
	var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
	var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
	var div = this.div_;
	div.style.left = sw.x + 'px';
	div.style.top = ne.y + 'px';
	div.style.width = (ne.x - sw.x) + 'px';
	div.style.height = (sw.y - ne.y) + 'px';
};

DebugOverlay.prototype.drawInnerDiv = function () {
	var overlayProjection = this.getProjection();
	var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
	var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
	
	var div = this.div_;
	div.style.left = sw.x + 'px';
	div.style.top = ne.y + 'px';
	div.style.width = (ne.x - sw.x) + 'px';
	div.style.height = (sw.y - ne.y) + 'px';
};


function DebugOverlay(bounds, image, map) {

	this.bounds_ = bounds;
	this.image_ = image;
	this.map_ = map;
	this.div_ = null;
	this.setMap(map);
};

initialize();