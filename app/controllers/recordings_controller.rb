class RecordingsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:create]

  def create
    recording = Recording.create!

    notes_params = params[:notes] || []
    notes_params.each do |note_data|
      recording.notes.create!(
        note: note_data[:note],
        ms: note_data[:ms].to_i
      )
    end

    # Set name to provided value or default to the recording id
    name = params[:name].presence || "Recording #{recording.id}"
    recording.update!(name: name)

    render json: { id: recording.id, name: recording.name }
  end
end
