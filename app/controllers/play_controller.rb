class PlayController < ApplicationController
  def show
    @recording = Recording.includes(:notes).find_by!(access_token: params[:token])
    @notes_json = @recording.notes.order(:ms).map { |n| { note: n.note, ms: n.ms, duration: n.duration || 200 } }.to_json
  end
end
