import { useState, useRef } from 'react';

function Form () {
  const [title, setTitle] = useState ("");
  const [photoFile, setPhotoFile] = useState (null);
  const [photoUrl, setPhotoUrl] = useState (null);
  const fileRef = useRef(null);

  const handleInput = e => {
    setTitle(e.currentTarget.value);
  }

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
      fileRef.current.value = null;
    }
  }

  const preview = photoUrl ? <img src={photoUrl} alt="" /> : null;
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="post-title">Title of Post</label>
      <input type="text"
        id="post-title"
        value={title}
        onChange={handleInput}/>
      <input type="file" ref={fileRef} onChange={handleFile}/>
      <h3>Image preview</h3>
      {preview}
      <button>Make a new Post!</button>
    </form>
  );
}

export default Form;
