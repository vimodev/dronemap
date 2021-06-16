/*
|--------------------------------------------------------------------------
| AdonisJs Server
|--------------------------------------------------------------------------
|
| The contents in this file is meant to bootstrap the AdonisJs application
| and start the HTTP server to accept incoming connections. You must avoid
| making this file dirty and instead make use of `lifecycle hooks` provided
| by AdonisJs service providers for custom code.
|
*/

import 'reflect-metadata'
import sourceMapSupport from 'source-map-support'
import { Ignitor } from '@adonisjs/core/build/standalone'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'

sourceMapSupport.install({ handleUncaughtExceptions: false })

ffmpeg.setFfmpegPath('ffmpeg' + path.sep + 'ffmpeg.exe')
ffmpeg.setFfprobePath('ffmpeg' + path.sep + 'ffprobe.exe')

new Ignitor(__dirname)
  .httpServer()
  .start()
