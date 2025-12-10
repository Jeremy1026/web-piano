class AddDurationToNotes < ActiveRecord::Migration[7.0]
  def change
    add_column :notes, :duration, :integer
  end
end
