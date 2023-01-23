# Active Storage / AWS Demo, Phase 8: Previews, Validations, And Defaults

In these phases, you will learn how to implement previews (Phase 8), validations
(Phase 9), and defaults (Phase 10).

## Phase 8: Image preview

It would be nice to show users a preview of the image they have selected to
upload. Let's implement that now.

First, create a state variable `photoUrl` and initialize it to `null` in
__Form.js__.

To generate a (temporary) URL for the preview, create a [`FileReader`] instance,
then invoke [`readAsDataURL`] with the `file` passed as the argument. This will
trigger an `async` action. Define an `onload` property on the `FileReader`
instance that points to a callback that will run after `readerAsDataURL`
completes. Inside this callback, set the `photoUrl` state to `fileReader.result`
(i.e., the result of `readAsDataURL`).

If you set up `handleFile` correctly, it should look something like this:

```js
// frontend/src/Form.js

const handleFile = ({ currentTarget }) => {
  const file = currentTarget.files[0];
  setPhotoFile(file);
  if (file) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => setPhotoUrl(fileReader.result);
    };
  }
  else setPhotoUrl(null);
}
```

Define a variable `preview` right before the return statement and add the image
preview to the form:

```js
// frontend/src/Form.js

  // ...
  let preview = null;
  if (photoUrl) preview = <img src={photoUrl} alt="" />;

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="post-title">Title of Post</label>
      <input type="text"
        id="post-title"
        value={title}
        onChange={handleInput}
        required />
      <input type="file" onChange={handleFile}/>
      <h3>Image preview</h3>
      {preview}
      <button>Make a new Post!</button>
    </form>
  );
```

Add some styling, too, so your images will appear in an appropriate size:

```css
/* frontend/src/index.css */

img {
  height: 100px;
  margin: 5px
}
```

[`FileReader`]: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
[`readAsDataURL`]: https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
[filelist]: https://developer.mozilla.org/en-US/docs/Web/API/FileList

## Phase 9: Validating attachments

Suppose you want to ensure that every post has a photo attached. How could you
do that? You just need to create a custom validation in your backend.

Open your __app/models/post.rb__ and add the following validation:

```rb
# app/models/post.rb

validate :ensure_photo

# ...

def ensure_photo
  unless self.photo.attached?
    errors.add(:photo, "must be attached")
  end
end
```

## Phase 10: A default image

It is sometimes nice to have a default image that can be used until a user
decides to upload their own image. (Think avatars.) If you wanted to add a
default image to posts in the current app, you could do it by writing a method
to run before validations that will load a default image if no image is
attached:

```rb
# app/models/post.rb

require "open-uri"

# ...

before_validation :generate_default_pic

# ...

def generate_default_pic
  unless self.photo.attached?
    # Presumably you have already stored a default pic in your seeds bucket
    file = URI.open("https://<your-app-name>-seeds.s3.amazonaws.com/default_pic.jpg");
    self.photo.attach(io: file, filename: "default.jpg")
  end
end
```

Great job! In the next phase, you will learn how to handle multiple image files
at once.