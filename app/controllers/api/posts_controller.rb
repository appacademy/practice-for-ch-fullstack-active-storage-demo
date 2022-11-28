class Api::PostsController < ActionController::API
  def index
    @posts = Post.all
  end

  def create
    post = Post.new(post_params)
    if post.save
      render json: { message: "You did it!" }
    else
      render json: post.errors.full_messages, status: 422
    end
  end

  private

  def post_params
    # This commented out code is for a single photo
    # params.require(:post).permit(:title, :photo)
    params.require(:post).permit(:title, :photo, images: [])
  end
end