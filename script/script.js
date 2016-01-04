	var overlay;

var focusLocation = new google.maps.LatLng(39.869967, 32.744971);
var srcImage = 'images/example.png';

DebugOverlay.prototype = new google.maps.OverlayView();

var centerMarkerPrevPosition = undefined;
var rotationStartRadian = {degree:0, radian:0},rotationEndRadian = {degree:0, radian:0};
var totalDragPixel = {lat:0, lng:0};  //Helper variable for centerMarker 'drag'
var markerPrevPosition;  //Previous position of the marker that is dragged for stretch

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
			position : calculateCenter(topRightMarker.getPosition(), bottomLeftMarker.getPosition()),
			map : map,
			draggable : true,
			icon : 'icons/drag.png'
	});
	
	
	//Resize markers "drag" events
	google.maps.event.addListener(bottomLeftMarker, 'dragstart', function(){
		markerPrevPosition = bottomLeftMarker.getPosition();
	});
	
	google.maps.event.addListener(bottomLeftMarker, 'drag', function () {
		var dragVector = subPoints( overlay.getProjection().fromLatLngToDivPixel(bottomLeftMarker.getPosition()), 
									overlay.getProjection().fromLatLngToDivPixel(markerPrevPosition));
		var scaleFactor = {x: 0, y:0};
		
		var bottomLeftDummyPosition  = markerPrevPosition;
		var bottomRightDummyPosition = bottomRightMarker.getPosition();
		var topLeftDummyPosition     = topLeftMarker.getPosition();
		var topRightDummyPosition    = topRightMarker.getPosition();
		var rotateMarkerDummyPosition= rotateMarker.getPosition();
		
		bottomLeftDummyPosition  = overlay.rotate(bottomLeftDummyPosition, -rotationEndRadian.radian).divPixel;
		bottomRightDummyPosition = overlay.rotate(bottomRightDummyPosition, -rotationEndRadian.radian).divPixel; 
		topLeftDummyPosition     = overlay.rotate(topLeftDummyPosition, -rotationEndRadian.radian).divPixel; 
		topRightDummyPosition    = overlay.rotate(topRightDummyPosition, -rotationEndRadian.radian).divPixel;
		
		//rotating dragVector around (0,0) of div instead of centerMarker
		dragVector = overlay.rotate(dragVector, -rotationEndRadian.radian, new google.maps.Point(0,0)).divPixel;
		
		//scaleFactor = (edge + dragVector) / edge
		scaleFactor.x = ((bottomLeftDummyPosition.x - bottomRightDummyPosition.x) + dragVector.x) / 
			  			 (bottomLeftDummyPosition.x - bottomRightDummyPosition.x);
		scaleFactor.y = ((bottomLeftDummyPosition.y - topLeftDummyPosition.y) + dragVector.y) / 
				  		 (bottomLeftDummyPosition.y - topLeftDummyPosition.y); 
		
		//Scaling points with bottomLeft marker as center because it's the pivot point
		bottomRightDummyPosition = scalePoint(bottomRightDummyPosition, scaleFactor, topRightDummyPosition);
		topLeftDummyPosition     = scalePoint(topLeftDummyPosition, scaleFactor, topRightDummyPosition);
		topRightDummyPosition    = scalePoint(topRightDummyPosition, scaleFactor, topRightDummyPosition);
		
		//Scaling bounds with scaleFactor
		var newSwBound = scalePoint(overlay.getProjection().fromLatLngToDivPixel(overlay.bounds_.getSouthWest()), scaleFactor, topRightDummyPosition);																	 
		var newNeBound = scalePoint(overlay.getProjection().fromLatLngToDivPixel(overlay.bounds_.getNorthEast()), scaleFactor, topRightDummyPosition);
		
		bottomLeftDummyPosition  = overlay.rotate(bottomLeftDummyPosition, rotationEndRadian.radian).latLng;
		bottomRightDummyPosition = overlay.rotate(bottomRightDummyPosition, rotationEndRadian.radian).latLng; 
		topLeftDummyPosition     = overlay.rotate(topLeftDummyPosition, rotationEndRadian.radian).latLng; 
		topRightDummyPosition    = overlay.rotate(topRightDummyPosition, rotationEndRadian.radian).latLng;
		
		rotateMarker.setPosition(calculateCenter(bottomLeftDummyPosition, bottomRightDummyPosition));
		topLeftMarker.setPosition(topLeftDummyPosition);
		bottomRightMarker.setPosition(bottomRightDummyPosition);
		centerMarker.setPosition(calculateCenter(topRightMarker.getPosition(), bottomLeftMarker.getPosition()));
		
		
		overlay.bounds_ = new google.maps.LatLngBounds( overlay.getProjection().fromDivPixelToLatLng(newSwBound), 
											overlay.getProjection().fromDivPixelToLatLng(newNeBound));
		overlay.draw();
		
		markerPrevPosition = bottomLeftMarker.getPosition();
		
	});
	
	google.maps.event.addListener(topLeftMarker, 'dragstart', function(){
		markerPrevPosition = topLeftMarker.getPosition();
	});
	
	google.maps.event.addListener(topLeftMarker, 'drag', function () {
		var dragVector = subPoints( overlay.getProjection().fromLatLngToDivPixel(topLeftMarker.getPosition()), 
									overlay.getProjection().fromLatLngToDivPixel(markerPrevPosition));
		var scaleFactor = {x: 0, y:0};
		
		var bottomLeftDummyPosition  = bottomLeftMarker.getPosition();
		var bottomRightDummyPosition = bottomRightMarker.getPosition();
		var topLeftDummyPosition     = markerPrevPosition;
		var topRightDummyPosition    = topRightMarker.getPosition();
		var rotateMarkerDummyPosition= rotateMarker.getPosition();
		
		bottomLeftDummyPosition  = overlay.rotate(bottomLeftDummyPosition, -rotationEndRadian.radian).divPixel;
		bottomRightDummyPosition = overlay.rotate(bottomRightDummyPosition, -rotationEndRadian.radian).divPixel; 
		topLeftDummyPosition     = overlay.rotate(topLeftDummyPosition, -rotationEndRadian.radian).divPixel; 
		topRightDummyPosition    = overlay.rotate(topRightDummyPosition, -rotationEndRadian.radian).divPixel;
		
		//rotating dragVector around (0,0) of div instead of centerMarker
		dragVector = overlay.rotate(dragVector, -rotationEndRadian.radian, new google.maps.Point(0,0)).divPixel;
		
		//scaleFactor = (edge + dragVector) / edge
		scaleFactor.x = ((topLeftDummyPosition.x - topRightDummyPosition.x) + dragVector.x) / 
			  			 (topLeftDummyPosition.x - topRightDummyPosition.x);
		scaleFactor.y = ((topRightDummyPosition.y - bottomRightDummyPosition.y) + dragVector.y) / 
				  		 (topRightDummyPosition.y - bottomRightDummyPosition.y); 
		
		//Scaling points with bottomLeft marker as center because it's the pivot point
		bottomLeftDummyPosition  = scalePoint(bottomLeftDummyPosition, scaleFactor, bottomRightDummyPosition);
		topLeftDummyPosition     = scalePoint(topLeftDummyPosition, scaleFactor, bottomRightDummyPosition);
		topRightDummyPosition    = scalePoint(topRightDummyPosition, scaleFactor, bottomRightDummyPosition);
		
		//Scaling bounds with scaleFactor
		var newSwBound = scalePoint(overlay.getProjection().fromLatLngToDivPixel(overlay.bounds_.getSouthWest()), scaleFactor, bottomRightDummyPosition);																	 
		var newNeBound = scalePoint(overlay.getProjection().fromLatLngToDivPixel(overlay.bounds_.getNorthEast()), scaleFactor, bottomRightDummyPosition);
		
		bottomLeftDummyPosition  = overlay.rotate(bottomLeftDummyPosition, rotationEndRadian.radian).latLng;
		bottomRightDummyPosition = overlay.rotate(bottomRightDummyPosition, rotationEndRadian.radian).latLng; 
		topLeftDummyPosition     = overlay.rotate(topLeftDummyPosition, rotationEndRadian.radian).latLng; 
		topRightDummyPosition    = overlay.rotate(topRightDummyPosition, rotationEndRadian.radian).latLng;
		
		rotateMarker.setPosition(calculateCenter(bottomLeftDummyPosition, bottomRightDummyPosition));
		bottomLeftMarker.setPosition(bottomLeftDummyPosition);
		topRightMarker.setPosition(topRightDummyPosition);
		centerMarker.setPosition(calculateCenter(topRightMarker.getPosition(), bottomLeftMarker.getPosition()));
		
		
		overlay.bounds_ = new google.maps.LatLngBounds( overlay.getProjection().fromDivPixelToLatLng(newSwBound), 
											overlay.getProjection().fromDivPixelToLatLng(newNeBound));
		overlay.draw();
		
		markerPrevPosition = topLeftMarker.getPosition();			
		
	});
	
	google.maps.event.addListener(bottomRightMarker, 'dragstart', function(){
		markerPrevPosition = bottomRightMarker.getPosition();
	});
	
	google.maps.event.addListener(bottomRightMarker, 'drag', function () {
		var dragVector = subPoints( overlay.getProjection().fromLatLngToDivPixel(bottomRightMarker.getPosition()), 
									overlay.getProjection().fromLatLngToDivPixel(markerPrevPosition));
		var scaleFactor = {x: 0, y:0};
		
		var bottomLeftDummyPosition  = bottomLeftMarker.getPosition();
		var bottomRightDummyPosition = markerPrevPosition;
		var topLeftDummyPosition     = topLeftMarker.getPosition();
		var topRightDummyPosition    = topRightMarker.getPosition();
		var rotateMarkerDummyPosition= rotateMarker.getPosition();
		
		bottomLeftDummyPosition  = overlay.rotate(bottomLeftDummyPosition, -rotationEndRadian.radian).divPixel;
		bottomRightDummyPosition = overlay.rotate(bottomRightDummyPosition, -rotationEndRadian.radian).divPixel; 
		topLeftDummyPosition     = overlay.rotate(topLeftDummyPosition, -rotationEndRadian.radian).divPixel; 
		topRightDummyPosition    = overlay.rotate(topRightDummyPosition, -rotationEndRadian.radian).divPixel;
		
		//rotating dragVector around (0,0) of div instead of centerMarker
		dragVector = overlay.rotate(dragVector, -rotationEndRadian.radian, new google.maps.Point(0,0)).divPixel;
		
		//scaleFactor = (edge + dragVector) / edge
		scaleFactor.x = ((bottomRightDummyPosition.x - bottomLeftDummyPosition.x) + dragVector.x) / 
			  			 (bottomRightDummyPosition.x - bottomLeftDummyPosition.x);
		scaleFactor.y = ((bottomRightDummyPosition.y - topRightDummyPosition.y) + dragVector.y) / 
				  		 (bottomRightDummyPosition.y - topRightDummyPosition.y); 
		
		//Scaling points with bottomLeft marker as center because it's the pivot point
		bottomLeftDummyPosition = scalePoint(bottomLeftDummyPosition, scaleFactor, topLeftDummyPosition);
		topLeftDummyPosition    = scalePoint(topLeftDummyPosition, scaleFactor, topLeftDummyPosition);
		topRightDummyPosition   = scalePoint(topRightDummyPosition, scaleFactor, topLeftDummyPosition);
		
		//Scaling bounds with scaleFactor
		var newSwBound = scalePoint(overlay.getProjection().fromLatLngToDivPixel(overlay.bounds_.getSouthWest()), scaleFactor, topLeftDummyPosition);																	 
		var newNeBound = scalePoint(overlay.getProjection().fromLatLngToDivPixel(overlay.bounds_.getNorthEast()), scaleFactor, topLeftDummyPosition);
		
		bottomLeftDummyPosition  = overlay.rotate(bottomLeftDummyPosition, rotationEndRadian.radian).latLng;
		bottomRightDummyPosition = overlay.rotate(bottomRightDummyPosition, rotationEndRadian.radian).latLng; 
		topLeftDummyPosition     = overlay.rotate(topLeftDummyPosition, rotationEndRadian.radian).latLng; 
		topRightDummyPosition    = overlay.rotate(topRightDummyPosition, rotationEndRadian.radian).latLng;
		
		rotateMarker.setPosition(calculateCenter(bottomLeftDummyPosition, bottomRightDummyPosition));
		topRightMarker.setPosition(topRightDummyPosition);
		bottomLeftMarker.setPosition(bottomLeftDummyPosition);
		centerMarker.setPosition(calculateCenter(topRightMarker.getPosition(), bottomLeftMarker.getPosition()));
		
		
		overlay.bounds_ = new google.maps.LatLngBounds( overlay.getProjection().fromDivPixelToLatLng(newSwBound), 
											overlay.getProjection().fromDivPixelToLatLng(newNeBound));
		overlay.draw();
		
		markerPrevPosition = bottomRightMarker.getPosition();
		
	});
	
	google.maps.event.addListener(topRightMarker, 'dragstart', function(){
			markerPrevPosition = topRightMarker.getPosition();
		});

	google.maps.event.addListener(topRightMarker, 'drag', function () {
		/*Streching works as follows: . Rotate markers to their original position and rotate dragVector
		 							  . Translate marker positions as if the marker which is diagonal to dragged marker in the origin
		 							  . Calculate scale factor using edges and dragVector
									  . Scale the distance between markers and origin
									  . Re-rotate markers back to their starting position
									  . Re-translate to original position and convert into LatLng */
			
		var dragVector = subPoints( overlay.getProjection().fromLatLngToDivPixel(topRightMarker.getPosition()), 
									overlay.getProjection().fromLatLngToDivPixel(markerPrevPosition));
		var scaleFactor = {x: 0, y:0};
		
		var bottomLeftDummyPosition  = bottomLeftMarker.getPosition();
		var bottomRightDummyPosition = bottomRightMarker.getPosition();
		var topLeftDummyPosition     = topLeftMarker.getPosition();
		var topRightDummyPosition    = markerPrevPosition;
		var rotateMarkerDummyPosition= rotateMarker.getPosition();
			
		bottomLeftDummyPosition  = overlay.rotate(bottomLeftDummyPosition, -rotationEndRadian.radian).divPixel;
		bottomRightDummyPosition = overlay.rotate(bottomRightDummyPosition, -rotationEndRadian.radian).divPixel; 
		topLeftDummyPosition     = overlay.rotate(topLeftDummyPosition, -rotationEndRadian.radian).divPixel; 
		topRightDummyPosition    = overlay.rotate(topRightDummyPosition, -rotationEndRadian.radian).divPixel;
		
		//rotating dragVector around (0,0) of div instead of centerMarker
		dragVector 				 = overlay.rotate(dragVector, -rotationEndRadian.radian, new google.maps.Point(0,0)).divPixel;
		
		//scaleFactor = (edge + dragVector) / edge
		scaleFactor.x = ( (topRightDummyPosition.x - topLeftDummyPosition.x) + dragVector.x) / 
						  (topRightDummyPosition.x - topLeftDummyPosition.x);
		scaleFactor.y = ( (topRightDummyPosition.y - bottomRightDummyPosition.y) + dragVector.y) / 
		 				  (topRightDummyPosition.y - bottomRightDummyPosition.y); 
		
		//Scaling points with bottomLeft marker as center because it's the pivot point
		bottomRightDummyPosition = scalePoint(bottomRightDummyPosition, scaleFactor, bottomLeftDummyPosition);
		topLeftDummyPosition     = scalePoint(topLeftDummyPosition, scaleFactor, bottomLeftDummyPosition);
		topRightDummyPosition    = scalePoint(topRightDummyPosition, scaleFactor, bottomLeftDummyPosition);

		
		//Scaling bounds with scaleFactor
		var newSwBound = scalePoint(overlay.getProjection().fromLatLngToDivPixel(overlay.bounds_.getSouthWest()), scaleFactor, bottomLeftDummyPosition);
		var newNeBound = scalePoint(overlay.getProjection().fromLatLngToDivPixel(overlay.bounds_.getNorthEast()), scaleFactor, bottomLeftDummyPosition);
		
		bottomLeftDummyPosition  = overlay.rotate(bottomLeftDummyPosition, rotationEndRadian.radian).latLng;
		bottomRightDummyPosition = overlay.rotate(bottomRightDummyPosition, rotationEndRadian.radian).latLng; 
		topLeftDummyPosition     = overlay.rotate(topLeftDummyPosition, rotationEndRadian.radian).latLng; 
		topRightDummyPosition    = overlay.rotate(topRightDummyPosition, rotationEndRadian.radian).latLng;
		
		rotateMarker.setPosition(calculateCenter(bottomLeftDummyPosition, bottomRightDummyPosition));
		bottomRightMarker.setPosition(bottomRightDummyPosition);
		topLeftMarker.setPosition(topLeftDummyPosition);
		centerMarker.setPosition(calculateCenter(topRightMarker.getPosition(), bottomLeftMarker.getPosition()));
		
		
		overlay.bounds_ = new google.maps.LatLngBounds( overlay.getProjection().fromDivPixelToLatLng(newSwBound), 
														overlay.getProjection().fromDivPixelToLatLng(newNeBound));
		overlay.draw();
		
		markerPrevPosition = topRightMarker.getPosition();
	
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

		bottomLeftMarker.setPosition(overlay.rotate(bottomLeftMarker.getPosition(),totalRotationRadian).latLng);
		topLeftMarker.setPosition(overlay.rotate(topLeftMarker.getPosition(),totalRotationRadian).latLng);
		topRightMarker.setPosition(overlay.rotate(topRightMarker.getPosition(),totalRotationRadian).latLng);
		bottomRightMarker.setPosition(overlay.rotate(bottomRightMarker.getPosition(),totalRotationRadian).latLng);
						
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


var calculateCenter = function(pos1, pos2)
{
	//calculates the center point between top left and bottom right
	return new google.maps.LatLng((pos1.lat() + pos2.lat()) / 2 , (pos1.lng() + pos2.lng()) / 2);
}

DebugOverlay.prototype.calculateAngle = function()
{
	var currentVector = {	lat: rotateMarker.getPosition().lat() - centerMarker.getPosition().lat()   , 
							lng: rotateMarker.getPosition().lng() - centerMarker.getPosition().lng() };
	var angle = {degree: 0, radian: 0};
	
	angle.radian = (Math.atan2(currentVector.lat, currentVector.lng) ) + Math.PI /2;
	angle.degree = angle.radian * 180 / Math.PI;
	return angle;
}


//This function rotates a LatLng or a Point with given radian value, returns both rotated LatLng and divPixel
//Rotates around centerMarker if 3rd parameter is undefined, center parameter can be LatLng or divPixel
//TODO Param is a bad variable name, change it to something more suitable
DebugOverlay.prototype.rotate = function(param, radian, center)
{	
	//Rotation is done with div pixels because if not, projection errors occur
	//TODO -radian is a temp fix to rotate properly, find out why it rotates the other way
	var divPoint = undefined; 
	var centerDivPoint = undefined;
	
	if(param instanceof google.maps.Point)
		divPoint = param
	else
		divPoint = this.getProjection().fromLatLngToDivPixel(param);
	
	if(typeof center === "undefined")
		center = centerMarker.getPosition()
	if(center instanceof google.maps.Point)
		centerDivPoint = center;
	else
		centerDivPoint = this.getProjection().fromLatLngToDivPixel(center);
	
	var projectedDivPoint = {x: divPoint.x - centerDivPoint.x, y: divPoint.y - centerDivPoint.y};
	var newPosition = {divPixel:undefined, latLng:undefined};
	var x,y;
	

	x = (projectedDivPoint.x * Math.cos(-radian)) - (projectedDivPoint.y * Math.sin(-radian));
	y = (projectedDivPoint.x * Math.sin(-radian)) + (projectedDivPoint.y * Math.cos(-radian));
	
	newPosition.divPixel = addPoints(new google.maps.Point(x,y), centerDivPoint);
	newPosition.latLng   = this.getProjection().fromDivPixelToLatLng(newPosition.divPixel);
	
	return newPosition;
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

//Scales a point with scaleFactor, if center is given scales the distance between point and centerPoint
var scalePoint = function(point, scaleFactor, center)
{
	if(typeof center === "undefined")
		return new google.maps.Point(point.x * scaleFactor.x, point.y * scaleFactor.y);
	else
		point = subPoints(point, center);
		point = scalePoint(point, scaleFactor);
		return addPoints(point, center);
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