// Calls the database synchronization endpoint
function callSync() {
    fetch("/api/sync")
}

// Filters have been changed, handle the current filter setting
function filterChanged() {
  // Fetch filters
  const mediaType = document.getElementById('imageVideoSelect').value
  const time = document.getElementById('timeSelect').value
  const heightOperator = document.getElementById('heightOperator').value
  const height = document.getElementById('heightSelect').value
  const distanceOperator = document.getElementById('distanceOperator').value
  const distance = document.getElementById('distanceSelect').value
  // Milliseconds in each time period, for ez lookup
  const time_lookup = {'day': 86400000, 'week': 604800000, 'month': 2629800000, 'year': 31557600000}
  const now = new Date()
   // Filter all videos
  loop: for (const marker of markers.markers) {
    marker.display(true)
    // Check media type
    if (mediaType == 'images') {
      marker.display(false)
      continue loop
    }
    // Check time
    if (time != 'always' && now.getTime() - (new Date(marker.point.video.date_shot)) > time_lookup[time]) {
      marker.display(false)
      continue loop
    }
    // Check height
    if (heightOperator == 'ge' && marker.point.height < height) {
      marker.display(false)
      continue loop
    }
    if (heightOperator == 'le' && marker.point.height > height) {
      marker.display(false)
      continue loop
    }
    // Check distance
    if (distanceOperator == 'ge' && marker.point.distance < distance) {
      marker.display(false)
      continue loop
    }
    if (distanceOperator == 'le' && marker.point.distance > distance) {
      marker.display(false)
      continue loop
    }
  }
   // Filter all images
  loop: for (const marker of imageMarkers.markers) {
    marker.display(true)
    // Check media type
    if (mediaType == 'videos') {
      marker.display(false)
      continue loop
    }
    // Check time
    if (time != 'always' && now.getTime() - (new Date(marker.image.shot_at)) > time_lookup[time]) {
      marker.display(false)
      continue loop
    }
    // Check height
    if (heightOperator == 'ge' && marker.image.gps_altitude < height) {
      marker.display(false)
      continue loop
    }
    if (heightOperator == 'le' && marker.image.gps_altitude > height) {
      marker.display(false)
      continue loop
    }
  }
}

// Closes the popup page
function closePopup() {
  let el = document.getElementById("frame")
  if (el != null) el.remove()
  document.getElementById("overlay").style.display = "none"
}

// Toggles between satellite and map
function toggleSat() {
  isSat = !isSat
  if (isSat) {
    document.getElementById('sattoggle').innerHTML = 'Toggle Map'
    map.removeLayer(osm)
    map.addLayer(sat)
  } else {
    document.getElementById('sattoggle').innerHTML = 'Toggle Satellite'
    map.removeLayer(sat)
    map.addLayer(osm)
  }
}

// Randomizes the marker colors
function randomizeColors() {
  for (const video of fetched_videos) {
    let filter = `brightness(${Math.random() * 0.75 + 1})hue-rotate(${Math.random()}turn)saturate(4)`
    for (const marker of video.markers) {
      marker.icon.imageDiv.children[0].style.filter = filter
    }
  }
}

// What happens when a mark is clicked
function markerClicked(mark) {
  closePopup()
  let overlay = document.getElementById('overlay')
  let frame = document.createElement('iframe')
  frame.src = "point.html?point=" + mark.object.point.id
  frame.style.width = "100%"
  frame.style.height = "100%"
  frame.id = "frame"
  overlay.appendChild(frame)
  overlay.style.display = "block"
}

// What happens when an image marker is clicked
function imageMarkerClicked(mark) {
  closePopup()
  let overlay = document.getElementById('overlay')
  let frame = document.createElement('iframe')
  frame.src = "image.html?image=" + mark.object.image.id
  frame.style.width = "100%"
  frame.style.height = "100%"
  frame.id = "frame"
  overlay.appendChild(frame)
  overlay.style.display = "block"
}

// Calculate position
function calculateMarkerPosition(p) {
  // Determine position to draw
  let x = null; let y = null;
  // If position is already taken
  if (positions[p.gps_longitude] != undefined && positions[p.gps_longitude][p.gps_lattitude] != undefined) {
    // Find a position in one of 8 positions around it, with manhatten distances of [position_step]
    let fits = false
    outer:
    for (let x_offset = -1; x_offset <= 1; x_offset++) {
      for (let y_offset = -1; y_offset <= 1; y_offset++) {
        let new_x = p.gps_longitude + x_offset * position_step
        let new_y = p.gps_lattitude + y_offset * position_step
        if (positions[new_x] == undefined || positions[new_x][new_y] == undefined) {
          x = new_x
          y = new_y
          if (positions[x] == undefined) positions[x] = {}
          positions[x][y] = true
          fits = true
          break outer
        }
      }
    }
    // If no free position was found around it just place it randomly in the same vicinity
    if (!fits) {
      x = p.gps_longitude - position_step + (2 * Math.random() * position_step)
      y = p.gps_lattitude - position_step + (2 * Math.random() * position_step)
    }
  } else {
    // If position was free, just place it
    if (positions[p.gps_longitude] == undefined) positions[p.gps_longitude] = {}
    positions[p.gps_longitude][p.gps_lattitude] = true
    x = p.gps_longitude
    y = p.gps_lattitude
  }
  return {x, y}
}

// Handle fetched datapoints
function handleDatapoints(video, points) {
  video.points = points
  video.markers = []
  // Set the color for the points of this video
  let filter = `brightness(${Math.random() * 0.75 + 1})hue-rotate(${Math.random()}turn)saturate(4)`
  let p_prev = null
  // Go over all points
	for (const p of points) {
    // If same coordinates as previous, dont draw it to avoid clutter
    if (p_prev != null && p_prev.gps_longitude == p.gps_longitude && p_prev.gps_lattitude == p.gps_lattitude) continue
    const location = calculateMarkerPosition(p)
    // Create the marker
		marker = new OpenLayers.Marker(new OpenLayers.LonLat(location.x, location.y).transform(fromProjection, toProjection))
    p.video = video
    marker.point = p
    video.markers.push(marker)
    // Register click event
		marker.events.register("click", marker, markerClicked)
    // Add the marker with smaller scale
		markers.addMarker(marker)
    marker.inflate(0.85)
    // Color
    marker.icon.imageDiv.children[0].style.filter = filter
    map.setCenter(marker.lonlat, 15)
    p_prev = p
	}
}

// Handle images
function handleImages(images) {
  fetchedImages = images
  // Set icon stuff for image icon
  var size = new OpenLayers.Size(20, 20)
  var offset = new OpenLayers.Pixel(-(size.w / 2), -(size.h / 2))
  var icon = new OpenLayers.Icon(OpenLayers.Util.getImageLocation("imageMarker.png"), size, offset)
  let prev_image = null
  // Go over all images
  for (const image of images) {
    // If previous image markered within a meter, skip this one
    if (prev_image != null
      && Math.abs(prev_image.gps_longitude - image.gps_longitude) < 0.00001
      && Math.abs(prev_image.gps_latitude - image.gps_latitude) < 0.00001) {
      continue
    }
    // Set color
    let filter = `brightness(${Math.random() * 0.75 + 1})hue-rotate(${Math.random()}turn)saturate(4)`
    // Create marker
    marker = new OpenLayers.Marker(
      new OpenLayers.LonLat(image.gps_longitude, image.gps_latitude).transform(fromProjection, toProjection),
      icon.clone()
    )
    image.marker = marker
    marker.image = image
    marker.events.register("click", marker, imageMarkerClicked)
    imageMarkers.addMarker(marker)
    marker.inflate(0.85)
    // Color
    marker.icon.imageDiv.children[0].style.filter = filter
    map.setCenter(marker.lonlat, 15)
    prev_image = image
  }
  // If there were no videos or images, zoom map out
  if (fetched_videos.length == 0 && images.length == 0) map.zoomToMaxExtent();
}

// Fetch video datapoints
async function fetchVideoDatapoints(video) {
  return await new Promise((resolve) => {
    fetch("/api/videos/" + video.id + "/datapoints")
      .then(function (response) {
        return response.json()
      })
      .then(function (info) {
        return resolve(info)
      })
  })
}

// Fetch videos
async function fetchVideos() {
  return await new Promise((resolve) => {
    fetch("/api/videos")
      .then(function (response) {
        return response.json()
      })
      .then(function (info) {
        return resolve(info)
      })
  })
}

// Fetch images
async function fetchImages() {
  return await new Promise((resolve) => {
    fetch("/api/images")
      .then(function (response) {
        return response.json()
      })
      .then(function (info) {
        return resolve(info)
      })
  })
}

// Global variables
let fetched_videos = null
let fetchedImages = null
let positions = {}
const position_step = 0.000033
var fromProjection = new OpenLayers.Projection("EPSG:4326");
var toProjection   = new OpenLayers.Projection("EPSG:900913");
let isSat = false

// Set up map
let map = new OpenLayers.Map("demoMap");
// Set up layers
let sat = new OpenLayers.Layer.XYZ("Satellite", ["https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}"],
  {
    attribution: "Powered by Esri. " +
      "Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community",
    numZoomLevels: 20,
    sphericalMercator: true
  })
let osm = new OpenLayers.Layer.OSM()
map.addLayer(osm);
// Add video marker layer
var markers = new OpenLayers.Layer.Markers( "Markers" );
map.addLayer(markers);
// Add image marker layer
var imageMarkers = new OpenLayers.Layer.Markers("Markers")
map.addLayer(imageMarkers)

// Fetch all videos
fetchVideos().then(function (videos) {
  // Store them
  fetched_videos = videos
  // For every video
  videos.forEach((video) => {
    // Fetch the data points and handle them
    fetchVideoDatapoints(video).then((points) => handleDatapoints(video, points))
  })
  // If there were no videos, zoom map out
  if (videos.length == 0) map.zoomToMaxExtent();
})

// Fetch all images
fetchImages().then(handleImages)
