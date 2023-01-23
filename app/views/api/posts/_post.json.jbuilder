json.extract! post, :id, :title
json.photoUrl post.photo.attached? ? url_for(post.photo) : nil
json.imageUrls post.images.map { |file| url_for(file) }
