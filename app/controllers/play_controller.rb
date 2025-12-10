class PlayController < ApplicationController
  def show
    @recording = Recording.includes(:notes).find(params[:id])
    @notes_json = @recording.notes.order(:ms).map { |n| { note: n.note, ms: n.ms } }.to_json
  end
end
