# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2025_12_10_035425) do
  create_table "notes", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "recording_id", null: false
    t.string "note"
    t.integer "ms"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["recording_id"], name: "index_notes_on_recording_id"
  end

  create_table "recordings", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.string "access_token"
    t.index ["access_token"], name: "index_recordings_on_access_token", unique: true
  end

  add_foreign_key "notes", "recordings"
end
