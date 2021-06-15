import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Video from 'App/Models/Video'
import fs from 'fs'

export default class VideosController {

  public async stream({ request, response, params}: HttpContextContract) {
    let videoId = params.videoId
    const range = request.header("Range")
    if (range == undefined) {
      response.status(400).send("Requires range header")
      return
    }

    const video = await Video.find(videoId)
    if (video == null) {
      response.status(404).send("File not found")
      return
    }
    await video!.load('file')
    const file = video!.file
    const videoSize = fs.statSync(process.env.FILE_ROOT + file.filePath).size

    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range!.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    response.header("Content-Range", `bytes ${start}-${end}/${videoSize}`)
    response.header("Accept-Ranges", `bytes`)
    response.header("Content-Length", contentLength)
    response.header("Content-Type", "video/mp4")
    response.status(206)

    const vidStream = fs.createReadStream(process.env.FILE_ROOT + file.filePath, {start, end})

    response.stream(vidStream)

  }

}
