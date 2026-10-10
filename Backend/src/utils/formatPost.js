// Post ko response ke liye taiyar karta hai:
// likes ki list ki jagah likesCount aur isLiked (kya is user ne like kiya)
const formatPost = (post, userId) => {
  const obj = post.toObject ? post.toObject() : post;
  const { likes = [], ...rest } = obj;

  return {
    ...rest,
    likesCount: likes.length,
    isLiked: likes.some((id) => id.toString() === userId.toString()),
  };
};

module.exports = formatPost;