import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Video from 'App/Models/Video'
import fs from 'fs'

/**
 * Video-specific functionality
 */
export default class VideosController {

  /**
   * Given a video ID supply the requester with
   * a stream to the video in question.
   */
  public async stream({ request, response, params}: HttpContextContract) {
    // Get video id
    let videoId = params.videoId
    // Ensure presence of range header
    const range = request.header("Range")
    if (range == undefined) {
      response.status(400).send("Requires range header")
      return
    }

    // Attempt to find the video
    const video = await Video.find(videoId)
    if (video == null) {
      response.status(404).send("File not found")
      return
    }

    // Fetch the associated file on fs
    await video!.load('file')
    const file = video!.file
    // Check the size
    const videoSize = fs.statSync(process.env.FILE_ROOT + file.filePath).size

    // Set up chunks for streaming
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range!.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    response.header("Content-Range", `bytes ${start}-${end}/${videoSize}`)
    response.header("Accept-Ranges", `bytes`)
    response.header("Content-Length", contentLength)
    response.header("Content-Type", "video/mp4")
    response.status(206)

    // Open the file
    const vidStream = fs.createReadStream(process.env.FILE_ROOT + file.filePath, {start, end})

    // Stream it
    response.stream(vidStream)

  }

}
