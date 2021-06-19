# DroneMap
A web-based application to explore your DJI drone footage on a map. Point the server at the directory that contains your footage, press 'Synchronize Database' and the server will handle the rest.

## Screenshots

Example use
![Example use](readme_assets/example.gif)

Plain map view of data points
![Plain map view](readme_assets/map.png)

Satellite view of data points
![Satellite view](readme_assets/sat.png)

Inspecting a single data point
![Inspecting a datapoint](readme_assets/point.png)

Watching a video after clicking the thumbnail
![Watching a video](readme_assets/video.png)

## Current features

- Directory scanning
- Automatic analysis and parsing of scanned files
- Plotting of footage data points / images onto OSM or Satellite view
- Inspecting data point information including camera settings
- Opening and watching source footage at exact point of the data point in the footage

## Potential future features

- Improved layout on data point inspection page
- Filtering markers on the map based on data point attributes
- Improve marker visibility through coloring and positioning (mainly in high density areas)
- Transcoded streaming, raw footage streaming is less than ideal for non-network streaming
- Authentication for exposing service to internet
- File / footage management page

## Running (development)

1. clone this repo
2. Set up database
3. Fill out .env and generate key with `node ace generate:key`
4. `npm run dev`
