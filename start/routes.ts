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

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.get('/test', async () => {
  await FileService.synchronizeFileDatabase()
})

Route.group(() => {
  Route.group(() => {
    Route.group(() => {
      // Get video object
      Route.get('', async ({params}: HttpContextContract) => await Video.find(params.videoId))
      // Get video stream
      Route.get('/stream', 'VideosController.stream')
    }).prefix('/:videoId')
  }).prefix('/videos')
}).prefix('/api')
