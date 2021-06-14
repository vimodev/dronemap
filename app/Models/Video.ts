import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, belongsTo, BelongsTo, column, HasMany, hasMany, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuid } from 'uuid'
import File from './File'
import ffmpeg from 'fluent-ffmpeg'
import VideoDataPoint from './VideoDataPoint'
import MediaService from 'App/Services/MediaService'

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

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static async createUUID(video: Video) {
    if (video.id == undefined) video.id = uuid()
  }

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
        if (video.length == undefined) video.length = metadata.format.duration as string || '0'
        if (video.resolutionWidth == undefined) video.resolutionWidth = metadata.streams[0].width || 0
        if (video.resolutionHeight == undefined) video.resolutionHeight = metadata.streams[0].height || 0
        return resolve(true)
      })
    })
    await video.save()
  }

  @afterCreate()
  public static async readDataPoints(video: Video) {
    await MediaService.readDataPoints(video);
  }

  @belongsTo(() => File) public file: BelongsTo<typeof File>

  @hasMany(() => VideoDataPoint) public dataPoints: HasMany<typeof VideoDataPoint>

}
