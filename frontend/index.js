function callSync() {
    fetch("/api/sync")
  }

  function closePopup() {
    let el = document.getElementById("frame")
    if (el != null) el.remove()
    document.getElementById("overlay").style.display = "none"
  }

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

  function randomizeColors() {
    for (const video of fetched_videos) {
      let filter = `brightness(${Math.random() * 0.75 + 1})hue-rotate(${Math.random()}turn)saturate(4)`
      for (const marker of video.markers) {
        marker.icon.imageDiv.children[0].style.filter = filter
      }
    }
  }

  let fetched_videos = null

    map = new OpenLayers.Map("demoMap");
    let sat = new OpenLayers.Layer.XYZ(
                "Satellite", [
                    "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}"
                ], {
                    attribution: "Powered by Esri. " +
                        "Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community",
                    numZoomLevels: 20,
                    sphericalMercator: true
                })
    let osm = new OpenLayers.Layer.OSM()
    map.addLayer(osm);
    let isSat = false
	var markers = new OpenLayers.Layer.Markers( "Markers" );
    map.addLayer(markers);
    var imageMarkers = new OpenLayers.Layer.Markers("Markers")
    map.addLayer(imageMarkers)
	var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
    var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection

    // Dictionary of positions
    let positions = {}
    const position_step = 0.000033

//    Fetch videos
	fetch("/api/videos")
		.then(function (response) {
			return response.json()
		})
		.then(function (videos) {
      fetched_videos = videos
      // For each video fetch datapoints
			videos.forEach((video) => {
				fetch("/api/videos/" + video.id + "/datapoints")
					.then(function (res) {
						return res.json()
					})
					.then(function (points) {
            video.points = points
            video.markers = []
            // Set the color for the points of this video
            let filter = `brightness(${Math.random() * 0.75 + 1})hue-rotate(${Math.random()}turn)saturate(4)`
            let p_prev = null
            // Go over all points
						for (const p of points) {
              // If same coordinates as previous, dont draw it to avoid clutter
              if (p_prev != null && p_prev.gps_longitude == p.gps_longitude && p_prev.gps_lattitude == p.gps_lattitude) {
                continue
              }
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
              // Create the marker
							marker = new OpenLayers.Marker(new OpenLayers.LonLat(x, y).transform(fromProjection, toProjection))
              p.video = video
              marker.point = p
              video.markers.push(marker)
              // Register click event
							marker.events.register("click", marker, function(mark) {
                closePopup()
                let overlay = document.getElementById('overlay')
                let frame = document.createElement('iframe')
                frame.src = "point.html?point=" + mark.object.point.id
                frame.style.width = "100%"
                frame.style.height = "100%"
                frame.id = "frame"
                overlay.appendChild(frame)
                overlay.style.display = "block"
							})
              // Add the marker with smaller scale
							markers.addMarker(marker)
              marker.inflate(0.85)
              // Color
              marker.icon.imageDiv.children[0].style.filter = filter
              map.setCenter(marker.lonlat, 15)
              p_prev = p
						}
					})
			})
			if (videos.length == 0) map.zoomToMaxExtent();
		})

    let fetchedImages = []
    fetch('/api/images')
        .then(function (response) {
			return response.json()
		})
		.then(function (images) {
            fetchedImages = images
            var size = new OpenLayers.Size(20, 20)
            var offset = new OpenLayers.Pixel(-(size.w / 2), -(size.h / 2))
            var icon = new OpenLayers.Icon(OpenLayers.Util.getImageLocation("imageMarker.png"), size, offset)
            for (const image of images) {
                let filter = `brightness(${Math.random() * 0.75 + 1})hue-rotate(${Math.random()}turn)saturate(4)`
                marker = new OpenLayers.Marker(new OpenLayers.LonLat(image.gps_longitude, image.gps_latitude).transform(fromProjection, toProjection), icon.clone())
                image.marker = marker
                marker.image = image
                marker.events.register("click", marker, function(mark) {
                    closePopup()
                    let overlay = document.getElementById('overlay')
                    let frame = document.createElement('iframe')
                    frame.src = "image.html?image=" + mark.object.image.id
                    frame.style.width = "100%"
                    frame.style.height = "100%"
                    frame.id = "frame"
                    overlay.appendChild(frame)
                    overlay.style.display = "block"
				})
                imageMarkers.addMarker(marker)
                marker.inflate(0.85)
                // Color
                marker.icon.imageDiv.children[0].style.filter = filter
                map.setCenter(marker.lonlat, 15)
            }
        })
