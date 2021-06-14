import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuid } from 'uuid'
import Video from './Video'

export default class VideoDataPoint extends BaseModel {
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  public id: string

  @column()
  public videoId: string

  @column()
  public sequenceNumber: number

  @column()
  public startSeconds: number

  @column()
  public focalLength: number

  @column()
  public shutterSpeed: number

  @column()
  public iso: number

  @column()
  public ev: number

  @column()
  public dzoom: number

  @column()
  public gpsLongitude: number

  @column()
  public gpsLattitude: number

  @column()
  public gpsCount: number

  @column()
  public distance: number

  @column()
  public height: number

  @column()
  public horizontalSpeed: number

  @column()
  public verticalSpeed: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static async createUUID(videoDataPoint: VideoDataPoint) {
    if (videoDataPoint.id == undefined) videoDataPoint.id = uuid()
  }

  @belongsTo(() => Video) public video: BelongsTo<typeof Video>
}
