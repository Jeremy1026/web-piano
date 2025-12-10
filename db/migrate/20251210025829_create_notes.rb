class CreateNotes < ActiveRecord::Migration[7.0]
  def change
    create_table :notes do |t|
      t.references :recording, null: false, foreign_key: true
      t.string :note
      t.integer :ms

      t.timestamps
    end
  end
end
