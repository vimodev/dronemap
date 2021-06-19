import File from "App/Models/File";
import Video from "App/Models/Video";
import Image from "App/Models/Image"
import os from 'os'
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import VideoDataPoint from "App/Models/VideoDataPoint";
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import exif from 'exif-parser'
import { DateTime } from "luxon";

export default class MediaService {

  // We recognize these extensions as the corresponding media types
  public static IMAGE_EXTENSIONS = ['jpg']
  public static VIDEO_EXTENSIONS = ['mp4']

  /**
   * Do something with file based on extension
   * @param file
   */
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
    const exifData = exif.create(fs.readFileSync(process.env.FILE_ROOT + file.filePath)).parse()
    if (exifData == null || exifData.tags == undefined || exifData.tags.Make != 'DJI') {
      console.log(`${file.filePath} not recognized as an image taken with DJI drone. Not analyzing it further.`)
      return
    }
    console.log("Handling " + file.filePath)
    try {
      let image = new Image()
      await image.related('file').associate(file)
      const data = {
        width: exifData.imageSize.width,
        height: exifData.imageSize.height,
        xDpi: exifData.tags.XResolution,
        yDpi: exifData.tags.YResolution,
        shotAt: DateTime
                  .fromSeconds(exifData.tags.CreateDate),
        gpsLongitude: exifData.tags.GPSLongitude,
        gpsLatitude: exifData.tags.GPSLatitude,
        gpsAltitude: exifData.tags.GPSAltitude,
        fStop: exifData.tags.FNumber,
        focalLength: exifData.tags.FocalLength,
        exposureTime: exifData.tags.ExposureTime,
        iso: exifData.tags.ISO,
        aperture: exifData.tags.ApertureValue,
        dzoom: exifData.tags.DigitalZoomRatio,
        whiteBalance: exifData.tags.WhiteBalance,
        ev: exifData.tags.ExposureCompensation,
        shutterSpeed: exifData.tags.ShutterSpeedValue
      }
      for (const key in data) {
        image[key] = data[key]
      }
      await image.save()
    } catch (e) {
      console.log(e)
      console.log(`Something went wrong while parsing EXIF data from ${file.filePath}. Ignoring this file.`)
      return
    }
  }

  /**
   * Do stuff with a newly made video
   * Specifically scan the subtitles for data points
   * @param file
   */
  public static async handleNewVideo(file: File) {
    if (!(await MediaService.isDjiVideo(file))) {
      // If its not recognized as a DJI video, we skip
      console.log(`${file.filePath} not recognized as DJI video with subtitles. Not analyzing it further.`)
      return
    }
    console.log("Handling " + file.filePath)
    // Make a video object in the database and associate it with file
    let video = new Video()
    await video.related('file').associate(file)
    await video.save()
  }

  /**
   * Generate a thumbnail for the given data point
   * @param point to use
   * @param http to stream
   */
  public static async thumbnail(point: VideoDataPoint, http: HttpContextContract) {
    // Load associated video and file
    await point.load('video')
    await point.video.load('file')
    // Make a temporary directory
    const tmpDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`)
    await new Promise((resolve) => {
      // Log it
      console.log("Thumbnail generated: " + tmpDir + path.sep + point.id)
      // Use ffmpeg to fetch a screen from the corresponding time offset in the video
      ffmpeg(process.env.FILE_ROOT + point.video.file.filePath)
        .screenshots({
          timestamps: [point.startSeconds],
          filename: point.id + '.png',
          folder: tmpDir,
          size: '640x384',
        })
        .on('end', function() {
          resolve(true)
        })
    })
    // Stream it
    let thumbnail = fs.createReadStream(tmpDir + path.sep + point.id + '.png')
    http.response.stream(thumbnail)
    // Yeet it
    fs.unlinkSync(tmpDir + path.sep + point.id + '.png')
  }

  /**
   * Scan given video for data points
   * @param video
   */
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
      // In my experience each segment is of the following format (when using ffmpeg to extract .srt):
      //
      // 5
      // 00:00:04,000 --> 00:00:05,000
      // F/2.8, SS 1000.82, ISO 100, EV 0, DZOOM 1.000, GPS (7.7298, 50.2099, 23), D 9.91m, H 1.60m, H.S 9.45m/s, V.S 1.90m/s
      //
      const segment = segments[i]
      // Split the lines
      const lines = segment.split("\n")
      // Get starting time
      let start = lines[1].split(' ')[0].split(':')
      let dats = lines[2].split(',')
      try {
        // Attempt to create a point from the found data
        await video.related('dataPoints').create({
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
      } catch {
        // If it fails we can not read the subtitle
        console.log(`Unable to read datapoint from subtitles of ${video.file}, aborting analysis of this file.`)
        // Delete the video in database
        await video.delete()
        // And remove the subtitle file we dumped
        fs.unlinkSync(subtitleFile)
        return
      }
    }
    fs.unlinkSync(subtitleFile)
  }

  /**
   * Use ffprobe to check whether given file is a DJI footage video with subs
   * @param file
   */
  public static async isDjiVideo(file: File): Promise<boolean> {
    return await new Promise((resolve) => {
      // Probe for metadata
      ffmpeg.ffprobe(process.env.FILE_ROOT + file.filePath, function(err, metadata) {
        if (err != null) {
          console.log(err)
          return resolve(false)
        }
        let hasSub = false
        // As long as one of the streams has a handler name tag of DJI.Subtitle
        for (const stream of metadata.streams) {
          if ((stream.tags.handler_name as string).includes('DJI.Subtitle')) {
            // We recognize it
            hasSub = true
            break
          }
        }
        return resolve(hasSub)
      })
    })
  }

}
