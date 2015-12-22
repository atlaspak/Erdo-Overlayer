var overlay;

var focusLocation = new google.maps.LatLng(39.869967, 32.744971);
var srcImage = 'http://www.rhetoric-culture.com/blog/wp-content/uploads/2010/04/mall_directory_bsm.jpg';

DebugOverlay.prototype = new google.maps.OverlayView();


var bottomLeftPoint = new google.maps.LatLng((focusLocation.lat() - 0.001), (focusLocation.lng() - 0.001));
var topRightPoint = new google.maps.LatLng((focusLocation.lat() + 0.001), (focusLocation.lng() + 0.001));
var bottomRightPoint = new google.maps.LatLng((focusLocation.lat() - 0.001), (focusLocation.lng() + 0.001));
var topLeftPoint = new google.maps.LatLng((focusLocation.lat() + 0.001), (focusLocation.lng() - 0.001));
var rotateMarkerPoint = {lat: bottomRightPoint.lat(), lng: ((bottomRightPoint.lng() + bottomLeftPoint.lng())/2)};
var centerPoint;


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
			draggable: true,
			icon : 'icons/rotate.png'
		});
	
	//Resize markers "drag" events
	google.maps.event.addListener(bottomLeftMarker, 'drag', function () {

		bottomLeftPoint = bottomLeftMarker.getPosition();
	});
	
	google.maps.event.addListener(topLeftMarker, 'drag', function () {

		topLeftPoint = topLeftMarker.getPosition();
		
	});
	
	google.maps.event.addListener(topRightMarker, 'drag', function () {

		topRightPoint = topRightMarker.getPosition();
	});
	
	google.maps.event.addListener(bottomRightMarker, 'drag', function () {

		bottomRightPoint = bottomRightMarker.getPosition();
	});	
	
	google.maps.event.addListener(rotateMarker, 'dragstart', function () {
		
		rotateMarkerPoint = rotateMarker.getPosition();
		centerPoint = overlay.calculateCenter(topLeftMarker.getPosition(), bottomRightMarker.getPosition());
	});
	
	google.maps.event.addListener(rotateMarker, 'drag', function() {
		
		overlay.calculateAngle(rotateMarkerPoint, rotateMarker.getPosition());
		 
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
};


DebugOverlay.prototype.calculateCenter = function(latLng1, latLng2)
{
	var newLat = (latLng1.lat() + latLng2.lat())/2;
	var newLng = (latLng1.lng() + latLng2.lng())/2;
	//console.log(newLat + " " + newLng);
	return {lat: newLat, lng: newLng};
}

DebugOverlay.prototype.calculateAngle = function(latLng1, latLng2)
{
	var vector1 = {x: centerPoint.lat - latLng1.lat() , y: centerPoint.lng - latLng1.lng()};
	var vector2 = {x: centerPoint.lat - latLng2.lat() , y: centerPoint.lng - latLng2.lng()};
	
	var angleDeg = (Math.atan2(vector2.y, vector2.x) - Math.atan2(vector1.y, vector1.x))* 180 / Math.PI;
	console.log(angleDeg);
	return angleDeg;
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
	
	/*var img = document.createElement('img');
	img.src = this.image_;
	img.style.width = '100%';
	img.style.height = '100%';
	img.style.opacity = '0.5';
	img.style.position = 'absolute';
	divOverlay.appendChild(img);*/
	
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