import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Images extends BaseSchema {
  protected tableName = 'images'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('file_id').nullable()
      table.foreign('file_id').references('id').inTable('files').onDelete('CASCADE')
      table.integer('width')
      table.integer('height')
      table.integer('x_dpi')
      table.integer('y_dpi')
      table.dateTime('shot_at')
      table.float('gps_longitude', 12, 8)
      table.float('gps_latitude', 12, 8)
      table.float('gps_altitude', 12, 8)
      table.float('f_stop')
      table.float('focal_length')
      table.float('exposure_time', 8, 4)
      table.integer('ISO')
      table.float('aperture', 8, 4)
      table.float('dzoom')
      table.float('white_balance')
      table.float('ev')
      table.float('shutter_speed')
      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
