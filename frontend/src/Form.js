import { useState, useRef } from 'react';

function Form ({ setNewPost }) {
  const [title, setTitle] = useState ("");
  const [photoFile, setPhotoFile] = useState (null);
  const [photoUrl, setPhotoUrl] = useState (null);
  const [imageFiles, setImageFiles] = useState ([]);
  const [imageUrls, setImageUrls] = useState ([]);
  const fileRef = useRef(null);

  const handleInput = e => {
    setTitle(e.currentTarget.value);
  }

  const handleFile = ({ currentTarget }) => {
    const file = currentTarget.files[0];
    setPhotoFile(file);
    if (file) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => setPhotoUrl(fileReader.result);
    }
    else setPhotoUrl(null);
  }
  
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

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('post[title]', title);
    if (photoFile) {
      formData.append('post[photo]', photoFile);
    }
    else if (imageFiles.length !== 0) {
      Array.from(imageFiles).forEach(image => {
        formData.append('post[images][]', image);
      })
    }

    const response = await fetch('/api/posts', {
      method: 'POST',
      body: formData
    });
    if (response.ok) {
      const post = await response.json();
      setTitle("");
      setPhotoFile(null);
      setPhotoUrl(null);
      setImageFiles([]);
      setImageUrls([]);
      setNewPost(post);
      fileRef.current.value = null;
    }
  }

  let preview = null;
  if (photoUrl) preview = <img src={photoUrl} alt="" />;
  else if (imageUrls.length !== 0) {
    preview = imageUrls.map(url => {
      return <img key={url} src={url} alt="" />;
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="post-title">Title of Post</label>
      <input type="text"
        id="post-title"
        value={title}
        onChange={handleInput}
        required />
      {/* To accept only a single file, uncomment the following line and */}
      {/* comment out the line after. */}
      {/* <input type="file" ref={fileRef} onChange={handleFile} /> */}
      <input type="file" ref={fileRef} onChange={handleFiles} multiple />
      <h3>Image preview</h3>
      {preview}
      <button>Make a new Post!</button>
    </form>
  );
}

export default Form;