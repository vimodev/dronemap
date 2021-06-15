import File from "App/Models/File";
import Video from "App/Models/Video";
import os from 'os'
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'

export default class MediaService {

  public static IMAGE_EXTENSIONS = ['jpg']
  public static VIDEO_EXTENSIONS = ['mp4']

  public static async handleNewFile(file: File) {
    let split = file.filePath.split('.')
    let extension = split[split.length - 1]
    if (MediaService.IMAGE_EXTENSIONS.includes(extension.toLowerCase())) {
      await this.handleNewImage(file)
    } else if (MediaService.VIDEO_EXTENSIONS.includes(extension.toLowerCase())) {
      await this.handleNewVideo(file)
    }
  }

  public static async handleNewImage(file: File) {

  }

  public static async handleNewVideo(file: File) {
    console.log("Handling " + file.filePath)
    let video = new Video()
    await video.related('file').associate(file)
    await video.save()
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
      const segment = segments[i]
      const lines = segment.split("\n")
      let start = lines[1].split(' ')[0].split(':')
      let dats = lines[2].split(',')
      const point = await video.related('dataPoints').create({
        sequenceNumber: i + 1,
        startSeconds: 60 * 60 * Number(start[0]) + 60 * Number(start[1]) + Number(start[2].replace(',', '.')),
        focalLength: Number(dats[0].split('/')[1].trim()),
        shutterSpeed: Number(dats[1].trim().split(' ')[1]),
        iso: Number(dats[2].trim().split(' ')[1]),
        ev: Number(dats[3].trim().split(' ')[1]),
        dzoom: Number(dats[4].trim().split(' ')[1]),
        gpsLongitude: Number(dats[5].split('(')[1]),
        gpsLattitude: Number(dats[6].trim()),
        gpsCount: Number(dats[7].split(')')[0]),
        distance: Number(dats[8].trim().split(' ')[1].replace('m', '')),
        height: Number(dats[9].trim().split(' ')[1].replace('m', '')),
        horizontalSpeed: Number(dats[10].trim().split(' ')[1].replace('m/s', '')),
        verticalSpeed: Number(dats[11].trim().split(' ')[1].replace('m/s', ''))
      })
    }
  }

}
