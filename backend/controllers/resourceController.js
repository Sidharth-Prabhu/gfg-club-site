import admin, { db } from '../config/firebase.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const searchGfgResources = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: 'Query is required' });

  try {
    // Use GfG search URL with proper headers
    const searchUrl = `https://www.geeksforgeeks.org/search/?gq=${encodeURIComponent(query)}`;
    const { data: html } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
        'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1'
      },
      timeout: 15000
    });

    const $ = cheerio.load(html);
    const results = [];
    const seenLinks = new Set();

    // Target the specific container class provided
    const container = $('.SearchPageResults_searchPageContainer__wbmJa, [class*="SearchPageResults"], [class*="searchPageContainer"]');

    if (container.length === 0) {
      // Fallback: search all article links on the page
      $('a[href*="/search/?gq="]').each((i, el) => {
        // Skip the search query links themselves
        if ($(el).attr('href')?.includes('/search/?gq=')) return;
        
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        const imgSrc = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');

        if (href && 
            href.includes('geeksforgeeks.org') && 
            !href.includes('/search/?') &&
            !href.includes('/login') &&
            !href.includes('/signup') &&
            text.length > 5 && 
            text.length < 300 &&
            !seenLinks.has(href)) {
          
          seenLinks.add(href);
          results.push({ 
            title: text, 
            link: href.startsWith('http') ? href : `https://www.geeksforgeeks.org${href}`,
            image: imgSrc && imgSrc.startsWith('http') ? imgSrc : null,
            snippet: 'Fetched from GeeksforGeeks search' 
          });
        }
      });
    } else {
      // Parse the specific container
      container.find('a, article, .article-card, [class*="card"]').each((i, el) => {
        const href = $(el).attr('href') || $(el).find('a').attr('href');
        const text = $(el).find('h1, h2, h3, h4, h5, h6, .title, [class*="title"]').first().text().trim() || $(el).text().trim();
        const imgSrc = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src');

        if (href && 
            href.includes('geeksforgeeks.org') && 
            !href.includes('/search/?') &&
            !href.includes('/login') &&
            !href.includes('/signup') &&
            text.length > 5 && 
            text.length < 300 &&
            !seenLinks.has(href)) {
          
          seenLinks.add(href);
          results.push({ 
            title: text, 
            link: href.startsWith('http') ? href : `https://www.geeksforgeeks.org${href}`,
            image: imgSrc && imgSrc.startsWith('http') ? imgSrc : null,
            snippet: 'Fetched from GeeksforGeeks search' 
          });
        }
      });
    }

    // If still no results, try a broader search
    if (results.length === 0) {
      $('a[href*="geeksforgeeks.org"]').each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        const imgSrc = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');

        if (href && 
            !href.includes('/search/?') &&
            !href.includes('/login') &&
            !href.includes('/signup') &&
            !href.includes('privacy') &&
            !href.includes('terms') &&
            !href.includes('contact') &&
            text.length > 10 && 
            text.length < 300 &&
            !seenLinks.has(href)) {
          
          seenLinks.add(href);
          results.push({ 
            title: text, 
            link: href,
            image: imgSrc && imgSrc.startsWith('http') ? imgSrc : null,
            snippet: 'Fetched from GeeksforGeeks' 
          });
        }

        if (results.length >= 20) return false;
      });
    }

    // Filter noise
    const noiseKeywords = [
      'privacy policy', 'corporate solution', 'campus training',
      'upskill courses', 'terms & conditions', 'contact us',
      'advertise with us', 'jobs', 'courses', 'login', 'signup',
      'subscribe', 'cookie policy', 'careers'
    ];

    const cleanResults = results.filter(res => {
      const titleLower = res.title.toLowerCase();
      return !noiseKeywords.some(keyword => titleLower.includes(keyword));
    });

    // Return top 20 unique results
    const uniqueResults = Array.from(new Set(cleanResults.map(a => a.link)))
      .map(link => cleanResults.find(a => a.link === link))
      .slice(0, 20);

    if (uniqueResults.length === 0) {
      return res.json([{
        title: `No results found for "${query}"`,
        link: `https://www.geeksforgeeks.org/search/?gq=${encodeURIComponent(query)}`,
        image: null,
        snippet: 'Try searching directly on GeeksforGeeks website'
      }]);
    }

    res.json(uniqueResults);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ 
      message: 'Failed to fetch from GeeksforGeeks',
      error: error.message 
    });
  }
};

export const fetchGfgArticle = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ message: 'URL is required' });

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
      },
      timeout: 15000
    });

    const $ = cheerio.load(html);

    // Target the specific main article container provided
    let article = $('.MainArticleContent_articleMainContentCss__b_1_R .content, .MainArticleContent_articleMainContentCss__b_1_R').first();

    // Fallback if specific classes are not present
    if (article.length === 0) {
      article = $('.article-content, .entry-content, article').first();
    }

    // Extract title
    const title = $('.ArticleHeader_article-title__futDC h1, h1[class*="title"], .entry-title').first().text().trim() || 'Article';

    // Extract article metadata
    const author = $('.ArticleHeader_authorName__aCkXP, [class*="author"], .byline').first().text().trim();
    const readTime = $('[class*="readTime"], [class*="read-time"]').first().text().trim();

    // Clean up unwanted elements
    article.find(`
      .adsbygoogle, .ad, .advertisement, .sideBar, .rightSideBar, .leftSideBar,
      script, style, .social-share, .improve-article, .article-author, .meta,
      .breadcrumb, .outbrain, .taboola, .copyright, .article-action, .copy-code-button,
      .ArticleThreeDot_threedotcontainer__dfGWD, .nav, .header, .footer,
      [class*="ad-"], [class*="ads"], .related-articles, .recommended
    `).remove();

    // Process images - ensure absolute URLs and proper styling
    article.find('img').each((i, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-srcset');
      if (src && !src.startsWith('http')) {
        $(el).attr('src', 'https://www.geeksforgeeks.org' + (src.startsWith('/') ? '' : '/') + src);
      }
      $(el).removeAttr('srcset');
      $(el).removeAttr('loading');
      $(el).addClass('max-w-full h-auto rounded-2xl border-2 border-border my-6 shadow-lg');
      $(el).attr('style', 'display: block; margin: 1.5rem auto;');
    });

    // Process code blocks
    article.find('pre, code, .code-container, .syntaxhighlighter').each((i, el) => {
      $(el).addClass('bg-background border-2 border-border p-6 rounded-2xl font-mono text-sm my-6 overflow-x-auto custom-scrollbar block');
    });

    // Process tables
    article.find('table').each((i, el) => {
      $(el).addClass('w-full border-collapse border-2 border-border my-6');
      $(el).find('th, td').addClass('border border-border p-3');
      $(el).find('th').addClass('bg-accent/10 font-black text-accent');
    });

    // Process links
    article.find('a').each((i, el) => {
      $(el).attr('target', '_blank');
      $(el).attr('rel', 'noopener noreferrer');
      $(el).addClass('text-accent font-black hover:underline transition-all');
    });

    // Process headings
    article.find('h1, h2, h3, h4, h5, h6').each((i, el) => {
      $(el).addClass('text-text font-black uppercase italic tracking-tight my-4');
    });
    article.find('h1').addClass('text-3xl md:text-4xl');
    article.find('h2').addClass('text-2xl md:text-3xl');
    article.find('h3').addClass('text-xl md:text-2xl');

    // Process paragraphs
    article.find('p').each((i, el) => {
      $(el).addClass('text-text/80 text-sm md:text-base leading-relaxed font-medium my-4');
    });

    // Process lists
    article.find('ul, ol').each((i, el) => {
      $(el).addClass('my-4 ml-6 space-y-2');
    });
    article.find('li').each((i, el) => {
      $(el).addClass('text-text/80 text-sm md:text-base leading-relaxed');
    });

    // Process blockquotes
    article.find('blockquote').each((i, el) => {
      $(el).addClass('border-l-4 border-accent pl-6 italic text-text/70 my-6 bg-accent/5 py-4 pr-4 rounded-r-xl');
    });

    const content = article.html();

    res.json({ 
      title, 
      content,
      author: author || null,
      readTime: readTime || null,
      url
    });
  } catch (error) {
    console.error('Fetch error:', error.message);
    res.status(500).json({ 
      message: 'Failed to extract article content',
      error: error.message 
    });
  }
};

export const fetchGfgCourses = async (req, res) => {
  try {
    const { category, search } = req.query;
    let url = 'https://www.geeksforgeeks.org/courses';

    if (category && category !== 'all') {
        url = `https://www.geeksforgeeks.org/courses/category/${category}`;
    } else if (search) {
        url = `https://www.geeksforgeeks.org/courses?search=${encodeURIComponent(search)}`;
    }

    const { data: html } = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
        }
    });

    const $ = cheerio.load(html);
    const nextDataHtml = $('#__NEXT_DATA__').html();

    if (!nextDataHtml) {
        throw new Error('Could not find __NEXT_DATA__ payload');
    }

    const nextData = JSON.parse(nextDataHtml);

    let coursesData = [];

    // Recursive search for ANY array that contains course-like objects
    const findCourseArrays = (obj) => {
        if (Array.isArray(obj)) {
            if (obj.length > 0 && obj[0].course_id) return [obj];
            let results = [];
            for (const item of obj) {
                results = results.concat(findCourseArrays(item));
            }
            return results;
        } else if (typeof obj === 'object' && obj !== null) {
            let results = [];
            for (const k in obj) {
                results = results.concat(findCourseArrays(obj[k]));
            }
            return results;
        }
        return [];
    };

    const arrays = findCourseArrays(nextData.props.pageProps);
    // Use the largest array found which likely contains the main course list
    if (arrays.length > 0) {
        coursesData = arrays.reduce((prev, current) => prev.length > current.length ? prev : current);
    }

    const courses = coursesData.map(c => {
        let rating = '4.8';
        if (c.rating) {
            if (typeof c.rating === 'object') {
                rating = String(c.rating.avg_rating || '4.8');
            } else {
                rating = String(c.rating);
            }
        }

        let price = 'Check Site';
        if (c.price && c.price.batch_fee) {
            price = `${c.currency_symbol || '₹'}${c.price.batch_fee}`;
        } else if (c.course_type === 'Free' || c.free) {
            price = 'Free';
        }

        return {
            title: String(c.course_name || c.title || 'Untitled Course'),
            rating: rating,
            image: String(c.small_banner || c.large_banner || c.mobile_banner || c.course_feature_image || c.image || 'https://media.geeksforgeeks.org/img-practice/prod/courses/234567890/Web/Header/defaultSmallBanner_1709272509.png'),
            price: price,
            registered: c.visit_count ? `${c.visit_count} interested` : (c.course_registered_count ? `${(c.course_registered_count / 1000).toFixed(1)}k+ students` : 'Highly Rated'),
            link: `https://www.geeksforgeeks.org/courses/${c.course_slug || c.slug}`,
            slug: c.course_slug || c.slug
        };
    });

    res.json(courses.slice(0, 24));
  } catch (error) {
    console.error('Course fetch error:', error.message);
    res.status(500).json({ message: 'Failed to synchronize with GfG Course Sector' });
  }
};

export const fetchGfgCourseDetail = async (req, res) => {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ message: 'Slug is required' });

  try {
    const url = `https://www.geeksforgeeks.org/courses/${slug}`;
    const { data: html } = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
    });

    const $ = cheerio.load(html);
    const nextDataHtml = $('#__NEXT_DATA__').html();

    if (!nextDataHtml) {
        throw new Error('Could not find __NEXT_DATA__ payload');
    }

    const nextData = JSON.parse(nextDataHtml);

    // Recursive search for the course detail object (main data)
    const findCourseDetail = (obj) => {
        if (obj && obj.course_id && obj.course_name && obj.course_overview) return obj;
        if (typeof obj === 'object' && obj !== null) {
            for (let k in obj) {
                const found = findCourseDetail(obj[k]);
                if (found) return found;
            }
        }
        return null;
    };

    // Find detailed pricing which is often nested in RTK query cache
    const findPricing = (obj) => {
        if (obj && obj.batch_fee !== undefined && obj.promotional_fee !== undefined) return obj;
        if (typeof obj === 'object' && obj !== null) {
            for (let k in obj) {
                const found = findPricing(obj[k]);
                if (found) return found;
            }
        }
        return null;
    };

    const detail = findCourseDetail(nextData.props.pageProps);
    const pricing = findPricing(nextData.props.pageProps);

    // Trailer Logic: Specifically check for video/iframe in the requested container
    const leftCol = $('.courseCard_card__bdkG_ .courseCard_leftcolumn__xfME9, .courseCard_leftcolumn__xfME9');
    let trailer = null;

    const videoSrc = leftCol.find('video source').attr('src') || leftCol.find('video').attr('src');
    const iframeSrc = leftCol.find('iframe').attr('src');

    if (videoSrc) trailer = videoSrc;
    else if (iframeSrc) trailer = iframeSrc;
    else if (detail?.intro_video_link?.link) trailer = detail.intro_video_link.link;

    const originalPrice = pricing?.promotional_fee || detail?.price?.promotional_fee || null;
    const batchFee = pricing?.batch_fee || detail?.price?.batch_fee || detail?.first_upcoming_batch?.batch_fee || 0;
    const discountPercent = (originalPrice && batchFee) ? Math.round(((originalPrice - batchFee) / originalPrice) * 100) : 0;

    if (!detail) {
        // Fallback to basic HTML scraping
        const title = $('h1').first().text().trim() || slug;
        const description = $('.courseCard_card__bdkG_ .courseCard_details__uzX2H').html() || $('.courseCard_card__bdkG_').html() || '';
        const overview = $('.courseOverview_overview__J_eul').html() || '';
        const content = $('.coursesSlug_course_content_container__4GwEh').html() || '';

        return res.json({
            title,
            description,
            overview,
            content,
            trailer,
            price: batchFee ? `₹${batchFee}` : 'Check Site',
            original_price: originalPrice ? `₹${originalPrice}` : null,
            discount_percent: discountPercent,
            rating: '4.8',
            registered: 'Highly Rated'
        });
    }

    res.json({
        title: detail.course_name,
        description: detail.short_description,
        overview: detail.course_overview,
        content: detail.course_content_list || [],
        trailer: trailer,
        thumbnail: detail.intro_video_link?.thumbnail_image || null,
        banner: detail.large_banner || detail.small_banner || detail.mobile_banner || 'https://media.geeksforgeeks.org/img-practice/prod/courses/234567890/Web/Header/defaultSmallBanner_1709272509.png',
        price: batchFee ? `${detail.currency_symbol || '₹'}${batchFee}` : 'Check Site',
        original_price: originalPrice ? `${detail.currency_symbol || '₹'}${originalPrice}` : null,
        discount_percent: discountPercent,
        rating: detail.rating?.avg_rating || '4.8',
        registered: detail.visit_count || 'Highly Rated'
    });

  } catch (error) {
    console.error('Course Detail fetch error:', error.message);
    res.status(500).json({ message: 'Failed to extract neural node data for this course' });
  }
};

export const getResources = async (req, res) => {
  const { category } = req.query;
  
  try {
    let query = db.collection('resources');
    
    if (category && category !== 'All') {
      query = query.where('category', '==', category);
    }
    
    query = query.orderBy('created_at', 'desc');
    
    const snapshot = await query.get();
    
    const resources = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createResource = async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Only Admins can deploy global nodes' });
  }
  
  const { title, description, link, category } = req.body;
  
  try {
    const resourceRef = db.collection('resources').doc();
    const resourceData = {
      title,
      description: description || null,
      link,
      category: category || null,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await resourceRef.set(resourceData);
    
    res.status(201).json({ id: resourceRef.id, title, description, link, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteResource = async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Only Admins can terminate global nodes' });
  }
  
  try {
    await db.collection('resources').doc(req.params.id).delete();
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
