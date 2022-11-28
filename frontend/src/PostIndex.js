function PostIndex({posts}) {
  return (
    <ul>
      {posts.map(post => {
        return (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <img src={post.photoUrl} alt="" />
            {post.imageUrls.map(imageUrl => (
              <img key={imageUrl} src={imageUrl} alt="" height="300" />
            ))}
          </li>
        );
      })}
    </ul>
  );
}

export default PostIndex;
