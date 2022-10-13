# AWS S3 With User Upload Demo

In this demo, you will configure your Rails-React app to use the Amazon Web
Services (AWS) S3 service to store user uploads (avatars, images, files, etc.).

**Note:** The videos accompanying this demo use an older version of both Rails
and React. As a result, they will sometimes use outdated syntax or differ from
what you see in your app or in this guide. This guide is more current and is
written for Rails 7 / React hooks, so when it includes something additional or
slightly different from what the videos tell you, **follow this written guide.**

(Amazon is also continually updating their S3 pages, so don't be alarmed if your
Amazon page looks a little different than what you see in the videos. For
example, S3 bucket creation--see video 2--now shows all the options on a single
page instead of having you click through a series of screens for different
options.)

You can find the code for this demo at the `Download Project` button at the
bottom of this page. Note, though, that since __master.key__ is **NEVER** pushed
to GitHub, you will need to set up new credentials for the app to run (see Step
3).

## Step 0a: Sign up for an AWS account

To use the S3 cloud storage service, you will need to create an AWS account,
which you can do [here][aws-signup]. Select the free tier when asked.

You will be asked for a credit card, but you will not be charged right away. It
has happened, however, that students were charged because they exceeded the data
limits of the [free tier]. Take a minute to read up on [S3 pricing]. There are
two ways in which students have accidentally exceeded the data limits:

1. Their seed file contained too many images or videos, and they seeded their
   database too many times.
2. They had an index page with lots of `video` tags that loaded a lot of large
   video files on every refresh.

If you're worried about exceeding the data limits for the free tier, make sure
to monitor your usage regularly.

[aws-signup]: https://portal.aws.amazon.com/billing/signup#/start/email
[free tier]: https://aws.amazon.com/free/
[S3 pricing]: https://aws.amazon.com/s3/pricing/

## Step 0b: Set up a basic Rails app

Create a new Rails app--name it something like `active-storage-demo`--without
Unit Tests (`-T`) and with `postgresql` as the db. Do **NOT** use the
`--minimal` flag. If you use the `-G` flag, grab __.gitignore__ and
__.gitattributes__ files from the project solution or a prior project.

Adjust your Gemfile as desired and `bundle install`.

Create a simple `Post` model. It should have a string `title`. Set a database
constraint and model validation to ensure that `title` is present. Create and
migrate your database.

Good enough! You're ready to go!

## Step 1: Set up Active Storage

[Video][video1]

The Rails package that enables you to handle attachments and blob tables is
called Active Storage. To set up Active Storage, do the following:

* Add `gem "aws-sdk-s3"` to your Gemfile and `bundle install`.

* Run `rails active_storage:install`. This will create a migration to set up
  tables for attachments, blobs, and variant records. Don't worry about the
  details of these tables; you won't need to know them.

  > **Note:** If you want to install Active Storage on a Rails app created with
  > the `--minimal` flag, you first need to uncomment the following two lines at
  > the top of __config/application.rb__:

    ```rb
    require "active_job/railtie"
    # ...
    require "active_storage/engine"
    ```

* Run the migration: `rails db:migrate`.

* Add the attachment association--it works just like a `has_one` association--to
  your desired model:

  ```rb
  # app/models/post.rb

  class Post < ApplicationRecord
    # ...
    has_one_attached :photo
  end
  ```

  **Note:** Rails also provides a `has_many_attached` macro.

[video1]: https://vimeo.com/351475079

## Step 2: Create your AWS user and buckets

[Video][video2]
> **Note:** The video includes the additional step of adding permissions to each
> bucket, which is currently not necessary. The template below is also simpler
> than the one used in the video.

Buckets are where Amazon actually stores your files. You will create two
buckets, one for development (`<your-app-name>-dev`) and one for production
(`<your-app-name>-prod`). (You might also find it helpful to have a third bucket
for seeding purposes: `<your-app-name>-seeds`. See the "Storing Seed Files on
AWS S3" reading for information on how to set up that bucket.)

To create a bucket, navigate to the [S3 console]. (If prompted, sign in as `Root
user`.) Click on `Create bucket`. Enter the name--`<your-app-name>-dev`--and
choose the region geographically closest to you. Leave all other options as the
default and click the `Create bucket` button at the bottom of the page. Repeat
to create your `prod` bucket.

You now have space set aside on AWS, but you don't yet have permission to access
it. For that, you need to create a new [Identity and Access Management
(IAM)][IAM] user. Unlike a root user, an IAM user will have limited access and
permissions within the account. You will define those permissions below.

Head to the [IAM users console][iam-users] to create a new user. Name the user
`<your-app-name>-admin` or something similar. Select `Access key - Programmatic
access` as the AWS credential type and proceed to `Next: Permissions`.

Now you need to set the security policy for your new user, which controls how
they will be allowed to connect. Click `Attach existing policies directly` and
then `Create Policy`. This will open a new tab.

In the new browser tab, click the `JSON` tab and paste the following:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Stmt1420751757000",
      "Effect": "Allow",
      "Action": ["s3:*"],
      "Resource": [
        "arn:aws:s3:::<BUCKET-NAME-DEV>/*",
        "arn:aws:s3:::<BUCKET-NAME-PROD>/*"
      ]
    }
  ]
}
```

Make sure to replace `<BUCKET-NAME-*>` with the appropriate bucket name, e.g.,
`active-storage-demo-dev`. Click `Next: Tags` and then `Next: Review`. Give the
policy whatever name you like (e.g., `s3-access-to-<name-of-project>`). After
you save and create the policy, head back to the other tab where you are
creating a new IAM user.

Click the refresh button all the way to the right of the `Create Policy` button,
then search for the policy that you just created. Check that policy then head to
the next step. You can skip additional tags. Create the user.

After you create the user, you will see a page with the new user's `Access Key
ID` and `Secret Access Key`. These are the user's security credentials, and they
will never be accessible again once you leave this page. (If you do leave the
page before securing the credentials, you will need to delete the user and
create a new one.)

Click to download the __.csv__ file. Store this somewhere safe on your computer.
**NEVER PUSH THIS FILE (OR ITS CONTENTS) TO GITHUB OR POST IT ANYWHERE PUBLIC!**

That's it! AWS should now be configured. Now you just have to convince Active
Storage to use it!

[video2]: https://vimeo.com/351474880
[S3 console]: https://s3.console.aws.amazon.com/s3/home?region=us-east-1
[IAM]: https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html
[iam-users]: https://console.aws.amazon.com/iam/home?#/users

## Step 3: Handling keys and credentials

[Video][video3]

Now you want to store your AWS credentials securely within your Rails app. This
means adding them to your __config/credentials.yml.enc__. This file is
encoded--that's what the __.enc__ at the end signifies--which means that you
can't just open the credentials file for editing in VS Code. Instead, you have
to open it with a Rails command: `rails credentials:edit`.

> **Note:** Rails will open the credentials file for editing using your shell's
> default editor. If the default editor is not VS Code (and you would like it to
> be), add

  ```sh
  export EDITOR="code --wait"
  ```

> to your __.bashrc__ or __.zshrc__.

When you open the credentials file of a new Rails app, you should see the
following skeleton commented out at the top:

```yml
# aws:
#   access_key_id: 123
#   secret_access_key: 345
```

Uncomment this code, which sets up `access_key_id` and `secret_access_key` keys
inside an `aws` namespace. Replace the `123` and `345` with the respective
values from your downloaded __.csv__ file. (Remember to wrap the values in
quotation marks since they are strings!) Continuing inside the `aws` namespace,
also add

* a `region` key with a string value of your region
* a `dev` key whose value is itself a key-value pair with a key of `bucket` and
  a value that is the name of your `dev` bucket
* a `prod` key whose value is itself a key-value pair with a key of `bucket` and
  a value that is the name of your `prod` bucket

When you finish, your credentials file should look like this:

```yml
aws:
  access_key_id: "XXXX"
  secret_access_key: "XXXX"
  region: "us-east-1"
  dev:
    bucket: "<BUCKET-NAME>-dev"
  prod:
    bucket: "<BUCKET-NAME>-prod"

# Used as the base secret for all MessageVerifiers in Rails, including the one protecting cookies.
secret_key_base: XXXXXX
```

Double check your `s3_region` [here][aws-regions] (scroll down to **API
Gateways**).

Close the credentials file to have Rails re-encode it.

> **Note:** Rails uses __config/master.key__ to encode your credentials file.
> **NEVER PUSH YOUR MASTER KEY TO GITHUB!** (It should be included in your
> __.gitignore__ by default, but always make sure.)

(If you don't have the correct master key--e.g., for a repo you've cloned from
GitHub--and want to reset your credentials file, delete __config/master.key__
and __config/credentials.yml.enc__. To create new versions of the files, simply
run `rails credentials:edit`. Note, though, that **you will lose whatever
credentials were stored in the original __credentials.yml.enc__.**)

Next, add your services to __config/storage.yml__:

```yml
amazon_dev:
  service: S3
  access_key_id: <%= Rails.application.credentials.aws[:access_key_id] %>
  secret_access_key:
    <%= Rails.application.credentials.aws[:secret_access_key] %>
  region: <%= Rails.application.credentials.aws[:region] %>
  bucket: <%= Rails.application.credentials.aws[:dev][:bucket] %>

amazon_prod:
  service: S3
  access_key_id: <%= Rails.application.credentials.aws[:access_key_id] %>
  secret_access_key:
    <%= Rails.application.credentials.aws[:secret_access_key] %>
  region: <%= Rails.application.credentials.aws[:region] %>
  bucket: <%= Rails.application.credentials.aws[:prod][:bucket] %>
```

Finally, specify which storage service should be used in each environment, i.e.,
in __config/environments/development.rb__ and
__config/environments/production.rb__:

```ruby
# config/environments/development.rb

config.active_storage.service = :amazon_dev
```

```ruby
# config/environments/production.rb

config.active_storage.service = :amazon_prod
```

You did it! You should now be able to attach files through the console, which
you will test in the next step.

[video3]: https://vimeo.com/351474983
[aws-regions]: http://docs.aws.amazon.com/general/latest/gr/rande.html

## Uploading and retrieving photos

[Video][video4]

Now is the moment of truth: can you upload a photo? Copy a __.jpg__ image on
your computer into the __app/assets/images__ folder. Then try the following in
the Rails console:

```ruby
post = Post.create(title: "First post!")
file = File.open('app/assets/images/<your-filename>.jpg')
post.photo.attach(io: file, filename: '<your-filename>.jpg')
post.photo.attached? # => true
```

Check your `dev` bucket in the [S3 console]. If everything has been configured
correctly, it should now contain a file! (If it does not, go back through the
preceding steps to find the issue.)

The next test is to see whether or not you can retrieve the image. Create a
`show` route for your posts and add the corresponding action in a
`PostsController`. In a view, you can then access a post's photo like this:

```erb
<%# app/views/posts/show.html.erb %>

<h1><%= @post.title %></h1>
<img src="<%= @post.photo.url %>" alt="">
```

Boot up your server (`rails s`) and go to [`localhost:3000/posts/1`]. Hopefully
you see your image!

[video4]: https://vimeo.com/278727030
[`localhost:3000/posts/1`]: http://localhost:3000/posts/1

## Step 5: Display S3 images in React

[Video][video5]
> **Note:** This video uses React class components instead of hooks and jQuery's
> `$.ajax` instead of `fetch`.

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
so you won't have to worry about CSRF protection for this demo:

```rb
class Api::PostsController < ActionController::API
  def index
    @posts = Post.all
  end
end
```

(Don't worry about the `create` action for now.)

Finally, enable your `index` route to return JSON:

```rb
# app/views/api/posts/index.json.jbuilder

json.array! @posts do |post|
  json.extract! post, :id, :title
  json.photoUrl post.photo.url
end
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
            <img src={post.photoUrl}/>
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
additional posts and photos.)

[video5]: https://vimeo.com/278727054

## Step 6: Reading files in React forms

[Video][video6]
> **Note:** This video uses React class components instead of hooks and jQuery's
> `$.ajax` instead of `fetch`.

Now you want to enable users to load photos for their posts. (In the next step,
you will see how to send them to the backend.)

First create a general post form in __frontend/src/Form.js__:

```js
// frontend/src/Form.js

import { useState } from 'react';

function Form () {
  const [title, setTitle] = useState ("");

  const handleInput = e => {
    setTitle(e.currentTarget.value);
  }

  const handleSubmit = async e => {
    e.preventDefault();
    // TODO
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="post-title">Title of Post</label>
      <input type="text"
        id="post-title"
        value={title}
        onChange={handleInput}/>
      <button>Make a new Post!</button>
    </form>
  );
}

export default Form;
```

Import this `Form` into __App.js__ and render it above the `PostIndex`:

```js
// src/App.js

// ...
import Form from './Form';

function App() {
  // ...

  return (
    <>
      <Form />
      <PostIndex posts={posts} />
    </>
  );
}
```

So far this form does not do much: you can enter a title and clear it by
clicking `Make a newPost!`. To add file upload capabilities to the form, simply
include an input of type `file`:

```js
// src/Form.js

<form onSubmit={handleSubmit}>
  <label htmlFor="post-title">Title of Post</label>
  <input type="text"
    id="post-title"
    value={title}
    onChange={handleInput} />
  <input type="file" />     {/* <----- ADD THIS LINE */}
  <button>Make a new Post!</button>
</form>
```

Open the page in the browser and see how much that one line does for you: you
can browse through your files, select the one you want, and its filename will
appear on the form. Pretty impressive!

Ultimately you are going to want to send the designated file to your backend for
storage, so let's start to set that up. Create a state variable `photoFile` and
initialize it to `null`. Then add an event handler `handleFile` that grabs the
first file stored in the event and stores it in `photoFile`:

```js
// src/Form.js

function Form () {
  const [photoFile, setPhotoFile] = useState (null);

  // ...

  const handleFile = e => {
    const file = e.currentTarget.files[0];
    setPhotoFile(file);
  }

  // ...
}
```

Finally, add an `onChange` event listener to the file input in your form and set
it equal to your `handleFile` callback:

```js
<input type="file" onChange={handleFile} />
```

Add a `console.log(photoFile)` right before the return statement in your `Form`
and refresh the browser with the DevTools console open. Select a file, and you
should see the file's information logged to the console. Good work! (Once you
have confirmed that everything is working, go ahead and remove the `photoFile`
`console.log`.)

[video6]: https://vimeo.com/278727067

## Step 7: Sending files from React to Rails

[Video][video7]
> **Note:** This video uses React class components instead of hooks and jQuery's
> `$.ajax` instead of `fetch`.

Unfortunately, you cannot send files to your backend using simple JSON; you will
instead need to send them as [FormData]. Fortunately, `FormData` is rather
straightforward to configure. You simply create a new `FormData` instance and
`append` whatever fields you need:

```js
// src/Form.js

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
// src/Form.js

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
    const message = await response.json();
    console.log(message.message);
    setTitle("");
    setPhotoFile(null);
    setPhotoUrl(null);
  }
}
```

To test this, add a simple `create` action to your `Api::PostsController` (you've already created the route):

```rb
  # app/controllers/api/posts_controller.rb

  def create
    post = Post.new(post_params)
    if post.save
      render json: {message: "You did it!"}
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
have to worry about CSRF.) If it works, you should see `You did it!` in the
console. Refresh your page and see your new post on the index!

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

[video7]: https://vimeo.com/278727091
[FormData]: https://developer.mozilla.org/en-US/docs/Web/API/FormData

## Step 8: Image preview

[Video][video8]
> **Note:** This video uses React class components instead of hooks and jQuery's
> `$.ajax` instead of `fetch`.

It would be nice to show users a preview of the image they have selected to
upload. Let's implement that now.

First, create a state variable `photoUrl` and initialize it to `null`.

To generate a (temporary) URL for the preview, create a [`FileReader`] instance,
then invoke [`readAsDataURL`] with the `file` passed as the argument. This will
trigger an `async` action. Define an `onload` property on the `FileReader`
instance that points to a callback that will run after `readerAsDataURL`
completes. Inside this callback, set the `photoFile` state to the `file` and the
`photoUrl` state to `fileReader.result` (i.e., the result of `readAsDataURL`).

If you set up `handleFile` correctly, it should look something like this:

```js
// src/Form.js

const handleFile = e => {
  const file = e.currentTarget.files[0];
  if (file) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      setPhotoFile(file);
      setPhotoUrl(fileReader.result);
    };
  }
}
```

Define a variable `preview` right before the return statement and add the image
preview to the form:

```js
// src/Form.js

  // ...
  const preview = photoUrl ? <img src={photoUrl} alt="" /> : null;
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="post-title">Title of Post</label>
      <input type="text"
        id="post-title"
        value={title}
        onChange={handleInput}/>
      <input type="file" onChange={handleFile}/>
      <h3>Image preview</h3>
      {preview}
      <button>Make a new Post!</button>
    </form>
  );
```

[video8]: https://vimeo.com/278727103

## Step 9: Validating attachments

[Video][video9]
> **Note:** This video uses old Rails syntax for setting errors.

Suppose you want to ensure that every post has a photo attached. How could you
do that? You just need to create a custom validation in your backend.

Open your __app/models/post.rb__ and add the following validation:

```rb
# app/models/post.rb

validate ensure_photo

# ...

def ensure_photo
  unless self.photo.attached?
    errors.add(:photo, "must be attached")
  end
end
```

[video9]: https://vimeo.com/278727131

## Step 10: Wrapping up

Congratulations! You've successfully set up an app to use Amazon's S3 storage
service. A few parting thoughts:

1. Clearing the filename  
   If you want to clear the file name on submit, you need to set the input
   element's `value` to `null`. [`useRef`] is a great way to do this. Import
   `useRef` along with `useState` and declare the reference like this:

   ```js
   // src/Form.js
   
   const fileRef = useRef(null);
   ```

   Assign this reference to `ref` when you declare the input element in the form
   itself:

   ```js
   <input type="file" ref={fileRef} onChange={handleFile}/>
   ```

   This will store a link to the element in `fileRef.current`. You can then use
   this reference to update the value in your `handleSubmit` function:

   ```js
   fileRef.current.value = null;
   ```

2. Deploying to production  
   When deploying to a production environment like Heroku, you need to make sure
   that the new environment can successfully decrypt your
   __config/credentials.yml.enc__ file. To do that, Heroku will need access to
   your Rails master key, which is found in __config/master.key__. **DO NOT PUSH
   __master.key__ TO GITHUB!** Instead, set a config/environment variable on
   Heroku for `RAILS_MASTER_KEY` with the value set to the contents of
   __master.key__. (See the "Deploying to Heroku" reading for more information
   on setting config variables.)

Now go forth and store those images (avatars/files/etc.)!

[`useRef`]: https://reactjs.org/docs/hooks-reference.html#useref