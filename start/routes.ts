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
import Image from 'App/Models/Image'

// Backend api stuff
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

  Route.group(() => {
    Route.group(() => {
      Route.get('', async ({params, response}: HttpContextContract) => {
        const img = await Image.find(params.imageId)
        if (img == null) {
          response.status(404)
          return
        }
        await img.load('file')
        return img
      })
      Route.get('/show', 'ImagesController.show')
    }).prefix('/:imageId')
    Route.get('', async () => await Image.query().orderBy('shot_at', 'asc'))
  }).prefix('/images')

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
      Route.get('', async ({params}: HttpContextContract) => {
        let p = await VideoDataPoint.find(params.datapointId)
        if (p == null) return
        await p.load('video')
        await p.video.load('file')
        return p
      })
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

// Static frontend stuff
Route.get('/', async ({response}: HttpContextContract) => {response.redirect().toPath('/page/index.html')})
Route.get('/page', async ({response}: HttpContextContract) => {response.redirect().toPath('/page/index.html')})
Route.get('/page/*', async (http: HttpContextContract) => {
    http.response.stream(fs.createReadStream(`frontend${path.sep}${http.params['*'].join(path.sep)}`))
  })
