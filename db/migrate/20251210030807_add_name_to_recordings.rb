class AddNameToRecordings < ActiveRecord::Migration[7.0]
  def change
    add_column :recordings, :name, :string
  end
end
