# == Schema Information
#
# Table name: posts
#
#  id         :bigint           not null, primary key
#  title      :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
require "open-uri"

class Post < ApplicationRecord
  validates :title, presence: true
  # validate :ensure_photo
  # before_validation :generate_default_pic

  has_one_attached :photo
  has_many_attached :images

  def ensure_photo
    unless self.photo.attached?
      errors.add(:photo, "must be attached")
    end
  end

  def generate_default_pic
    unless self.photo.attached?
      # Presumably you have already stored a default pic in your seeds bucket
      file = URI.open("https://appacademy-open-assets.s3.us-west-1.amazonaws.com/fullstack/full-stack-project/assets/bench_placeholder.png");
      self.photo.attach(io: file, filename: "default.jpg")
    end
  end
end