import { useState, useEffect } from 'react';
import PostIndex from './PostIndex';
import Form from './Form';

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
    <>
      <Form />
      <PostIndex posts={posts} />
    </>
  );
}

export default App;
