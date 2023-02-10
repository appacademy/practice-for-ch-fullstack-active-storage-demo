# Active Storage / AWS Demo, Phases 4-5

These phases will show you how to upload (Phase 4) and display (Phase 5) an
image.

## Phase 4: Uploading And Retrieving Photos

Now is the moment of truth: can you upload a photo? Copy a __.jpg__ image on
your computer into the __app/assets/images__ folder. (The folder doesn't matter
for this test. If you don't have an __app/assets/images__ folder or don't want
to move an image there, just make sure you use the full path of the image on the
second line below.) Then try the following in the Rails console:

```ruby
post = Post.create(title: "First post!")
file = File.open('app/assets/images/<your-filename>.jpg') # <- Adjust the path here if the image is not in app/assets/images
post.photo.attach(io: file, filename: '<your-filename>.jpg')
post.photo.attached? # => true
```

Check your `dev` bucket in the [S3 console]. If everything has been configured
correctly, it should now contain a file! (If it does not, go back through the
preceding steps to find the issue.)

The next test is to see whether or not you can retrieve the image. Create a
`show` route for your posts in __config/routes.rb__ (`resources :posts, only:
[:show]`) and add the corresponding action in a `PostsController`:

```rb
# app/controllers/posts_controller.rb

class PostsController < ApplicationController
  def show
    @post = Post.find(params[:id])
  end
end
```

In a view, you can then access a post's photo like this:

```erb
<%# app/views/posts/show.html.erb %>

<h1><%= @post.title %></h1>
<img src="<%= @post.photo.url %>" alt="">
```

Boot up your server (`rails s`) and go to [`localhost:3000/posts/1`]. Hopefully
you see your image!

[`localhost:3000/posts/1`]: http://localhost:3000/posts/1

## Phase 5: Display S3 images in React

You can display your image in an HTML file served up by Rails, but what if you
want to access them in a React frontend?

To do this, you first need to set up your Rails app to act as a backend API.
Start by changing the default port in __config/puma.rb__ from `3000` to `5000`:

```rb
# config/puma.rb

port ENV.fetch("PORT") { 5000 }
```

Next, configure the following `api` namespace in __config/routes.rb__:

```rb
# config/routes.rb

Rails.application.routes.draw do
  resources :posts, only: [:show]
  namespace :api, defaults: { format: :json } do
    resources :posts, only: [:create, :index]
  end
end
```

Then add an `Api::PostsController`. Have it inherit from `ActionController::API`
so you won't have to worry about CSRF protection for this demo. Also have it
return the posts in reverse chronological order, so the most recent appears
first:

```rb
# app/controllers/api/posts_controller.rb

class Api::PostsController < ActionController::API
  def index
    @posts = Post.all.sort { |a,b| b.created_at <=> a.created_at }
  end
end
```

(Don't worry about the `create` action for now.)

Finally, enable your `index` route to return JSON. Use a partial for the
individual posts (the partial will come in handy later):

```rb
# app/views/api/posts/index.json.jbuilder

json.array! @posts do |post|
  json.partial! 'api/posts/post', post: post
end
```

```rb
# app/views/api/posts/_post.json.jbuilder

json.extract! post, :id, :title
json.photoUrl post.photo.attached? ? post.photo.url : nil
```

Rails should be good to go, now for React! In your root directory, run the
following command:

```sh
npx create-react-app frontend --template @appacademy/react-v17 --use-npm
```

In the resulting __frontend/package.json__, add the following `proxy` key:

```json
"proxy": "http://localhost:5000"
```

Replace the content of __App.js__ with this code to fetch the posts from your
backend whenever your app loads:

```js
// frontend/src/App.js

import { useState, useEffect } from 'react';
import PostIndex from './PostIndex';

function App() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch("/api/posts");
      setPosts (await res.json());
    }
    fetchPosts();
  }, []);

  return (
    <PostIndex posts={posts} />
  );
}

export default App;
```

In the same directory--this is a quick demo, after all--create a
__PostIndex.js__ file to display your posts and their photos:

```js
// frontend/src/PostIndex.js

function PostIndex({posts}) {
  return (
    <ul>
      {posts.map(post => {
        return (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <img src={post.photoUrl} alt="" />
          </li>
        );
      })}
    </ul>
  );
}

export default PostIndex;
```

To start your app, run `rails s` in your root directory. Then, in another
terminal, run `npm start` in your frontend directory. React should now be
rendering your index of posts! (It might be more impressive if you add
additional posts and photos...)