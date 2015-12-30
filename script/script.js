var overlay;

var focusLocation = new google.maps.LatLng(39.869967, 32.744971);
var srcImage = 'images/example.png';

DebugOverlay.prototype = new google.maps.OverlayView();


var centerMarkerPrevPosition = undefined;
var rotationStartRadian = 0,rotationEndRadian = 0;
var totalDragPixel = {lat:0, lng:0};  //Helper variable for centerMarker 'drag'
var initalPosition;  //Initial position of the corner that is dragged

function initialize() {

	var bounds = new google.maps.LatLngBounds(new google.maps.LatLng((focusLocation.lat() - 0.001), (focusLocation.lng() - 0.001)),
											  new google.maps.LatLng((focusLocation.lat() + 0.001), (focusLocation.lng() + 0.001)));

	var mapOptions = {
		zoom : 18,
		center : focusLocation
	};
	
	var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	overlay = new DebugOverlay(bounds, srcImage, map);
	
	bottomLeftMarker = new google.maps.Marker({
			position : new google.maps.LatLng((focusLocation.lat() - 0.001), (focusLocation.lng() - 0.001)),
			map : map,
			draggable : true,
			icon : 'icons/target1.png'
		});
		
	topLeftMarker = new google.maps.Marker({
			position : new google.maps.LatLng((focusLocation.lat() + 0.001), (focusLocation.lng() - 0.001)),
			map : map,
			draggable : true,
			icon : 'icons/target2.png'
		});
		
	topRightMarker = new google.maps.Marker({
			position : new google.maps.LatLng((focusLocation.lat() + 0.001), (focusLocation.lng() + 0.001)),
			map : map,
			draggable : true,
			icon : 'icons/target3.png'
		});
		
	bottomRightMarker = new google.maps.Marker({
			position : new google.maps.LatLng((focusLocation.lat() - 0.001), (focusLocation.lng() + 0.001)),
			map : map,
			draggable : true,
			icon : 'icons/target4.png'
		});
				
	rotateMarker = new google.maps.Marker({
			position : new google.maps.LatLng(bottomRightMarker.getPosition().lat(), 
											  (bottomRightMarker.getPosition().lng() + bottomLeftMarker.getPosition().lng()) / 2),
			map : map,
			draggable : true,
			icon : 'icons/rotate.png'
		});
	
	centerMarker = new google.maps.Marker({
			position : overlay.calculateCenter(),
			map : map,
			draggable : true,
			icon : 'icons/drag.png'
	});
	
	
	//Resize markers "drag" events
	google.maps.event.addListener(bottomLeftMarker, 'drag', function () {

	});
	
	google.maps.event.addListener(topLeftMarker, 'drag', function () {

		
	});
	
	google.maps.event.addListener(topRightMarker, 'dragstart', function(){
		initialPosition = topRightMarker.getPosition();
	});
	
	google.maps.event.addListener(topRightMarker, 'drag', function () {

		/*var dragVector = {lat: topRightMarker.getPosition().lat() - initialPosition.lat(), lng : topRightMarker.getPosition().lng() - initialPosition.lng()};
		
		//bottomRightMarker.setPosition(new google.maps.LatLng(bottomRightMarker.getPosition().lat() + dragVector.lng * Math.tan(-deltaRadian), bottomRightMarker.getPosition().lng() + dragVector.lng));
		//topLeftMarker.setPosition(new google.maps.LatLng(topLeftMarker.getPosition().lat() + dragVector.lat, topLeftMarker.getPosition().lng() + dragVector));
		//topRightPoint = topRightMarker.getPosition();
		
		initialPosition = topRightMarker.getPosition();*/
		
		var dragVector = {lat: topRightMarker.getPosition().lat() - initialPosition.lat(), lng : topRightMarker.getPosition().lng() - initialPosition.lng()};
		var scaleFactor = {lat: 1+ ((topRightMarker.getPosition().lat() / initialPosition.lat())), lng: 1+ ((topRightMarker.getPosition().lng() / initialPosition.lng()))};
		
		/*var bottomLeftProj = projectLatLngtoCenter(bottomLeftMarker.getPosition(), centerPoint);
		var bottomRightProj = projectLatLngtoCenter(bottomRightMarker.getPosition(), centerPoint);
		var topLeftProj = projectLatLngtoCenter(topLeftMarker.getPosition(), centerPoint);
		var topRightProj = projectLatLngtoCenter(topRightMarker.getPosition(), centerPoint);*/
		
		
		initialPosition = topRightMarker.getPosition();

		
	});
	
	google.maps.event.addListener(bottomRightMarker, 'drag', function () {

	});	
	
	
	//rotate marker events
	google.maps.event.addListener(rotateMarker, 'dragstart', function () {
		rotationStartRadian = overlay.calculateAngle();;
			
		bottomLeftMarker.setVisible(false);
		topLeftMarker.setVisible(false);
		topRightMarker.setVisible(false);
		bottomRightMarker.setVisible(false);
	});
	
	google.maps.event.addListener(rotateMarker, 'drag', function() {
		
		var angle = overlay.calculateAngle();
		document.getElementById("image").style.transform = 'rotate(' + -angle.degree  + 'deg)';	
		
	});
	
	google.maps.event.addListener(rotateMarker, 'dragend', function(){
		
		rotationEndRadian = overlay.calculateAngle();
		var totalRotationRadian = rotationEndRadian.radian - rotationStartRadian.radian;
		
		bottomLeftMarker.setPosition(overlay.rotateMarker(bottomLeftMarker,totalRotationRadian));
		topLeftMarker.setPosition(overlay.rotateMarker(topLeftMarker,totalRotationRadian));
		topRightMarker.setPosition(overlay.rotateMarker(topRightMarker,totalRotationRadian));
		bottomRightMarker.setPosition(overlay.rotateMarker(bottomRightMarker,totalRotationRadian));
						
		bottomLeftMarker.setVisible(true);
		topLeftMarker.setVisible(true);
		topRightMarker.setVisible(true);
		bottomRightMarker.setVisible(true);
		
		//Tried to set rotateMarker between bottom markers, NOT WORKING
		//rotateMarker.setPosition(new google.maps.LatLng((bottomRightMarker.getPosition().lat() + bottomLeftMarker.getPosition().lat()) / 2,
		//			(bottomRightMarker.getPosition().lng() + bottomLeftMarker.getPosition().lng()) / 2));
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
	
	//centerMarker events
	google.maps.event.addListener(centerMarker, 'dragstart', function(){
		overlay.map.setOptions({scrollwheel: false});
		
		centerMarkerPrevPosition = centerMarker.getPosition();
		totalDragPixel.x = 0
		totalDragPixel.y = 0;
		
		bottomLeftMarker.setVisible(false);
		topLeftMarker.setVisible(false);
		topRightMarker.setVisible(false);
		bottomRightMarker.setVisible(false);
		rotateMarker.setVisible(false);
		
	});
	
	google.maps.event.addListener(centerMarker, 'drag', function(){
		//Distance dragged between 'drag' events
		var deltaDistance = {   lat: centerMarker.position.lat() - centerMarkerPrevPosition.lat(), 
								lng: centerMarker.position.lng() - centerMarkerPrevPosition.lng()};
		
		//prev and currentCenter is required to find deltaPixel
		var prevCenterToPixel    = overlay.getProjection().fromLatLngToDivPixel(centerMarkerPrevPosition);
		var currentCenterToPixel = overlay.getProjection().fromLatLngToDivPixel(centerMarker.getPosition());
		var deltaPixel = new google.maps.Point( currentCenterToPixel.x - prevCenterToPixel.x,
												currentCenterToPixel.y - prevCenterToPixel.y);
		//New bound points are calculated and set
		var swBoundToPixel = overlay.getProjection().fromLatLngToDivPixel(overlay.bounds_.getSouthWest());
		swBoundToPixel = addPoints(swBoundToPixel, deltaPixel);
		
		var neBoundToPixel = overlay.getProjection().fromLatLngToDivPixel(overlay.bounds_.getNorthEast());
		neBoundToPixel = addPoints(neBoundToPixel, deltaPixel);
			
		overlay.bounds_ = new google.maps.LatLngBounds( overlay.getProjection().fromDivPixelToLatLng(swBoundToPixel),
														overlay.getProjection().fromDivPixelToLatLng(neBoundToPixel));
		overlay.draw();
		
		totalDragPixel = addPoints(totalDragPixel, deltaPixel);
		centerMarkerPrevPosition = centerMarker.getPosition();
	});
	
	google.maps.event.addListener(centerMarker, 'dragend', function(){
		
		var bottomLeftMarkerToPixel  = overlay.getProjection().fromLatLngToDivPixel(bottomLeftMarker.getPosition());
		var bottomRightMarkerToPixel = overlay.getProjection().fromLatLngToDivPixel(bottomRightMarker.getPosition());
		var topLeftMarkerToPixel     = overlay.getProjection().fromLatLngToDivPixel(topLeftMarker.getPosition());
		var topRightMarkerToPixel    = overlay.getProjection().fromLatLngToDivPixel(topRightMarker.getPosition());
		var rotateMarkerToPixel      = overlay.getProjection().fromLatLngToDivPixel(rotateMarker.getPosition());

		bottomLeftMarkerToPixel  = addPoints(bottomLeftMarkerToPixel, totalDragPixel);
		bottomRightMarkerToPixel = addPoints(bottomRightMarkerToPixel, totalDragPixel);
		topLeftMarkerToPixel     = addPoints(topLeftMarkerToPixel, totalDragPixel);
		topRightMarkerToPixel    = addPoints(topRightMarkerToPixel, totalDragPixel); 
		rotateMarkerToPixel      = addPoints(rotateMarkerToPixel, totalDragPixel);

		
		bottomLeftMarker.setPosition(overlay.getProjection().fromDivPixelToLatLng(bottomLeftMarkerToPixel));
		bottomRightMarker.setPosition(overlay.getProjection().fromDivPixelToLatLng(bottomRightMarkerToPixel));
		topLeftMarker.setPosition(overlay.getProjection().fromDivPixelToLatLng(topLeftMarkerToPixel));
		topRightMarker.setPosition(overlay.getProjection().fromDivPixelToLatLng(topRightMarkerToPixel));
		rotateMarker.setPosition(overlay.getProjection().fromDivPixelToLatLng(rotateMarkerToPixel));

		
		bottomLeftMarker.setVisible(true);
		topLeftMarker.setVisible(true);
		topRightMarker.setVisible(true);
		bottomRightMarker.setVisible(true);
		rotateMarker.setVisible(true);
		
		overlay.map.setOptions({scrollwheel: true});

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

DebugOverlay.prototype.calculateAngle = function()
{
	//calculates the angle between the initial vector and current position of rotate marker
	var currentVector = {	lat: rotateMarker.getPosition().lat() - centerMarker.getPosition().lat()   , 
							lng: rotateMarker.getPosition().lng() - centerMarker.getPosition().lng() };
	var angle = {degree: 0, radian: 0};
	
	angle.radian = (Math.atan2(currentVector.lat, currentVector.lng) ) + Math.PI /2;
	angle.degree = angle.radian * 180 / Math.PI;
	return angle;
}



DebugOverlay.prototype.rotateMarker = function(marker, radian)
{	
	
	//Rotation is done with div pixels because if not, projection errors occur
	//TODO -radian is a temp fix to rotate properly, find out why it rotates the other way
	var markerDivPoint = this.getProjection().fromLatLngToDivPixel(marker.getPosition());
	var centerDivPoint = this.getProjection().fromLatLngToDivPixel(centerMarker.getPosition());
	var projectedDivPoint = {x: markerDivPoint.x - centerDivPoint.x, y: markerDivPoint.y - centerDivPoint.y};
	var newPosition = {x:0, y:0};
	

	newPosition.x = (projectedDivPoint.x * Math.cos(-radian)) - (projectedDivPoint.y * Math.sin(-radian));
	newPosition.y = (projectedDivPoint.x * Math.sin(-radian)) + (projectedDivPoint.y * Math.cos(-radian));
	
	newPosition.x += centerDivPoint.x;
	newPosition.y += centerDivPoint.y;
	
	return this.getProjection().fromDivPixelToLatLng(newPosition);
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


var addPoints = function(point1, point2)
{
	return new google.maps.Point(point1.x + point2.x , point1.y + point2.y);
}

var subPoints = function(point1, point2)
{
	return new google.maps.Point(point1.x - point2.x , point1.y - point2.y);
}

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