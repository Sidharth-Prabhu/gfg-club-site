import pool from '../config/db.js';

export const getDiscussions = async (req, res) => {
  const { search, tag } = req.query;
  try {
    let sql = `
      SELECT d.*, u.name as author_name, u.role as author_role,
      (SELECT COUNT(*) FROM post_reactions WHERE post_id = d.id) as reaction_count,
      (SELECT COUNT(*) FROM post_comments WHERE post_id = d.id) as comment_count,
      (SELECT GROUP_CONCAT(tag) FROM post_tags WHERE post_id = d.id) as tags
      FROM discussions d 
      JOIN users u ON d.author_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (d.title LIKE ? OR d.content LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (tag) {
      sql += ` AND d.id IN (SELECT post_id FROM post_tags WHERE tag = ?)`;
      params.push(tag);
    }

    sql += ` ORDER BY d.created_at DESC`;

    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDiscussion = async (req, res) => {
  const { title, content, tags } = req.body;
  const authorId = req.user.id;

  try {
    const [result] = await pool.execute(
      'INSERT INTO discussions (title, content, author_id) VALUES (?, ?, ?)',
      [title, content, authorId]
    );
    const postId = result.insertId;

    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        await pool.execute('INSERT INTO post_tags (post_id, tag) VALUES (?, ?)', [postId, tag]);
      }
    }

    res.status(201).json({ id: postId, title, content, authorId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDiscussion = async (req, res) => {
  const postId = req.params.id;
  const { title, content, tags } = req.body;
  const { id: userId, role } = req.user;

  try {
    const [rows] = await pool.execute('SELECT author_id FROM discussions WHERE id = ?', [postId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Post not found' });

    if (rows[0].author_id !== userId && role !== 'Admin' && role !== 'Core') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await pool.execute('UPDATE discussions SET title = ?, content = ? WHERE id = ?', [title, content, postId]);
    
    // Update tags: remove old, add new
    await pool.execute('DELETE FROM post_tags WHERE post_id = ?', [postId]);
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        await pool.execute('INSERT INTO post_tags (post_id, tag) VALUES (?, ?)', [postId, tag]);
      }
    }

    res.json({ message: 'Post updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDiscussion = async (req, res) => {
  const postId = req.params.id;
  const { id: userId, role } = req.user;

  try {
    const [rows] = await pool.execute('SELECT author_id FROM discussions WHERE id = ?', [postId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Post not found' });

    if (rows[0].author_id !== userId && role !== 'Admin' && role !== 'Core') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await pool.execute('DELETE FROM discussions WHERE id = ?', [postId]);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reactToPost = async (req, res) => {
  const { postId } = req.body;
  const userId = req.user.id;

  try {
    const [existing] = await pool.execute('SELECT * FROM post_reactions WHERE user_id = ? AND post_id = ?', [userId, postId]);
    if (existing.length > 0) {
      await pool.execute('DELETE FROM post_reactions WHERE user_id = ? AND post_id = ?', [userId, postId]);
      return res.json({ message: 'Reaction removed' });
    }
    await pool.execute('INSERT INTO post_reactions (user_id, post_id, reaction_type) VALUES (?, ?, "like")', [userId, postId]);
    res.status(201).json({ message: 'Reaction added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, u.name as author_name, u.role as author_role,
       (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c.id) as reaction_count
       FROM post_comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.post_id = ? 
       ORDER BY c.created_at ASC`,
      [req.params.postId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  const { postId, content, parentId } = req.body;
  const userId = req.user.id;

  try {
    await pool.execute(
      'INSERT INTO post_comments (user_id, post_id, content, parent_id) VALUES (?, ?, ?, ?)', 
      [userId, postId, content, parentId || null]
    );
    res.status(201).json({ message: 'Comment added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateComment = async (req, res) => {
  const commentId = req.params.id;
  const { content } = req.body;
  const { id: userId, role } = req.user;

  try {
    const [rows] = await pool.execute('SELECT user_id FROM post_comments WHERE id = ?', [commentId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Comment not found' });

    if (rows[0].user_id !== userId && role !== 'Admin' && role !== 'Core') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await pool.execute('UPDATE post_comments SET content = ? WHERE id = ?', [content, commentId]);
    res.json({ message: 'Comment updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  const commentId = req.params.id;
  const { id: userId, role } = req.user;

  try {
    const [rows] = await pool.execute('SELECT user_id FROM post_comments WHERE id = ?', [commentId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Comment not found' });

    if (rows[0].user_id !== userId && role !== 'Admin' && role !== 'Core') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await pool.execute('DELETE FROM post_comments WHERE id = ?', [commentId]);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reactToComment = async (req, res) => {
  const { commentId } = req.body;
  const userId = req.user.id;

  try {
    const [existing] = await pool.execute('SELECT * FROM comment_reactions WHERE user_id = ? AND comment_id = ?', [userId, commentId]);
    if (existing.length > 0) {
      await pool.execute('DELETE FROM comment_reactions WHERE user_id = ? AND comment_id = ?', [userId, commentId]);
      return res.json({ message: 'Reaction removed' });
    }
    await pool.execute('INSERT INTO comment_reactions (user_id, comment_id) VALUES (?, ?)', [userId, commentId]);
    res.status(201).json({ message: 'Reaction added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
