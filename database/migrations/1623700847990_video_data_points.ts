import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class VideoDataPoints extends BaseSchema {
  protected tableName = 'video_data_points'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('video_id').nullable()
      table.foreign('video_id').references('id').inTable('videos').onDelete('CASCADE')
      table.integer('sequence_number').notNullable()
      table.float('start_seconds').notNullable()
      table.float('focal_length')
      table.integer('shutter_speed')
      table.integer('iso')
      table.float('ev')
      table.float('dzoom')
      table.float('gps_longitude')
      table.float('gps_lattitude')
      table.integer('gps_count')
      table.float('distance')
      table.float('height')
      table.float('horizontal_speed')
      table.float('vertical_speed')
      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
