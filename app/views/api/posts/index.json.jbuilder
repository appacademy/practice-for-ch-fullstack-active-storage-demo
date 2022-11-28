json.array! @posts do |post|
  json.extract! post, :id, :title
  json.photoUrl url_for(post.photo)
  json.imageUrls post.images.map { |file| url_for(file) }
end
