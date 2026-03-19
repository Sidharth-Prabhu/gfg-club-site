import { db } from '../config/firebase.js';
import admin from 'firebase-admin';
import { notifyAll, createNotification } from './notificationController.js';

export const getDiscussionById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const discussionRef = db.collection('discussions').doc(id);
    const discussionDoc = await discussionRef.get();
    
    if (!discussionDoc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const discussionData = discussionDoc.data();
    const userDoc = await db.collection('users').doc(discussionData.author_id).get();
    const userData = userDoc.data();
    
    // Get reaction count
    const reactionsSnapshot = await db.collection('post_reactions')
      .where('post_id', '==', id)
      .get();
    
    // Get comment count
    const commentsSnapshot = await db.collection('post_comments')
      .where('post_id', '==', id)
      .get();
    
    // Get tags
    const tagsSnapshot = await db.collection('post_tags')
      .where('post_id', '==', id)
      .get();
    
    const tags = tagsSnapshot.docs.map(doc => doc.data().tag);
    
    res.json({
      id: discussionDoc.id,
      ...discussionData,
      author_name: userData?.name,
      author_role: userData?.role,
      author_pic: userData?.profile_pic,
      reaction_count: reactionsSnapshot.size,
      comment_count: commentsSnapshot.size,
      tags
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDiscussions = async (req, res) => {
  const { search, tag, groupId, authorId } = req.query;
  const userId = req.user?.id;

  try {
    let query = db.collection('discussions');

    if (groupId) {
      query = query.where('group_id', '==', groupId);
    } else if (authorId) {
      query = query.where('author_id', '==', authorId);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.json([]);
    }

    let discussions = [];
    const authorIds = new Set();

    for (const doc of snapshot.docs) {
      const discussionData = doc.data();

      // Filter for main broadcast feed
      if (!groupId && !authorId) {
        if (userId) {
          // Logged in: Public posts OR posts from user's joined groups
          if (discussionData.group_id) {
            const membershipCheck = await db.collection('group_members')
              .where('group_id', '==', discussionData.group_id)
              .where('user_id', '==', userId)
              .where('status', '==', 'Accepted')
              .get();

            if (membershipCheck.empty) continue;
          }
        } else {
          // Not logged in: only Public posts
          if (discussionData.group_id) continue;
        }
      }

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        if (!discussionData.title?.toLowerCase().includes(searchLower) &&
            !discussionData.content?.toLowerCase().includes(searchLower)) {
          continue;
        }
      }

      // Tag filter
      if (tag) {
        const tagCheck = await db.collection('post_tags')
          .where('post_id', '==', doc.id)
          .where('tag', '==', tag)
          .get();

        if (tagCheck.empty) continue;
      }

      authorIds.add(discussionData.author_id);

      discussions.push({
        id: doc.id,
        ...discussionData,
        author_name: '',
        author_role: '',
        author_pic: '',
        reaction_count: 0,
        comment_count: 0,
        tags: []
      });
    }

    // Fetch all authors in parallel
    const authorDocs = await Promise.all(
      [...authorIds].map(id => db.collection('users').doc(id).get())
    );
    const authorMap = new Map();
    authorDocs.forEach(doc => {
      if (doc.exists) {
        const data = doc.data();
        authorMap.set(doc.id, { name: data.name, role: data.role, profile_pic: data.profile_pic });
      }
    });

    // Fetch all reactions in parallel
    const discussionsForReactions = discussions.map(d => d.id);
    const reactionsPromises = discussionsForReactions.map(id =>
      db.collection('post_reactions')
        .where('post_id', '==', id)
        .get()
    );
    const reactionsSnapshots = await Promise.all(reactionsPromises);
    const reactionMap = new Map();
    reactionsSnapshots.forEach((snapshot, index) => {
      reactionMap.set(discussionsForReactions[index], snapshot.size);
    });

    // Fetch all comments in parallel
    const commentsPromises = discussionsForReactions.map(id =>
      db.collection('post_comments')
        .where('post_id', '==', id)
        .get()
    );
    const commentsSnapshots = await Promise.all(commentsPromises);
    const commentMap = new Map();
    commentsSnapshots.forEach((snapshot, index) => {
      commentMap.set(discussionsForReactions[index], snapshot.size);
    });

    // Fetch all tags in parallel
    const tagsPromises = discussionsForReactions.map(id =>
      db.collection('post_tags')
        .where('post_id', '==', id)
        .get()
    );
    const tagsSnapshots = await Promise.all(tagsPromises);
    const tagsMap = new Map();
    tagsSnapshots.forEach((snapshot, index) => {
      tagsMap.set(discussionsForReactions[index], snapshot.docs.map(d => d.data().tag));
    });

    // Update discussions with fetched data
    discussions = discussions.map(disc => {
      const author = authorMap.get(disc.author_id) || {};
      return {
        ...disc,
        author_name: author.name || 'Unknown',
        author_role: author.role || 'Unknown',
        author_pic: author.profile_pic || null,
        reaction_count: reactionMap.get(disc.id) || 0,
        comment_count: commentMap.get(disc.id) || 0,
        tags: tagsMap.get(disc.id) || []
      };
    });

    // Sort by created_at descending in JavaScript
    discussions.sort((a, b) => {
      const aDate = a.created_at?.toDate ? a.created_at.toDate() : new Date(0);
      const bDate = b.created_at?.toDate ? b.created_at.toDate() : new Date(0);
      return bDate - aDate;
    });

    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDiscussion = async (req, res) => {
  const { title, content, tags, groupId } = req.body;
  const authorId = req.user.id;
  const userRole = req.user.role;

  try {
    if (groupId) {
      if (userRole === 'Guest') {
        return res.status(403).json({ message: 'Guest entities are restricted to public broadcasting only' });
      }

      // Check if user is a member of the group
      const membershipCheck = await db.collection('group_members')
        .where('group_id', '==', groupId)
        .where('user_id', '==', authorId)
        .where('status', '==', 'Accepted')
        .get();
      
      if (membershipCheck.empty) {
        return res.status(403).json({ message: 'Only accepted members can post in this group' });
      }
    }

    const discussionRef = db.collection('discussions').doc();
    const discussionData = {
      title,
      content,
      author_id: authorId,
      group_id: groupId || null,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await discussionRef.set(discussionData);

    if (tags && Array.isArray(tags)) {
      const batch = db.batch();
      for (const tag of tags) {
        const tagRef = db.collection('post_tags').doc();
        batch.set(tagRef, { post_id: discussionRef.id, tag });
      }
      await batch.commit();
    }

    // Notifications
    const userDoc = await db.collection('users').doc(authorId).get();
    const authorName = userDoc.data().name;

    if (groupId) {
      const groupDoc = await db.collection('community_groups').doc(groupId).get();
      const groupName = groupDoc.data().title;

      const membersSnapshot = await db.collection('group_members')
        .where('group_id', '==', groupId)
        .where('status', '==', 'Accepted')
        .get();
      
      for (const doc of membersSnapshot.docs) {
        const memberId = doc.data().user_id;
        if (memberId === authorId) continue;
        
        await createNotification(
          memberId, 
          'community', 
          `${authorName} posted in ${groupName}: ${title}`, 
          `/community/post/${discussionRef.id}`
        );
      }
    } else {
      await notifyAll('community', `${authorName} shared a new post: ${title}`, `/community/post/${discussionRef.id}`, authorId);
    }

    res.status(201).json({ id: discussionRef.id, title, content, authorId, groupId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDiscussion = async (req, res) => {
  const postId = req.params.id;
  const { title, content, tags } = req.body;
  const { id: userId, role } = req.user;

  try {
    const discussionRef = db.collection('discussions').doc(postId);
    const discussionDoc = await discussionRef.get();
    
    if (!discussionDoc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const discussionData = discussionDoc.data();
    
    if (discussionData.author_id !== userId && role !== 'Admin' && role !== 'Core') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await discussionRef.update({ title, content });

    // Update tags: remove old, add new
    const oldTagsSnapshot = await db.collection('post_tags')
      .where('post_id', '==', postId)
      .get();
    
    const batch = db.batch();
    oldTagsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        const tagRef = db.collection('post_tags').doc();
        batch.set(tagRef, { post_id: postId, tag });
      }
    }
    
    await batch.commit();

    res.json({ message: 'Post updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDiscussion = async (req, res) => {
  const postId = req.params.id;
  const { id: userId, role } = req.user;

  try {
    const discussionRef = db.collection('discussions').doc(postId);
    const discussionDoc = await discussionRef.get();
    
    if (!discussionDoc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const discussionData = discussionDoc.data();
    
    if (discussionData.author_id !== userId && role !== 'Admin' && role !== 'Core') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await discussionRef.delete();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reactToPost = async (req, res) => {
  const { postId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({ message: 'User ID not found in token' });
  }

  try {
    // First try to find by user_id only (no index needed)
    const existingSnapshot = await db.collection('post_reactions')
      .where('user_id', '==', userId)
      .get();

    // Filter by post_id in JavaScript
    const existingReaction = existingSnapshot.docs.find(doc => doc.data().post_id === postId);

    if (existingReaction) {
      // Remove reaction
      await db.collection('post_reactions').doc(existingReaction.id).delete();
      return res.json({ message: 'Reaction removed' });
    }

    // Add reaction
    await db.collection('post_reactions').add({
      user_id: userId,
      post_id: postId,
      reaction_type: 'like',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ message: 'Reaction added' });
  } catch (error) {
    console.error('React error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const snapshot = await db.collection('post_comments')
      .where('post_id', '==', req.params.postId)
      .get();

    if (snapshot.empty) {
      return res.json([]);
    }

    const comments = [];
    const userIds = new Set();

    for (const doc of snapshot.docs) {
      const commentData = doc.data();
      userIds.add(commentData.user_id);

      const reactionsSnapshot = await db.collection('comment_reactions')
        .where('comment_id', '==', doc.id)
        .get();

      comments.push({
        id: doc.id,
        ...commentData,
        author_name: '',
        author_role: '',
        author_pic: '',
        reaction_count: reactionsSnapshot.size
      });
    }

    // Fetch all authors in parallel
    const authorDocs = await Promise.all(
      [...userIds].map(id => db.collection('users').doc(id).get())
    );
    const authorMap = new Map();
    authorDocs.forEach(doc => {
      if (doc.exists) {
        const data = doc.data();
        authorMap.set(doc.id, { name: data.name, role: data.role, profile_pic: data.profile_pic });
      }
    });

    // Update comments with author data
    const result = comments.map(comment => {
      const author = authorMap.get(comment.user_id) || {};
      return {
        ...comment,
        author_name: author.name || 'Unknown',
        author_role: author.role || 'Unknown',
        author_pic: author.profile_pic || null
      };
    });

    // Sort by created_at ascending in JavaScript
    result.sort((a, b) => {
      const aDate = a.created_at?.toDate ? a.created_at.toDate() : new Date(0);
      const bDate = b.created_at?.toDate ? b.created_at.toDate() : new Date(0);
      return aDate - bDate;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  const { postId, content, parentId } = req.body;
  const userId = req.user.id;

  try {
    await db.collection('post_comments').add({
      user_id: userId,
      post_id: postId,
      content,
      parent_id: parentId || null,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
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
    const commentRef = db.collection('post_comments').doc(commentId);
    const commentDoc = await commentRef.get();
    
    if (!commentDoc.exists) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const commentData = commentDoc.data();
    
    if (commentData.user_id !== userId && role !== 'Admin' && role !== 'Core') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await commentRef.update({ content });
    res.json({ message: 'Comment updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  const commentId = req.params.id;
  const { id: userId, role } = req.user;

  try {
    const commentRef = db.collection('post_comments').doc(commentId);
    const commentDoc = await commentRef.get();
    
    if (!commentDoc.exists) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const commentData = commentDoc.data();
    
    if (commentData.user_id !== userId && role !== 'Admin' && role !== 'Core') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await commentRef.delete();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reactToComment = async (req, res) => {
  const { commentId } = req.body;
  const userId = req.user.id;

  try {
    const existingSnapshot = await db.collection('comment_reactions')
      .where('user_id', '==', userId)
      .get();

    const existingReaction = existingSnapshot.docs.find(doc => doc.data().comment_id === commentId);

    if (existingReaction) {
      await db.collection('comment_reactions').doc(existingReaction.id).delete();
      return res.json({ message: 'Reaction removed' });
    }

    await db.collection('comment_reactions').add({
      user_id: userId,
      comment_id: commentId,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ message: 'Reaction added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
