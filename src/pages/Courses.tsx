import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, faStar, faUsers, faExternalLinkAlt, 
  faCircleNotch, faZap, faSearch, faFilter
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Courses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'dsa-placements', name: 'DSA & Placements' },
    { id: 'gate', name: 'GATE Prep' },
    { id: 'data-analytics-data-science', name: 'Data Science' },
    { id: 'development-testing', name: 'Development' },
    { id: 'cloud-devops', name: 'Cloud & DevOps' },
    { id: 'programming-languages', name: 'Languages' }
  ];

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/resources/fetch-courses';
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.append('category', activeCategory);
      if (search) params.append('search', search);
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const { data } = await api.get(url);
      setCourses(data);
    } catch (err) {
      setError('Failed to load courses. GfG Mainframe connection timed out.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [activeCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-12 max-w-7xl pb-24">
      {/* Header & Search */}
      <div className="space-y-8">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
            <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-text tracking-tighter uppercase italic">
                GfG <span className="text-accent">Courses</span>
            </h1>
            <p className="text-text/40 font-black text-xs tracking-[0.3em] uppercase flex items-center gap-2 italic">
                <FontAwesomeIcon icon={faZap} className="text-yellow-500" /> Premium Learning Material
            </p>
            </div>
            
            <form onSubmit={handleSearch} className="w-full md:w-96 relative group">
                <input 
                    type="text" 
                    placeholder="Search courses..." 
                    className="w-full bg-card border-2 border-border focus:border-accent p-4 pl-12 rounded-2xl outline-none text-text font-bold transition-all shadow-inner italic"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-accent text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Search</button>
            </form>
        </motion.div>

        {/* GfG Data Disclaimer */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/30 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center shrink-0 border border-blue-400/30">
              <span className="text-2xl">📊</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider">Data Source</p>
              <p className="text-[11px] font-bold text-blue-200 leading-snug">Courses fetched from GeeksforGeeks via HTTP. No API used.</p>
            </div>
          </div>
        </motion.div>

        {/* Categories Bar */}
        <div className="overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-3 min-w-max">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2
                            ${activeCategory === cat.id 
                                ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' 
                                : 'bg-card border-border text-text/40 hover:border-accent/50 hover:text-accent'}
                        `}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {loading ? (
        <div className="py-40 text-center space-y-6">
            <FontAwesomeIcon icon={faCircleNotch} className="text-accent text-5xl animate-spin opacity-20" />
            <p className="text-accent font-black tracking-[0.4em] uppercase italic text-xs animate-pulse">Synchronizing Course Data...</p>
        </div>
      ) : error ? (
        <div className="py-32 text-center bg-red-500/5 border border-red-500/20 rounded-[3rem] space-y-4">
            <p className="text-red-500 font-black uppercase tracking-widest">{error}</p>
            <button onClick={fetchCourses} className="bg-red-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all">Retry Sync</button>
        </div>
      ) : courses.length === 0 ? (
        <div className="py-40 text-center space-y-6">
            <div className="w-20 h-20 bg-card border border-border rounded-full flex items-center justify-center text-text/20 mx-auto">
                <FontAwesomeIcon icon={faSearch} size="2x" />
            </div>
            <p className="text-text/30 font-black tracking-[0.2em] uppercase italic text-xs">No courses found matching your criteria.</p>
            <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="text-accent font-black uppercase text-[10px] tracking-widest hover:underline">Clear all filters</button>
        </div>
      ) : (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {courses.map((course, i) => (
            <motion.div
              key={i}
              variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -8 }}
              className="bg-card border border-border rounded-[2.5rem] overflow-hidden group shadow-sm hover:shadow-2xl hover:border-accent transition-all flex flex-col"
            >
              {/* Image Container */}
              <Link to={`/courses/${course.slug}`} className="relative aspect-[16/9] overflow-hidden border-b border-border bg-background block">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                    <span className="bg-background/80 backdrop-blur-md text-text border border-border px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 shadow-lg">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-500" /> {course.rating}
                    </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <span className="text-white font-black uppercase text-[10px] tracking-widest bg-accent px-4 py-2 rounded-xl shadow-2xl">
                        View Details
                    </span>
                </div>
              </Link>

              {/* Content */}
              <div className="p-8 flex-grow space-y-6 flex flex-col">
                <div className="space-y-3 flex-grow">
                    <Link to={`/courses/${course.slug}`}>
                        <h3 className="text-xl font-black text-text leading-tight uppercase italic group-hover:text-accent transition-colors line-clamp-2">
                            {course.title}
                        </h3>
                    </Link>
                    <div className="flex items-center gap-2 text-text/40">
                        <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{course.registered}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                    <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-text/30 uppercase tracking-[0.2em]">Course Fee</p>
                        <p className="text-2xl font-black text-accent italic tracking-tighter">{course.price}</p>
                    </div>
                    <a 
                        href={course.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-background border-2 border-border hover:border-accent hover:text-accent p-4 rounded-2xl transition-all active:scale-90 text-text/40 shadow-inner group/btn"
                    >
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Footer Info */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="p-10 bg-accent/5 border border-accent/20 rounded-[3rem] text-center space-y-4 shadow-inner"
      >
        <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto border border-accent/20">
            <FontAwesomeIcon icon={faGraduationCap} />
        </div>
        <div className="space-y-1">
            <h4 className="text-lg font-black text-text uppercase italic tracking-tight">Verified GfG Content</h4>
            <p className="text-text/40 text-xs font-medium uppercase tracking-widest max-w-md mx-auto italic px-4">
                These courses are directly synchronized from GeeksforGeeks. Clicking on a course will take you to their official platform for registration.
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Courses;
