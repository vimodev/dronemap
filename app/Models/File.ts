import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'

import { v4 as uuid } from 'uuid'
import FileService from 'App/Services/FileService'
import MediaService from 'App/Services/MediaService'
import fs from 'fs'

export default class File extends BaseModel {

  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  public id: string

  @column()
  public filePath: string

  @column()
  public sha256: string

  @column()
  public size: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static async createUUID(file: File) {
    if (file.id == undefined) file.id = uuid()
  }

  @beforeCreate()
  public static async computeHash(file: File) {
    if (file.sha256 == undefined) file.sha256 = await FileService.computeFileHash(file.filePath)
  }

  @beforeCreate()
  public static async setSize(file: File) {
    if (file.size == undefined) file.size = fs.statSync(process.env.FILE_ROOT + file.filePath).size
  }

  @afterCreate()
  public static async handleFile(file: File) {
    MediaService.handleNewFile(file)
  }

}
