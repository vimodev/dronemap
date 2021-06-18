import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, belongsTo, BelongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuid } from 'uuid'
import File from './File'
import ffmpeg from 'fluent-ffmpeg'
import VideoDataPoint from './VideoDataPoint'
import MediaService from 'App/Services/MediaService'

/**
 * Represents an analyzed DJI footage video
 */
export default class Video extends BaseModel {
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  public id: string

  @column()
  public fileId: string

  @column()
  public extension: string

  @column()
  public length: string

  @column()
  public resolutionWidth: number

  @column()
  public resolutionHeight: number

  // Date footage was shot
  @column.dateTime()
  public dateShot: DateTime

  // Database dates
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static async createUUID(video: Video) {
    if (video.id == undefined) video.id = uuid()
  }

  // We want to extract metadata from the video after scanning
  @afterCreate()
  public static async gatherMetadata(video: Video) {
    await new Promise(async (resolve) => {
      await video.load('file')
      // Extension if not set already
      if (video.extension == undefined) {
        let split = video.file.filePath.split('.')
        video.extension = split[split.length - 1]
      }
      // FFMPEG metadata gathering
      ffmpeg.ffprobe(process.env.FILE_ROOT + video.file.filePath, function(err, metadata) {
        if (err != null) {
          console.log(err)
          video.file.delete()
        }
        if (video.length == undefined) video.length = metadata.format.duration as string || '0'
        if (video.resolutionWidth == undefined) video.resolutionWidth = metadata.streams[0].width || 0
        if (video.resolutionHeight == undefined) video.resolutionHeight = metadata.streams[0].height || 0
        if (video.dateShot == undefined) video.dateShot = DateTime.fromISO(metadata.format.tags.creation_time as string)
        return resolve(true)
      })
    })
    await video.save()
    // And analyze the video for data points
    await MediaService.readDataPoints(video)
    await video.load('dataPoints')
  }

  @belongsTo(() => File) public file: BelongsTo<typeof File>

  @hasMany(() => VideoDataPoint) public dataPoints: HasMany<typeof VideoDataPoint>

}
