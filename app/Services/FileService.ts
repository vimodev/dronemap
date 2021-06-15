import File from 'App/Models/File';
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

export default class FileService {

  public static isSyncing = false

  /**
   * Compute sha-256 of the given file
   * @param filename
   * @returns sha256 sum
   */
  public static async computeFileHash(filename: string): Promise<string> {
    return await new Promise((resolve, reject) => {
      let sha = crypto.createHash('sha256');
      try {
        let stream = fs.createReadStream(process.env.FILE_ROOT + filename)
        stream.on('data', function (data) {
          sha.update(data)
        })
        stream.on('end', function () {
          let hash = sha.digest('hex')
          return resolve(hash)
        })
      } catch (err) {
        return reject('Failure')
      }
    })
  }

  /**
   * Synchronizes the database with the file system
   * removes old entries
   * adds new entries
   */
  public static async synchronizeFileDatabase() {
    if (FileService.isSyncing) return
    FileService.isSyncing = true
    console.log("Starting database file sync")
    let databaseFiles = await File.all()
    // First go over all files in database to see if they are correct
    for (const file of databaseFiles) {
      // If it exists
      if (fs.existsSync(process.env.FILE_ROOT + file.filePath)) {
        // Verify hash
        let hash = await FileService.computeFileHash(file.filePath)
        // If hash does not match, replace the old database entry with updated info
        if (hash !== file.sha256) {
          await file.delete()
          let newFile = new File()
          newFile.filePath = file.filePath
          newFile.sha256 = hash
          newFile.save()
        }
      } else {
        await file.delete()
      }
    }
    // Now add all missing files to the database
    let systemFiles = FileService.getFiles('', [])
    for (const file of systemFiles) {
      let find = await File.findBy('filePath', file)
      if (find == null) {
        await File.create({filePath: file})
      }
    }
    console.log("Database file sync done. Datapoints will be extracted passively now.")
    FileService.isSyncing = false
  }

  /**
   * Recursively get all files
   * @param directory search root
   * @param fileArray accumulator
   * @returns file list
   */
  public static getFiles(directory: string, fileArray: Array<string>): Array<string> {
    let root = process.env.FILE_ROOT || ''
    let files = fs.readdirSync(root + directory)
    files.forEach(function (file) {
      if (fs.statSync(root + directory + path.sep + file).isDirectory()) {
        fileArray = FileService.getFiles(directory + path.sep + file, fileArray)
      } else {
        fileArray.push(path.join(directory, path.sep, file))
      }
    })
    return fileArray
  }

}
