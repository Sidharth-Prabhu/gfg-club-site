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
    { title: 'Trapping Rain Water', difficulty: 'Hard', topic: 'Arrays', slug: 'trapping-rain-water-1587115621' },
    { title: 'Nth node from end of linked list', difficulty: 'Easy', topic: 'Linked List', slug: 'nth-node-from-end-of-linked-list' },
    { title: 'Merge two sorted linked lists', difficulty: 'Medium', topic: 'Linked List', slug: 'merge-two-sorted-linked-lists' },
    { title: 'Diameter of Binary Tree', difficulty: 'Medium', topic: 'Tree', slug: 'diameter-of-binary-tree' },
    { title: 'Topological sort', difficulty: 'Medium', topic: 'Graph', slug: 'topological-sort' },
    { title: 'Get minimum element from stack', difficulty: 'Medium', topic: 'Stack', slug: 'get-minimum-element-from-stack' },
    { title: 'Longest Common Subsequence', difficulty: 'Medium', topic: 'Dynamic Programming', slug: 'longest-common-subsequence-1587115620' },
    { title: 'Level order traversal in spiral form', difficulty: 'Easy', topic: 'Tree', slug: 'level-order-traversal-in-spiral-form' },
    { title: 'Find duplicates in an array', difficulty: 'Easy', topic: 'Arrays', slug: 'find-duplicates-in-an-array' },
    { title: 'Implement Queue using array', difficulty: 'Easy', topic: 'Queue', slug: 'implement-queue-using-array' },
    { title: 'BFS of graph', difficulty: 'Easy', topic: 'Graph', slug: 'bfs-traversal-of-graph' },
    { title: 'DFS of graph', difficulty: 'Easy', topic: 'Graph', slug: 'depth-first-traversal-for-a-graph' },
    { title: 'Palindromic Partitioning', difficulty: 'Hard', topic: 'Dynamic Programming', slug: 'palindromic-patitioning4845' },
    { title: 'Word Break', difficulty: 'Hard', topic: 'Dynamic Programming', slug: 'word-break1352' },
    { title: 'Edit Distance', difficulty: 'Hard', topic: 'Dynamic Programming', slug: 'edit-distance3702' },
    { title: 'Sudoku Solver', difficulty: 'Hard', topic: 'Backtracking', slug: 'solve-the-sudoku-1587115621' },
    { title: 'Merge Sort', difficulty: 'Medium', topic: 'Sorting', slug: 'merge-sort' },
    { title: 'Quick Sort', difficulty: 'Medium', topic: 'Sorting', slug: 'quick-sort' },
    { title: 'Reverse a String', difficulty: 'Easy', topic: 'Strings', slug: 'reverse-a-string-using-stack' },
    { title: 'Anagram', difficulty: 'Easy', topic: 'Strings', slug: 'anagram-1587115620' },
    { title: 'Palindrome String', difficulty: 'Easy', topic: 'Strings', slug: 'palindrome-string0817' },
    { title: 'Implement Atoi', difficulty: 'Medium', topic: 'Strings', slug: 'implement-atoi' },
    { title: 'Roman Number to Integer', difficulty: 'Medium', topic: 'Strings', slug: 'roman-number-to-integer3201' },
    { title: 'Longest Common Prefix', difficulty: 'Easy', topic: 'Strings', slug: 'longest-common-prefix-in-an-array5129' },
    { title: 'Stock Buy and Sell', difficulty: 'Medium', topic: 'Arrays', slug: 'stock-buy-and-sell-1587115621' },
    { title: 'Spirally traversing a matrix', difficulty: 'Medium', topic: 'Matrix', slug: 'spirally-traversing-a-matrix-1587115621' },
    { title: 'Common elements', difficulty: 'Easy', topic: 'Arrays', slug: 'common-elements1132' },
    { title: 'Inorder Traversal', difficulty: 'Easy', topic: 'Tree', slug: 'inorder-traversal' },
    { title: 'Preorder Traversal', difficulty: 'Easy', topic: 'Tree', slug: 'preorder-traversal' },
    { title: 'Postorder Traversal', difficulty: 'Easy', topic: 'Tree', slug: 'postorder-traversal' },
    { title: 'Check for Balanced Tree', difficulty: 'Easy', topic: 'Tree', slug: 'check-for-balanced-tree' },
    { title: 'Determine if Two Trees are Identical', difficulty: 'Easy', topic: 'Tree', slug: 'determine-if-two-trees-are-identical' },
    { title: 'Mirror Tree', difficulty: 'Easy', topic: 'Tree', slug: 'mirror-tree' },
    { title: 'Height of Binary Tree', difficulty: 'Easy', topic: 'Tree', slug: 'height-of-binary-tree' },
    { title: 'Lowest Common Ancestor in a Binary Tree', difficulty: 'Medium', topic: 'Tree', slug: 'lowest-common-ancestor-in-a-binary-tree' },
    { title: 'Root to Leaf Paths', difficulty: 'Easy', topic: 'Tree', slug: 'root-to-leaf-paths' },
    { title: 'Maximum path sum from any node', difficulty: 'Hard', topic: 'Tree', slug: 'maximum-path-sum-from-any-node' },
    { title: 'Minimum Spanning Tree', difficulty: 'Medium', topic: 'Graph', slug: 'minimum-spanning-tree' },
    { title: 'Dijkstra Algorithm', difficulty: 'Medium', topic: 'Graph', slug: 'implementing-dijkstra-set-1-adjacency-matrix' },
    { title: 'Strongly Connected Components (Kosaraju\'s Algo)', difficulty: 'Medium', topic: 'Graph', slug: 'strongly-connected-components-kosarajus-algo' },
    { title: 'Find the number of islands', difficulty: 'Medium', topic: 'Graph', slug: 'find-the-number-of-islands' },
    { title: 'Snake and Ladder Problem', difficulty: 'Medium', topic: 'Graph', slug: 'snake-and-ladder-problem4816' },
    { title: 'Minimum cost path', difficulty: 'Hard', topic: 'Graph', slug: 'minimum-cost-path3833' },
    { title: 'Word Ladder I', difficulty: 'Hard', topic: 'Graph', slug: 'word-ladder' },
    { title: 'Floyd Warshall', difficulty: 'Medium', topic: 'Graph', slug: 'floyd-warshall4826' },
    { title: 'Alien Dictionary', difficulty: 'Hard', topic: 'Graph', slug: 'alien-dictionary' },
    { title: 'Coin Change', difficulty: 'Medium', topic: 'Dynamic Programming', slug: 'coin-change2448' },
    { title: '0 - 1 Knapsack Problem', difficulty: 'Medium', topic: 'Dynamic Programming', slug: '0-1-knapsack-problem0945' },
    { title: 'Partition Equal Subset Sum', difficulty: 'Medium', topic: 'Dynamic Programming', slug: 'subset-sum-problem2014' },
    { title: 'Longest Palindromic Subsequence', difficulty: 'Medium', topic: 'Dynamic Programming', slug: 'longest-palindromic-subsequence-1612327878' },
    { title: 'Egg Dropping Puzzle', difficulty: 'Medium', topic: 'Dynamic Programming', slug: 'egg-dropping-puzzle-1587115620' },
    { title: 'Matrix Chain Multiplication', difficulty: 'Hard', topic: 'Dynamic Programming', slug: 'matrix-chain-multiplication0303' },
    { title: 'Optimal Binary Search Tree', difficulty: 'Hard', topic: 'Dynamic Programming', slug: 'optimal-binary-search-tree2235' },
    { title: 'Boolean Parenthesization', difficulty: 'Hard', topic: 'Dynamic Programming', slug: 'boolean-parenthesization5610' },
    { title: 'Largest rectangular area in a histogram', difficulty: 'Hard', topic: 'Stack', slug: 'maximum-rectangular-area-in-a-histogram-1587115620' },
    { title: 'Circular tour', difficulty: 'Medium', topic: 'Queue', slug: 'circular-tour-1587115620' },
    { title: 'First non-repeating character in a stream', difficulty: 'Medium', topic: 'Queue', slug: 'first-non-repeating-character-in-a-stream1216' },
    { title: 'Smallest window in a string containing all the characters of another string', difficulty: 'Hard', topic: 'Strings', slug: 'smallest-window-in-a-string-containing-all-the-characters-of-another-string-1587115621' },
    { title: 'Median in a row-wise sorted Matrix', difficulty: 'Hard', topic: 'Matrix', slug: 'median-in-a-row-wise-sorted-matrix1527' },
    { title: 'K-th element of two sorted Arrays', difficulty: 'Medium', topic: 'Searching', slug: 'k-th-element-of-two-sorted-array1317' }
];

export const getProblems = async (req, res) => {
  const { difficulty, excludeIds } = req.query;
  
  try {
    const [dbRows] = await pool.execute('SELECT COUNT(*) as count FROM problems');
    
    if (dbRows[0].count < 20) {
      for (const prob of fallbackProblems) {
          await pool.execute(
              'INSERT IGNORE INTO problems (title, difficulty, topic, link) VALUES (?, ?, ?, ?)',
              [prob.title, prob.difficulty, prob.topic, `https://www.geeksforgeeks.org/problems/${prob.slug}/1`]
          );
      }
    }

    let sql = 'SELECT * FROM problems';
    const params = [];
    const conditions = [];

    if (difficulty && difficulty !== 'All') {
      conditions.push('difficulty = ?');
      params.push(difficulty);
    }

    // Exclude current problems to prevent immediate repetition
    if (excludeIds) {
        const ids = excludeIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
        if (ids.length > 0) {
            conditions.push(`id NOT IN (${ids.map(() => '?').join(',')})`);
            params.push(...ids);
        }
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY RAND() LIMIT 50';

    const [problems] = await pool.execute(sql, params);
    
    // If we filtered out too many and got few results, fallback to general rand
    if (problems.length < 10 && excludeIds) {
        const [fallback] = await pool.execute('SELECT * FROM problems ORDER BY RAND() LIMIT 50');
        return res.json(fallback);
    }

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
