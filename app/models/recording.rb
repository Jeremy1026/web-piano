class Recording < ApplicationRecord
  has_many :notes, dependent: :destroy

  before_create :generate_access_token

  private

  def generate_access_token
    self.access_token = SecureRandom.urlsafe_base64(16)
  end
end
