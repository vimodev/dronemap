import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Videos extends BaseSchema {
  protected tableName = 'videos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('file_id').nullable()
      table.foreign('file_id').references('id').inTable('files').onDelete('CASCADE')
      table.string('extension')
      table.string('length')
      table.integer('resolution_width')
      table.integer('resolution_height')
      table.dateTime('date_shot')
      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
