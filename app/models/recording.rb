class Recording < ApplicationRecord
  has_many :notes, dependent: :destroy
end
