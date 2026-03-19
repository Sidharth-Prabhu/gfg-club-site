import admin, { db } from '../config/firebase.js';
import { notifyAll } from './notificationController.js';

export const getBlogs = async (req, res) => {
  try {
    const snapshot = await db.collection('blogs')
      .orderBy('created_at', 'desc')
      .get();
    
    const blogs = [];
    for (const doc of snapshot.docs) {
      const blogData = doc.data();
      const userDoc = await db.collection('users').doc(blogData.author_id).get();
      const userData = userDoc.data();
      
      blogs.push({
        id: doc.id,
        ...blogData,
        author_name: userData?.name,
        author_pic: userData?.profile_pic
      });
    }
    
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blogRef = db.collection('blogs').doc(req.params.id);
    const blogDoc = await blogRef.get();
    
    if (!blogDoc.exists) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    const blogData = blogDoc.data();
    const userDoc = await db.collection('users').doc(blogData.author_id).get();
    const userData = userDoc.data();
    
    res.json({
      id: blogDoc.id,
      ...blogData,
      author_name: userData?.name,
      author_pic: userData?.profile_pic
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBlog = async (req, res) => {
  const { title, content, tags } = req.body;
  
  try {
    const blogRef = db.collection('blogs').doc();
    const blogData = {
      title,
      content,
      tags: tags || null,
      author_id: req.user.id,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await blogRef.set(blogData);

    // Notify all users about the new blog
    await notifyAll('blog', `New blog posted: ${title}`, `/blog/${blogRef.id}`, req.user.id);

    res.status(201).json({ 
      id: blogRef.id, 
      title, 
      content, 
      tags, 
      author_id: req.user.id 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBlog = async (req, res) => {
  const { title, content, tags } = req.body;
  const blogId = req.params.id;
  
  try {
    const blogRef = db.collection('blogs').doc(blogId);
    const blogDoc = await blogRef.get();
    
    if (!blogDoc.exists) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    const blogData = blogDoc.data();
    
    if (blogData.author_id !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await blogRef.update({
      title,
      content,
      tags: tags || null
    });
    
    res.json({ message: 'Blog updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blogRef = db.collection('blogs').doc(req.params.id);
    const blogDoc = await blogRef.get();
    
    if (!blogDoc.exists) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    const blogData = blogDoc.data();
    
    if (blogData.author_id !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Core') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await blogRef.delete();
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
