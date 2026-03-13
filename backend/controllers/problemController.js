import axios from 'axios';
import pool from '../config/db.js';

const fallbackProblems = [
    { title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', slug: 'two-sum--141631' },
    { title: 'Reverse a Linked List', difficulty: 'Medium', topic: 'Linked List', slug: 'reverse-a-linked-list' },
    { title: 'Missing number in array', difficulty: 'Easy', topic: 'Arrays', slug: 'missing-number-in-array1416' },
    { title: 'Parenthesis Checker', difficulty: 'Medium', topic: 'Stack', slug: 'parenthesis-checker2744' },
    { title: 'Binary Search', difficulty: 'Easy', topic: 'Searching', slug: 'binary-search-1587115620' },
    { title: 'Kadane\'s Algorithm', difficulty: 'Medium', topic: 'Arrays', slug: 'kadanes-algorithm-1587115620' },
    { title: 'Check for BST', difficulty: 'Medium', topic: 'Tree', slug: 'check-for-bst' },
    { title: 'Finding middle element in a linked list', difficulty: 'Easy', topic: 'Linked List', slug: 'finding-middle-element-in-a-linked-list' },
    { title: 'Minimum number of jumps', difficulty: 'Medium', topic: 'Dynamic Programming', slug: 'minimum-number-of-jumps-1587115620' },
    { title: 'Sort an array of 0s, 1s and 2s', difficulty: 'Easy', topic: 'Sorting', slug: 'sort-an-array-of-0s-1s-and-2s4231' },
    { title: 'Subarray with given sum', difficulty: 'Medium', topic: 'Arrays', slug: 'subarray-with-given-sum-1587115621' },
    { title: 'Left View of Binary Tree', difficulty: 'Easy', topic: 'Tree', slug: 'left-view-of-binary-tree' },
    { title: 'Detect Loop in linked list', difficulty: 'Medium', topic: 'Linked List', slug: 'detect-loop-in-linked-list' },
    { title: 'Lowest Common Ancestor in a BST', difficulty: 'Easy', topic: 'Tree', slug: 'lowest-common-ancestor-in-a-bst' },
    { title: 'Trapping Rain Water', difficulty: 'Hard', topic: 'Arrays', slug: 'trapping-rain-water-1587115621' }
];

export const getProblems = async (req, res) => {
  const { difficulty, topic } = req.query;
  
  try {
    const [dbRows] = await pool.execute('SELECT * FROM problems LIMIT 10');
    
    if (dbRows.length === 0) {
      console.log('Seeding initial problems...');
      for (const prob of fallbackProblems) {
          await pool.execute(
              'INSERT IGNORE INTO problems (title, difficulty, topic, link) VALUES (?, ?, ?, ?)',
              [prob.title, prob.difficulty, prob.topic, `https://www.geeksforgeeks.org/problems/${prob.slug}/1`]
          );
      }
    }

    let query = 'SELECT * FROM problems WHERE 1=1';
    const params = [];

    if (difficulty && difficulty !== 'All') {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }

    if (topic && topic !== 'All') {
      query += ' AND topic = ?';
      params.push(topic);
    }

    query += ' ORDER BY RAND() LIMIT 50';

    const [problems] = await pool.execute(query, params);
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProblem = async (req, res) => {
  const { title, difficulty, topic, link } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO problems (title, difficulty, topic, link) VALUES (?, ?, ?, ?)',
      [title, difficulty, topic, link]
    );
    res.status(201).json({ id: result.insertId, title, difficulty, topic, link });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
