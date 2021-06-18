import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuid } from 'uuid'
import File from './File'

export default class Image extends BaseModel {

  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  public id: string

  @column()
  public fileId: string

  @column()
  public width: number

  @column()
  public height: number

  @column()
  public xDpi: number

  @column()
  public yDpi: number

  @column.dateTime()
  public shotAt: DateTime

  @column()
  public gpsLongitude: number

  @column()
  public gpsLatitude: number

  @column()
  public fStop: number

  @column()
  public focalLength: number

  @column()
  public exposureTime: number

  @column()
  public iso: number

  @column()
  public aperture: number

  @column()
  public dzoom: number

  @column()
  public whiteBalance: number

  @column()
  public ev: number

  @column()
  public shutterSpeed: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => File) public file: BelongsTo<typeof File>

  @beforeCreate()
  public static async createUUID(image: Image) {
    if (image.id == undefined) image.id = uuid()
  }

}
