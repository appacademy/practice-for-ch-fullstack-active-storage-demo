import { useState, useEffect } from 'react';
import PostIndex from './PostIndex';
import Form from './Form';

function App() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch("/api/posts");
      setPosts (await res.json());
    }
    fetchPosts();
  }, []);

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

export default App;
