# DroneMap
A web-based application to explore your DJI drone footage on a map. Point the server at the directory that contains your footage, press 'Synchronize Database' and the server will handle the rest.

## Screenshots

Plain map view of data points
![Plain map view](readme_assets/map.png)

Satellite view of data points
![Satellite view](readme_assets/sat.png)

Inspecting a single data point
![Inspecting a datapoint](readme_assets/point.png)

Watching a video after clicking the thumbnail
![Watching a video](readme_assets/video.png)

Inspecting an image
![Inspecting an image](readme_assets/image.png)

Example use (a bit outdated but the gist is the same)
![Example use](readme_assets/example.gif)

## Current features

- Directory scanning
- Automatic analysis and parsing of scanned files
- Plotting of footage data points / images onto OSM or Satellite view
- Filtering plotted footage based on attributes
- Inspecting data point / image information including camera settings
- Opening and watching source footage at exact point of the data point in the footage

## Potential future features (high to low priority)

- Improved layout on data point / image inspection pages
- Improve marker visibility through coloring and positioning (mainly in high density areas)
- Transcoded streaming, raw footage streaming is less than ideal for non-network streaming
- Authentication for exposing service to internet
- File / footage management page

## Running (development)

1. clone this repo
2. Set up database
3. Fill out .env and generate key with `node ace generate:key`
4. `npm run dev`
