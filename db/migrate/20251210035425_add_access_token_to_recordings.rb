class AddAccessTokenToRecordings < ActiveRecord::Migration[7.0]
  def change
    add_column :recordings, :access_token, :string
    add_index :recordings, :access_token, unique: true
  end
end
