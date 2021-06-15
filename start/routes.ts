/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import Video from 'App/Models/Video'
import FileService from 'App/Services/FileService'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import File from 'App/Models/File'
import VideoDataPoint from 'App/Models/VideoDataPoint'
import fs from 'fs'
import path from 'path'
import MediaService from 'App/Services/MediaService'

Route.group(() => {

  // Start syncing
  Route.get('/sync', async () => await FileService.synchronizeFileDatabase())

  // Video stuff
  Route.group(() => {
    Route.group(() => {
      // Get video object
      Route.get('', async ({params}: HttpContextContract) => await Video.find(params.videoId))
      // Get video stream
      Route.get('/stream', 'VideosController.stream')
      // Get data points
      Route.get('/datapoints', async ({params}: HttpContextContract) => await VideoDataPoint.query().where('videoId', params.videoId).orderBy('sequenceNumber', 'asc'))
    }).prefix('/:videoId')
    Route.get('', async () => await Video.all())
  }).prefix('/videos')

  // File stuff
  Route.group(() => {
    Route.group(() => {
      // Get file object
      Route.get('', async ({params}: HttpContextContract) => await File.find(params.fileId))
    }).prefix('/:fileId')
    Route.get('', async () => await File.all())
  }).prefix('/files')

  // Datapoints
  Route.group(() => {
    Route.group(() => {
      // Get datapoint object
      Route.get('', async ({params}: HttpContextContract) => await VideoDataPoint.find(params.datapointId))
      Route.get('/thumbnail', async(http: HttpContextContract) => await MediaService.thumbnail(await VideoDataPoint.findOrFail(http.params.datapointId), http))
    }).prefix('/:datapointId')
    Route.get('', async () => await VideoDataPoint.all())
  }).prefix('/datapoints')

}).prefix('/api')

Route.group(() => {
  Route.get('/home', async () => {
    return fs.readFileSync(`frontend${path.sep}index.html`).toString()
  })
}).prefix('/page')
