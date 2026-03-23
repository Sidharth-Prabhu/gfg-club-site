import { 
  mockUsers, mockEvents, mockProjects, mockBlogs, 
  mockDiscussions, mockEventRegistrations 
} from '../data/mockData';

// In-memory data
let db = {
  users: [...mockUsers],
  events: [...mockEvents],
  projects: [...mockProjects],
  blogs: [...mockBlogs],
  discussions: [...mockDiscussions],
  event_registrations: [...mockEventRegistrations]
};

const parseUrl = (fullUrl) => {
  const [path, queryString] = fullUrl.split('?');
  const params = new URLSearchParams(queryString || '');
  const parts = path.split('/').filter(Boolean);
  
  if (parts[0] === 'auth') {
    return { resource: 'auth', subresource: parts[1], params };
  }
  
  const resource = parts[0];
  const id = parts[1];
  const subresource = parts[2];
  
  return { path, resource, id, subresource, params };
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const api = {
  get: async (url, config = {}) => {
    const { resource, id, subresource, params } = parseUrl(url);
    console.log(`MOCK GET: ${url}`, { resource, id, subresource });

    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network latency

    try {
      if (resource === 'users') {
        if (id === 'me') {
           const userId = localStorage.getItem('userId');
           if (!userId) throw new Error("Not logged in");
           const user = db.users.find(u => u.id === userId);
           if (!user) throw new Error("User not found");
           return { data: user };
        }
        if (id) {
           const user = db.users.find(u => u.id === id);
           return { data: user || null };
        }
        return { data: db.users };
      }

      if (resource === 'projects') {
        const wrapProject = (p) => {
           const u = db.users.find(u => u.id === p.created_by);
           return { ...p, creator_name: u ? u.name : 'Unknown' };
        };

        if (id && id !== 'user') {
          const p = db.projects.find(p => p.id === id);
          return { data: p ? wrapProject(p) : null };
        }
        return { data: db.projects.map(wrapProject) };
      }

      if (resource === 'events') {
        if (id && id !== 'my-registrations') {
          if (subresource === 'registrations') {
            return { data: db.event_registrations.filter(r => r.eventId === id) };
          }
          if (subresource === 'team-status') {
            return { data: null };
          }
          return { data: db.events.find(e => e.id === id) };
        }
        return { data: db.events };
      }

      if (resource === 'discussions') {
         return { data: db.discussions.map(d => {
            const u = db.users.find(u => u.id === d.author_id);
            return { ...d, author_name: u ? u.name : 'Unknown' };
         })};
      }
      if (resource === 'blogs') {
         const wrapBlog = (b) => {
             const u = db.users.find(u => u.id === b.author_id);
             return { ...b, author_name: u ? u.name : 'Unknown' };
         };
         if (id) {
            const b = db.blogs.find(b => b.id === id);
            return { data: b ? wrapBlog(b) : null };
         }
         return { data: db.blogs.map(wrapBlog) };
      }

      if (resource === 'leaderboard') {
        const sorted = [...db.users].sort((a, b) => (b.problems_solved || 0) - (a.problems_solved || 0));
        return { data: sorted };
      }
      
      return { data: [] };
    } catch (err) {
      console.error(`Mock GET Error FOR ${url}:`, err);
      throw { response: { data: { message: err.message } } };
    }
  },

  post: async (url, data, config = {}) => {
    const { resource, id, subresource } = parseUrl(url);
    console.log(`MOCK POST: ${url}`, data);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      if (resource === 'auth') {
         if (subresource === 'login') {
            const user = db.users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
            if (!user || user.password !== data.password) {
               throw new Error("Invalid email or password");
            }
            return { data: { ...user, token: "mock_jwt_token" } };
         }
         if (subresource === 'register') {
            const exists = db.users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
            if (exists) throw new Error("Email already registered");
            
            const isRIT = data.email.toLowerCase().includes('rit');
            const newUser = {
              id: 'user_' + generateId(),
              name: data.name,
              email: data.email.toLowerCase(),
              password: data.password,
              role: isRIT ? 'User' : 'Guest',
              status: isRIT ? 'Pending' : 'Approved',
              created_at: new Date().toISOString()
            };
            db.users.push(newUser);
            return { data: { ...newUser, token: "mock_jwt_token" } };
         }
      }

      const currentUserId = localStorage.getItem('userId');

      if (resource === 'projects') {
        if (subresource === 'vote' || id === 'vote') return { data: { success: true } };
        const newProj = { id: 'proj_' + generateId(), ...data, created_by: currentUserId, created_at: new Date().toISOString() };
        db.projects.push(newProj);
        return { data: newProj };
      }

      if (resource === 'events') {
        if (id === 'register' || subresource === 'register') {
           db.event_registrations.push({
             id: 'reg_' + generateId(), eventId: data.eventId, userId: currentUserId, registered_at: new Date().toISOString()
           });
           return { data: { success: true } };
        }
        const newEvent = { id: 'evt_' + generateId(), ...data, created_at: new Date().toISOString() };
        db.events.push(newEvent);
        return { data: newEvent };
      }

      if (resource === 'discussions') {
        const newDisc = { id: 'disc_' + generateId(), ...data, author_id: currentUserId, created_at: new Date().toISOString() };
        db.discussions.push(newDisc);
        return { data: newDisc };
      }

      if (resource === 'blogs') {
        const newBlog = { id: 'blog_' + generateId(), ...data, author_id: currentUserId, created_at: new Date().toISOString() };
        db.blogs.push(newBlog);
        return { data: newBlog };
      }

      return { data: { success: true, dummy: true } };
    } catch (err) {
      console.error(`Mock POST Error FOR ${url}:`, err);
      throw { response: { data: { message: err.message } } };
    }
  },

  put: async (url, data, config = {}) => {
    const { resource, id } = parseUrl(url);
    if (!id) return { data: { success: true } };
    
    try {
      if (db[resource]) {
         const index = db[resource].findIndex(item => item.id === id);
         if (index !== -1) {
            db[resource][index] = { ...db[resource][index], ...data };
         }
      }
      return { data: { success: true } };
    } catch (err) {
      throw { response: { data: { message: err.message } } };
    }
  },

  delete: async (url, config = {}) => {
    const { resource, id, subresource } = parseUrl(url);
    if (resource === 'events' && subresource === 'unregister') return { data: { success: true } };

    if (resource && id && db[resource]) {
       db[resource] = db[resource].filter(item => item.id !== id);
    }
    return { data: { success: true } };
  }
};

export default api;
