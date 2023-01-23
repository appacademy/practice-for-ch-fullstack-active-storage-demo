# Active Storage / AWS Demo, Phase 6: Reading Files In React Forms

Now you want to enable users to load photos for their posts. (In the next phase,
you will see how to send them to the backend.)

First create a general post form in __frontend/src/Form.js__. Have it take in a
`setNewPost` callback:

```js
// frontend/src/Form.js

import { useState } from 'react';

function Form ({ setNewPost }) {
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
        onChange={handleInput}
        required />
      <button>Make a new Post!</button>
    </form>
  );
}

export default Form;
```

Import this `Form` into __App.js__ and render it above the `PostIndex`. Also
create a `newPost` state variable that will cause the page to update whenever
the form is used to create a new post:

```js
// frontend/src/App.js

// ...
import Form from './Form';

function App() {
  const [newPost, setNewPost] = useState(null);

  // ...

  useEffect(() => {
    if (newPost)
      setPosts(prevPosts => [newPost, ...prevPosts])
  }, [newPost])

  return (
    <>
      <Form setNewPost={setNewPost} />
      <PostIndex posts={posts} />
    </>
  );
}
```

So far this form does not do much: you can enter a title and clear it by
clicking `Make a newPost!`. To add file upload capabilities to the form, simply
include an input of type `file`:

```js
// frontend/src/Form.js

<form onSubmit={handleSubmit}>
  <label htmlFor="post-title">Title of Post</label>
  <input type="text"
    id="post-title"
    value={title}
    onChange={handleInput}
    required />
  <input type="file" />     {/* <----- ADD THIS LINE */}
  <button>Make a new Post!</button>
</form>
```

Open the page in the browser and see how much that one line does for you: you
can browse through your files, select the one you want, and its filename will
appear on the form. Pretty impressive!

Ultimately you are going to want to send the designated file to your backend for
storage, so let's start to set that up. Still in __Form.js__, create a state
variable `photoFile` and initialize it to `null`. Then add an event handler
`handleFile` that grabs the first file stored in the event and stores it in
`photoFile`:

```js
// frontend/src/Form.js

function Form () {
  const [photoFile, setPhotoFile] = useState (null);

  // ...

  const handleFile = ({ currentTarget }) => {
    const file = currentTarget.files[0];
    setPhotoFile(file);
  }

  // ...
}
```

File inputs are stored in the input object under `files`. Since the current file
input only allows for a single file upload--you will see how to allow multiple
files in a bit--the desired file will always be found at `files[0]`.

Finally, add an `onChange` event listener to the file input in your form and set
it equal to your `handleFile` callback:

```js
// frontend/src/Form.js

<input type="file" onChange={handleFile} />
```

Add a `console.log(photoFile)` right before the return statement in your `Form`
and refresh the browser with the DevTools console open. Select a file, and you
should see the file's information logged to the console. Good work! (Once you
have confirmed that everything is working, go ahead and remove the `photoFile`
`console.log`.)