import File from "App/Models/File";
import Video from "App/Models/Video";
import os from 'os'
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import VideoDataPoint from "App/Models/VideoDataPoint";

export default class MediaService {

  public static IMAGE_EXTENSIONS = ['jpg']
  public static VIDEO_EXTENSIONS = ['mp4']

  public static async handleNewFile(file: File) {
    let split = file.filePath.split('.')
    let extension = split[split.length - 1]
    if (MediaService.IMAGE_EXTENSIONS.includes(extension.toLowerCase())) {
      this.handleNewImage(file)
    } else if (MediaService.VIDEO_EXTENSIONS.includes(extension.toLowerCase())) {
      this.handleNewVideo(file)
    }
  }

  public static async handleNewImage(file: File) {

  }

  public static async handleNewVideo(file: File) {
    let video = new Video()
    await video.related('file').associate(file)
  }

  public static async readDataPoints(video: Video) {
    // Make temp directory
    const tmpDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`)
    await video.load('file')
    // Dump subtitle
    let subtitleFile = `${tmpDir}${path.sep}${video.id}.srt`
    await new Promise((resolve) => {
      ffmpeg(process.env.FILE_ROOT + video.file.filePath)
        .output(subtitleFile)
        .on('end', function() {
          resolve(true)
        })
        .run()
    })
    // Open subtitle
    const data = fs.readFileSync(subtitleFile).toString()
    const segments = data.split("\n\n\n")
    // Loop over segments, skip last empty segment
    for (let i = 0; i < segments.length - 1; i++) {
      const point = new VideoDataPoint()
      point.related('video').associate(video)
      const segment = segments[i]
      const lines = segment.split("\n")
      point.sequenceNumber = i + 1

      // start seconds
      let start = lines[1].split(' ')[0].split(':')
      point.startSeconds = 60 * 60 * Number(start[0]) + 60 * Number(start[1]) + Number(start[2].replace(',', '.'))

      let dats = lines[2].split(',')
      point.focalLength = Number(dats[0].split('/')[1].trim())
      point.shutterSpeed = Number(dats[1].trim().split(' ')[1])
      point.iso = Number(dats[2].trim().split(' ')[1])
      point.ev = Number(dats[3].trim().split(' ')[1])


    }
  }

}
