# Active Storage / AWS Demo, Phase 7: Sending Files From React To Rails

Unfortunately, you cannot send files to your backend using simple JSON; you will
instead need to send them as [FormData]. Fortunately, `FormData` is rather
straightforward to configure. You simply create a new `FormData` instance and
`append` whatever fields you need:

```js
// frontend/src/Form.js

const handleSubmit = async e => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('post[title]', title);
  if (photoFile) {
    formData.append('post[photo]', photoFile);
  }
  // ...
}
```

Two things are worth noting here. First, you only want to append `photo` if
there is actually a photo to append. Second, as in your Rails forms, using the
names `post[title]` and `post[photo]` will nest the `title` and `photo` values
under the key of `post` in params, thereby enabling your request to pass through
strong params.

> **Note:** Alternatively, you could just use `title` and `photo` as the names
> in `formData` and then have your Rails controller wrap those parameters under
> the key of `post` (remember that `photo` is only an association--not an
> attribute--of your `Post` model!):

  ```rb
  # app/controllers/api/posts_controller.rb
  
  wrap_parameters include: Post.attribute_names + [:photo]
  ```

> Frontend programmers might appreciate this latter approach. :)

Once you have set up your `FormData`, send a `fetch` request:

```js
// frontend/src/Form.js

const handleSubmit = async e => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('post[title]', title);
  if (photoFile) {
    formData.append('post[photo]', photoFile);
  }

  const response = await fetch('/api/posts', {
    method: 'POST',
    body: formData
  });
  if (response.ok) {
    const post = await response.json();
    setTitle("");
    setPhotoFile(null);
    setNewPost(post);
  }
}
```

To test this, add a simple `create` action to your `Api::PostsController`
(you've already created the route):

```rb
  # app/controllers/api/posts_controller.rb

  def create
    post = Post.new(post_params)
    if post.save
      render partial: "api/posts/post", locals: { post: post }
    else
      render json: post.errors.full_messages, status: 422
    end
  end

  private

  def post_params
    params.require(:post).permit(:title, :photo)
  end
```

Try to create a new post with an image. (Remember, you set your
`Api::PostsController` to inherit from `ActionController::API`, so you don't
have to worry about CSRF.) If it works, you should see your new post appear in
the index!

**NOTE:** If you are using a custom fetch function like `csrfFetch`, you must
make sure that it does **NOT** set the `Content-Type` header if the body of the
request is `FormData`. In other words, you need to do something like this:

```js
if (options.method.toUpperCase() !== "GET") {
  if (!options.headers["Content-Type"] && !(options.body instanceof FormData)) {
    options.headers["Content-Type"] = "application/json";
  }
  options.headers["X-CSRF-Token"] = sessionStorage.getItem("X-CSRF-Token");
}
```

The `Content-Type` header of a `FormData` request will automatically be set to
`multipart/form-data` as long as that header is empty. (It cannot be set to
`multipart/form-data` manually because it needs to contain information about the
multi-part boundaries.)

[FormData]: https://developer.mozilla.org/en-US/docs/Web/API/FormData