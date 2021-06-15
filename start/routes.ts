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

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.get('/test', async () => {
  await FileService.synchronizeFileDatabase()
})

Route.group(() => {

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
  }).prefix('/videos')

  // File stuff
  Route.group(() => {
    Route.group(() => {
      // Get file object
      Route.get('', async ({params}: HttpContextContract) => await File.find(params.fileId))
    }).prefix('/:fileId')
  }).prefix('/files')

  // Datapoints
  Route.group(() => {
    Route.group(() => {
      // Get datapoint object
      Route.get('', async ({params}: HttpContextContract) => await VideoDataPoint.find(params.datapointId))
    }).prefix('/:datapointId')
  }).prefix('/datapoints')

}).prefix('/api')
