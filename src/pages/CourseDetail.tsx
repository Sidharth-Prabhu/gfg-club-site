import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faStar, faUsers, faExternalLinkAlt, 
  faCircleNotch, faPlayCircle, faBook, faListUl, faCheckCircle, faGlobe
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import NeuralBackground from '../components/NeuralBackground';

const HLSPlayer = ({ src, poster }: { src: string, poster?: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            return () => hls.destroy();
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // For Safari native support
            video.src = src;
        }
    }, [src]);

    return (
        <video 
            ref={videoRef}
            poster={poster}
            controls
            className="w-full h-full object-cover"
        />
    );
};

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/resources/fetch-course-detail?slug=${slug}`);
        setCourse(data);
      } catch (err) {
        setError('Failed to load neural data for this course.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
            <FontAwesomeIcon icon={faCircleNotch} className="text-accent text-5xl animate-spin opacity-20" />
            <p className="text-accent font-black tracking-[0.3em] uppercase animate-pulse text-xs italic">Decrypting Course Data...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border p-12 rounded-[3rem] text-center space-y-6 max-w-lg shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto">
                <FontAwesomeIcon icon={faGlobe} size="2x" />
            </div>
            <h2 className="text-2xl font-black text-text uppercase italic tracking-tighter">{error || 'Course Not Found'}</h2>
            <button onClick={() => navigate('/courses')} className="bg-accent text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-accent/80 transition-all active:scale-95 shadow-lg shadow-accent/20">Return to Catalog</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Header */}
      <section className="relative min-h-[40vh] md:min-h-[50vh] w-full overflow-hidden bg-card border-b border-border flex flex-col justify-end">
        <div className="absolute inset-0">
            {course.banner ? (
                <>
                    <img src={course.banner} className="w-full h-full object-cover opacity-20 blur-sm scale-110" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
                </>
            ) : (
                <NeuralBackground />
            )}
        </div>
        
        <div className="absolute top-6 left-6 z-20">
          <button 
            onClick={() => navigate('/courses')} 
            className="flex items-center gap-1.5 text-text/60 bg-card/40 hover:bg-card backdrop-blur-md px-5 py-2.5 rounded-full border border-border transition-all group font-black uppercase text-[10px] tracking-widest active:scale-95 shadow-lg"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" /> Back to Courses
          </button>
        </div>

        <div className="relative w-full p-6 md:p-12 z-10 pt-24 md:pt-32 max-w-7xl mx-auto">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3">
                <span className="bg-accent/10 text-accent text-[8px] font-black px-3 py-1 rounded-full border border-accent/20 tracking-widest uppercase backdrop-blur-md italic">
                    GfG Verified Course
                </span>
                <span className="bg-yellow-500/10 text-yellow-500 text-[8px] font-black px-3 py-1 rounded-full border border-yellow-500/20 tracking-widest uppercase backdrop-blur-md flex items-center gap-1.5 italic">
                    <FontAwesomeIcon icon={faStar} /> {course.rating} Rating
                </span>
                <span className="bg-blue-500/20 text-blue-300 text-[7px] font-bold px-3 py-1 rounded-full border border-blue-500/30 tracking-wider uppercase flex items-center gap-1.5 italic" title="Data fetched from GeeksforGeeks via HTTP">
                    📊 Fetched via HTTP
                </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }} 
              className="text-4xl md:text-7xl font-black text-text leading-[1] tracking-tighter uppercase max-w-4xl italic"
            >
              {course.title}
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-8 text-text/40 pt-4"
            >
              <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-[0.2em] italic">
                <FontAwesomeIcon icon={faUsers} className="text-accent" /> {course.registered}
              </div>
              <div className="h-4 w-[1px] bg-border hidden sm:block"></div>
              <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-[0.2em] italic text-accent">
                <FontAwesomeIcon icon={faCheckCircle} /> Certification Included
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mt-12 md:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          <div className="lg:col-span-2 space-y-16">
            
            {/* Description & Trailer */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {course.trailer ? (
                    <div className="relative aspect-video rounded-[3rem] overflow-hidden border-4 border-border shadow-2xl bg-card group">
                        {course.trailer.includes('youtube.com') || course.trailer.includes('youtu.be') ? (
                            <iframe 
                                src={course.trailer.replace('watch?v=', 'embed/')}
                                className="w-full h-full"
                                allowFullScreen
                                title="Course Trailer"
                            />
                        ) : course.trailer.endsWith('.m3u8') ? (
                            <HLSPlayer src={course.trailer} poster={course.thumbnail} />
                        ) : (
                            <video 
                                poster={course.thumbnail}
                                src={course.trailer}
                                controls
                                className="w-full h-full object-cover"
                            />
                        )}
                        <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-[2.8rem]"></div>
                    </div>
                ) : (
                    <div className="relative aspect-video rounded-[3rem] overflow-hidden border-4 border-border shadow-2xl bg-card group">
                        <img src={course.banner} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={course.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"></div>
                    </div>
                )}

                <div className="bg-card border border-border p-8 md:p-12 rounded-[3rem] shadow-xl italic relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -ml-16 -mt-16"></div>
                    <div className="relative z-10 prose prose-accent dark:prose-invert max-w-none text-text/70 text-lg leading-relaxed ql-editor !p-0" 
                         dangerouslySetInnerHTML={{ __html: course.description }} />
                </div>
            </motion.div>

            {/* Overview */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 rounded-2xl text-accent border border-accent/20 shadow-inner">
                        <FontAwesomeIcon icon={faBook} />
                    </div>
                    <h2 className="text-3xl font-black text-text uppercase italic tracking-tighter">Course <span className="text-accent">Overview</span></h2>
                </div>
                <div className="bg-card border border-border p-8 md:p-12 rounded-[3rem] shadow-xl italic relative overflow-hidden">
                    <div className="prose prose-accent dark:prose-invert max-w-none text-text/70 text-lg leading-relaxed ql-editor !p-0" 
                         dangerouslySetInnerHTML={{ __html: course.overview }} />
                </div>
            </motion.div>

            {/* Content / Syllabus */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 rounded-2xl text-accent border border-accent/20 shadow-inner">
                        <FontAwesomeIcon icon={faListUl} />
                    </div>
                    <h2 className="text-3xl font-black text-text uppercase italic tracking-tighter">Course <span className="text-accent">Content</span></h2>
                </div>
                <div className="space-y-4">
                    {Array.isArray(course.content) ? course.content.map((item: any, i: number) => (
                        <div key={i} className="bg-card border border-border rounded-3xl p-6 md:p-8 hover:border-accent transition-all group shadow-sm">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-background border border-border rounded-2xl flex items-center justify-center font-black text-accent shadow-inner">
                                    {i + 1}
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-xl font-black text-text uppercase italic tracking-tight group-hover:text-accent transition-colors">{item.name}</h4>
                                    <div className="text-text/50 text-sm leading-relaxed ql-editor !p-0 italic" dangerouslySetInnerHTML={{ __html: item.description }} />
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="bg-card border border-border p-8 rounded-[3rem] italic text-text/40 text-center" dangerouslySetInnerHTML={{ __html: course.content }} />
                    )}
                </div>
            </motion.div>

          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="bg-card border-2 border-accent/30 p-8 rounded-[3rem] shadow-2xl sticky top-24 space-y-10 overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div className="space-y-6 text-center relative z-10">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-text/30 uppercase tracking-[0.3em]">Special Offer</p>
                        <div className="flex items-center justify-center gap-3">
                            <p className="text-5xl font-black text-accent italic tracking-tighter">{course.price}</p>
                            {course.discount_percent > 0 && (
                                <span className="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg shadow-green-500/20">
                                    {course.discount_percent}% OFF
                                </span>
                            )}
                        </div>
                        {course.original_price && (
                            <p className="text-sm font-black text-text/20 uppercase tracking-widest line-through">
                                MRP: {course.original_price}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-center gap-2">
                        {[1,2,3,4,5].map(s => <FontAwesomeIcon key={s} icon={faStar} className="text-yellow-500 text-xs" />)}
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-border/50 relative z-10">
                    <a 
                        href={`https://www.geeksforgeeks.org/payments/${slug}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-5 rounded-2xl bg-accent text-white font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-accent/20 hover:bg-accent/80 transition-all active:scale-95"
                    >
                        Register Now <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </a>
                    <p className="text-[8px] font-black text-text/30 text-center uppercase tracking-widest italic">Official GeeksforGeeks Checkout</p>
                </div>

                <div className="space-y-6 pt-6 relative z-10">
                    <div className="flex items-center gap-4 text-text/60">
                        <div className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center text-accent"><FontAwesomeIcon icon={faUsers} /></div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest italic">{course.registered}</p>
                            <p className="text-[8px] font-bold text-text/30 uppercase">Popularity Index</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-text/60">
                        <div className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center text-accent"><FontAwesomeIcon icon={faCheckCircle} /></div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest italic">Lifetime Access</p>
                            <p className="text-[8px] font-bold text-text/30 uppercase">Neural Connection</p>
                        </div>
                    </div>
                </div>
            </motion.div>
          </div>

        </div>
      </section>

      <style>{`
        .ql-editor a { color: var(--color-accent); font-weight: 800; text-decoration: underline; }
        .ql-editor h1, .ql-editor h2, .ql-editor h3 { color: var(--color-text); font-weight: 900; margin-top: 1.2em; margin-bottom: 0.4em; text-transform: uppercase; }
        .ql-editor ul, .ql-editor ol { padding-left: 1.2em; margin-bottom: 0.8em; list-style: disc; }
        .ql-editor p { margin-bottom: 1em; }
        .dark .ql-editor *, .dark .ql-editor span { background-color: transparent !important; color: var(--color-text) !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 10px; opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default CourseDetail;
