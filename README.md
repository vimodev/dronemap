## Warning
This repo is no longer maintained in favor of [vimodev/drone-atlas](https://github.com/vimodev/drone-atlas). That application is the same in functionality but much better in usability since it does not rely on a Node process in a Docker container but instead on Java. This makes it easier to deploy and faster to run.

# DroneMap
A web-based application to explore your DJI drone footage on a map. Point the server at the directory that contains your footage, press 'Synchronize Database' and the server will handle the rest.

(Developed and tested with DJI Mini 2)

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

Example use
![Example use](readme_assets/example.gif)

## Current features

- Directory scanning
- Automatic analysis and parsing of scanned files
- Plotting of footage data points / images onto OSM or Satellite view
- Filtering plotted footage based on attributes
- Inspecting data point / image information including camera settings
- Opening and watching source footage at exact point of the data point in the footage

## Potential future features

- Improved layout on data point / image inspection pages
- Improve marker visibility through coloring and positioning (mainly in high density areas)
- Transcoded streaming, raw footage streaming is less than ideal for non-network streaming
- Authentication for exposing service to internet
- File / footage management page

## Known issues (might or might not be working on these)

- Thumbnail retrieval might be broken in docker deployment.
- Parsing of particular videos might result in a fatal error (unknown what causes it atm)

## Running with Docker

1. Copy and adapt `docker-compose.yml`
2. Run `docker-compose up -d`
3. If the `dronemap` container's logs mention `ECONNREFUSED`, 
please execute `node ace migration:run --force` manually in the container after the database container has fully started.

## Running (development)

1. `apt update && apt install ffmpeg`
2. `git clone git@github.com:vimodev/dronemap.git`
3. Set up database
4. Fill out .env and generate key with `node ace generate:key`
5. `npm run dev`
