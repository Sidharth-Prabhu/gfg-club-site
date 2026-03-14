import pool from '../config/db.js';

export const getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `
      SELECT p.*, u.name as creator_name, 
      (SELECT COALESCE(SUM(vote_type), 0) FROM project_votes WHERE project_id = p.id) as vote_score,
      (SELECT GROUP_CONCAT(file_url) FROM project_files WHERE project_id = p.id) as files
      FROM projects p 
      JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `;
    const [rows] = await pool.execute(sql, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Project not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req, res) => {
  const { category, status } = req.query;
  const userRole = req.user?.role;
  
  try {
    let sql = `
      SELECT p.*, u.name as creator_name, 
      (SELECT COALESCE(SUM(vote_type), 0) FROM project_votes WHERE project_id = p.id) as vote_score,
      (SELECT GROUP_CONCAT(file_url) FROM project_files WHERE project_id = p.id) as files
      FROM projects p 
      JOIN users u ON p.created_by = u.id
    `;
    const params = [];
    const conditions = [];

    if (userRole === 'Admin' || userRole === 'Core') {
        if (status) {
            conditions.push('p.status = ?');
            params.push(status);
        }
    } else {
        conditions.push('p.status = "Approved"');
    }

    if (category && category !== 'All') {
      conditions.push('p.category = ?');
      params.push(category);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY p.created_at DESC';
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  const { title, description, github_link, demo_link, tech_stack, category, files } = req.body;
  const userId = req.user.id;

  try {
    const [result] = await pool.execute(
      'INSERT INTO projects (title, description, github_link, demo_link, tech_stack, category, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, "Pending")',
      [title, description, github_link, demo_link, tech_stack, category, userId]
    );
    const projectId = result.insertId;

    if (files && Array.isArray(files)) {
        for (const file of files) {
            await pool.execute(
                'INSERT INTO project_files (project_id, file_name, file_url, file_type) VALUES (?, ?, ?, ?)',
                [projectId, file.name, file.url, file.type]
            );
        }
    }

    res.status(201).json({ id: projectId, title, status: 'Pending' });
  } catch (error) {
    console.error('CREATE PROJECT FULL ERROR:', error);
    res.status(500).json({ message: error.message, detail: error.sqlMessage });
  }
};

export const updateProject = async (req, res) => {
    const { title, description, github_link, demo_link, tech_stack, category } = req.body;
    const projectId = req.params.id;
    const userId = req.user.id;

    try {
        const [rows] = await pool.execute('SELECT created_by, status FROM projects WHERE id = ?', [projectId]);
        if (rows.length === 0) return res.status(404).json({ message: 'Project not found' });

        if (rows[0].created_by !== userId && req.user.role !== 'Admin' && req.user.role !== 'Core') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // If an approved project is edited, reset it to Pending
        const newStatus = rows[0].status === 'Approved' ? 'Pending' : rows[0].status;

        await pool.execute(
            'UPDATE projects SET title = ?, description = ?, github_link = ?, demo_link = ?, tech_stack = ?, category = ?, status = ? WHERE id = ?',
            [title, description, github_link, demo_link, tech_stack, category, newStatus, projectId]
        );

        res.json({ message: 'Project updated and sent for re-approval', status: newStatus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProject = async (req, res) => {
  const projectId = req.params.id;
  const { id: userId, role } = req.user;

  try {
    const [rows] = await pool.execute('SELECT created_by FROM projects WHERE id = ?', [projectId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Project not found' });

    if (rows[0].created_by !== userId && role !== 'Admin' && role !== 'Core') {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await pool.execute('DELETE FROM projects WHERE id = ?', [projectId]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProjectStatus = async (req, res) => {
  const { status } = req.body;
  const userRole = req.user.role;

  if (userRole !== 'Admin' && userRole !== 'Core') {
    return res.status(403).json({ message: 'Not authorized to approve projects' });
  }

  try {
    await pool.execute('UPDATE projects SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `Project ${status} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const voteProject = async (req, res) => {
  const { projectId, voteType } = req.body;
  const userId = req.user.id;

  try {
    const [existing] = await pool.execute('SELECT * FROM project_votes WHERE user_id = ? AND project_id = ?', [userId, projectId]);
    
    if (existing.length > 0) {
        if (existing[0].vote_type === voteType) {
            await pool.execute('DELETE FROM project_votes WHERE id = ?', [existing[0].id]);
            return res.json({ message: 'Vote removed' });
        } else {
            await pool.execute('UPDATE project_votes SET vote_type = ? WHERE id = ?', [voteType, existing[0].id]);
            return res.json({ message: 'Vote updated' });
        }
    }

    await pool.execute('INSERT INTO project_votes (user_id, project_id, vote_type) VALUES (?, ?, ?)', [userId, projectId, voteType]);
    res.status(201).json({ message: 'Voted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProjects = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT p.*, (SELECT COALESCE(SUM(vote_type), 0) FROM project_votes WHERE project_id = p.id) as vote_score 
             FROM projects p WHERE p.created_by = ? ORDER BY p.created_at DESC`, 
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
