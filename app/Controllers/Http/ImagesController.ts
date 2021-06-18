import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Image from 'App/Models/Image'
import fs from 'fs'

export default class ImagesController {

  public async show({params, response}: HttpContextContract) {

    const img = await Image.find(params.imageId)
    if (img == null) {
      response.status(404).send("File not found")
      return
    }

    await img.load('file')
    response.stream(fs.createReadStream(process.env.FILE_ROOT + img.file.filePath))

  }

}
