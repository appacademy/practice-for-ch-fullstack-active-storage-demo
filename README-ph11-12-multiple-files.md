# Active Storage / AWS Demo, Phases 11-12: Multiple Files And Wrap Up

In these phases, you will learn how to handle multiple files at one time (Phase
11) before concluding with a few suggested clean-up tasks (Phase 12).

## Phase 11: Multiple files

Suppose that you want a post to be able to contain multiple images. How can you
do this?

1. Add a `has_many_attached` association to the model:

   ```rb
   # app/models/post.rb
   
   has_many_attached :images
   ```

   (Unless you want your default image added to every post, you will also want
   to comment out `validate :ensure_photo` and `before_validation
   :generate_default_pic` since the singular `photo` field will now always be
   empty.)

2. Update the strong params in your controller to accept an array of files as a
   param:

   ```rb
   # app/controllers/api/posts_controller.rb
   
   def post_params
     params.require(:post).permit(:title, images: [])
   end
   ```

3. In your Jbuilder `post` partial, map over `images` to grab each image's URL:

   ```rb
   # app/views/api/posts/_post.json.jbuilder

   json.extract! post, :id, :title
   json.photoUrl post.photo.attached? ? post.photo.url : nil
   json.imageUrls post.images.map { |file| file.url } # <-- ADD THIS LINE
   ```

4. On your form, add the `multiple` attribute to the file input to allow
   multiple attachments and change the `onChange` callback to `handleFiles`
   (with an 's'):

   ```js
   // frontend/src/Form.js

   <input type="file" onChange={handleFiles} multiple />
   ```

5. Still in __Form.js__, create state arrays for image files and image URLs.
   Then add a `handleFiles` function before the `return`. This function needs to
   set `imageFiles`, but it also needs to generate and set temporary `imageUrls`
   for the preview. To accomplish the latter, use a [`FileReader`] instance as
   you did for `handleFile`. Because you will be storing the URLs in an array,
   however, the callback stored in `onload` needs to store
   `fileReader.result`--i.e., the temporary URL--at the appropriate index of a
   URL array. If all the files have finished generating their URLs, then
   `setImageUrls` to the URL array.

   This is a bit tricky; if you like a challenge, try writing `handleFiles`
   without looking at the code below. A tip: `e.currentTarget.files` is an
   array-like `FileList` rather than an actual `Array`. (For more on the
   `FileList` type, see the [MDN docs][filelist].) You will accordingly need to
   cast it to an `Array` before you can run methods like `forEach` on it.

   Ultimately, your code should look something like this:

   ```js
   // frontend/src/Form.js

   const [imageFiles, setImageFiles] = useState ([]);
   const [imageUrls, setImageUrls] = useState ([]);

   // ...

   const handleFiles = ({ currentTarget }) => {
     const files = currentTarget.files;
     setImageFiles(files);
     if (files.length !== 0) {
       let filesLoaded = 0;
       const urls = [];
       Array.from(files).forEach((file, index) => {
         const fileReader = new FileReader();
         fileReader.readAsDataURL(file);
         fileReader.onload = () => {
           urls[index] = fileReader.result;
           if (++filesLoaded === files.length)
             setImageUrls(urls);
         }
       });
     }
     else setImageUrls([]);
   }
   ```

6. In `handleSubmit`, append each image file to the same key in the `formData`
   object, one at a time. Don't forget to reset `imageFiles` and `imageUrls` on
   a successful response too!

   ```js
   const handleSubmit = async e => {
     e.preventDefault();
     const formData = new FormData();
     formData.append('post[title]', title);
     if (photoFile) {
       formData.append('post[photo]', photoFile);
     }
     if (imageFiles.length !== 0) {   // <-- ADD THESE LINES
       imageFiles.forEach(image => {
         formData.append('post[images][]', image);
       })
     }
     
     // ...

     if (response.ok) {
       // ...
       setImageFiles([]);
       setImageUrls([]);
     }
   }
   ```

7. Finally, enable your index to show all images. (Displaying all images in an
   index is probably not ideal, but this is just a demo!)

   ```js
   // frontend/src/PostIndex.js

   <ul>
     {posts.map(post => {
       return (
         <li key={post.id}>
           <h2>{post.title}</h2>
           {post.imageUrls.map(imageUrl => (
             <img key={imageUrl} src={imageUrl} alt="" />
           ))}
         </li>
       );
     })}
   </ul>
   ```

[`FileReader`]: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
[filelist]: https://developer.mozilla.org/en-US/docs/Web/API/FileList

## Phase 12: Wrapping up

Congratulations! You've successfully set up an app to use Amazon's S3 storage
service. A few parting thoughts:

1. Clearing the filename  
   If you want to clear the file name on submit, you need to set the input
   element's `value` to `null`. [`useRef`] is a great way to do this. Import
   `useRef` along with `useState` and declare the reference like this:

   ```js
   // frontend/src/Form.js

   const fileRef = useRef(null);
   ```

   Assign this reference to `ref` when you declare the input element in the form
   itself:

   ```js
   // frontend/src/Form.js

   <input type="file" ref={fileRef} onChange={handleFile} />
   ```

   This will store a link to the element in `fileRef.current`. You can then use
   this reference to update the value in your `handleSubmit` function:

   ```js
   fileRef.current.value = null;
   ```

2. Deploying to production  
   When deploying to a production environment like Render, you need to make sure
   that the new environment can successfully decrypt your
   __config/credentials.yml.enc__ file. To do that, Render will need access to
   your Rails master key, which is found in __config/master.key__. **DO NOT PUSH
   __master.key__ TO GITHUB!** Instead, set an environment variable on
   Render for `RAILS_MASTER_KEY` with the value set to the contents of
   __master.key__. (See the "Deploying to Render" reading for more information
   on setting environment variables.)

Now go forth and store those images (avatars/files/etc.)!

[`useRef`]: https://reactjs.org/docs/hooks-reference.html#useref