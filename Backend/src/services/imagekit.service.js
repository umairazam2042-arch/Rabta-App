const ImageKit = require("imagekit");

// ImageKit se connection (keys .env se aati hain)
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Image upload karta hai aur { url, fileId } wapis deta hai
// fileId baad mein image delete karne ke kaam aati hai
const uploadImage = async (file, folder = "/posts") => {
  const result = await imagekit.upload({
    file: file.buffer, // multer ne file memory mein rakhi hai
    fileName: file.originalname,
    folder,
    useUniqueFileName: true, // same naam ki files takrayen nahi
  });

  return { url: result.url, fileId: result.fileId };
};

// ImageKit se image delete karta hai
const deleteImage = async (fileId) => {
  if (!fileId) return;
  await imagekit.deleteFile(fileId);
};

module.exports = { uploadImage, deleteImage };