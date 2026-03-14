import pool from '../config/db.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const searchGfgResources = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: 'Query is required' });

  try {
    const results = [];
    
    // Strategy 1: Try WP API (most reliable for raw data)
    try {
        const wpApiUrl = `https://www.geeksforgeeks.org/wp-json/wp/v2/search?search=${encodeURIComponent(query)}&per_page=10`;
        const { data: wpData } = await axios.get(wpApiUrl);
        if (wpData && Array.isArray(wpData)) {
            wpData.forEach(item => {
                results.push({
                    title: item.title,
                    link: item.url,
                    snippet: 'Neural data synchronized from GfG Archives'
                });
            });
        }
    } catch (e) { console.error('WP API Search Failed'); }

    // Strategy 2: Scrape Explore Page (fallback if API is restricted)
    if (results.length === 0) {
        const exploreUrl = `https://www.geeksforgeeks.org/explore?search=${encodeURIComponent(query)}`;
        const { data: html } = await axios.get(exploreUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(html);
        $('.article-card, .search-result, article').each((i, el) => {
            const title = $(el).find('h2, .title, .entry-title, a').first().text().trim();
            const link = $(el).find('a').attr('href');
            if (title && link && link.startsWith('http')) {
                results.push({ title, link, snippet: 'Extracted from explore sector' });
            }
        });
    }

    // Strategy 3: Direct Search Scrape (fallback)
    if (results.length === 0) {
        const searchUrl = `https://www.geeksforgeeks.org/search/?gq=${encodeURIComponent(query)}`;
        const { data: html } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(html);
        const container = $('.SearchPageResults_searchPageContainer__wbmJa');
        
        container.find('a').each((i, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim();
            // Filter for actual article links
            if (href && href.includes('geeksforgeeks.org/') && text.length > 5 && !href.includes('/search/?')) {
                results.push({ title: text, link: href, snippet: 'Neural node detected in search sector' });
            }
        });
    }

    // Filter out irrelevant corporate and noise links
    const noiseKeywords = [
        'privacy policy', 'corporate solution', 'campus training', 
        'upskill courses', 'terms & conditions', 'contact us', 
        'advertise with us', 'practice problems', 'jobs', 'courses'
    ];

    const cleanResults = results.filter(res => {
        const titleLower = res.title.toLowerCase();
        return !noiseKeywords.some(keyword => titleLower.includes(keyword));
    });

    // Remove duplicates
    const uniqueResults = Array.from(new Set(cleanResults.map(a => a.link)))
        .map(link => cleanResults.find(a => a.link === link))
        .slice(0, 15);

    res.json(uniqueResults);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ message: 'Failed to synchronize with GfG Mainframe' });
  }
};

export const fetchGfgArticle = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ message: 'URL is required' });

  try {
    const { data: html } = await axios.get(url, {
        headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
    });

    const $ = cheerio.load(html);
    
    // Select the main article content based on the provided technical structure
    // Prioritize the deep nested .content inside the viewer
    let article = $('.article--viewer_content .content, .MainArticleContent_articleMainContentCss__b_1_R .content, .article-body, .article-content').first();
    
    // Fallback if specific classes are not present
    if (article.length === 0) {
        article = $('.a-wrapper .content, .entry-content, article').first();
    }

    // Extract title from the specific header wrapper
    const title = $('.ArticleHeader_article-title__futDC h1, h1').first().text().trim() || 'Neural Transmission';

    // Clean up unwanted elements before processing
    article.find(`
        .adsbygoogle, .sideBar, .rightSideBar, script, style, .social-share, 
        .improve-article, .article-author, .meta, .breadcrumb, .outbrain, 
        .copyright, .article-action, .copy-code-button, .article-header-extras,
        .ArticleThreeDot_threedotcontainer__dfGWD
    `).remove();
    
    // Ensure images have absolute URLs and are styled for our theme
    article.find('img').each((i, el) => {
        let src = $(el).attr('src') || $(el).attr('data-src');
        if (src && !src.startsWith('http')) {
            $(el).attr('src', 'https://www.geeksforgeeks.org' + (src.startsWith('/') ? '' : '/') + src);
        }
        $(el).removeAttr('srcset');
        $(el).addClass('rounded-[2.5rem] border-2 border-border my-12 shadow-2xl max-w-full h-auto mx-auto block');
    });

    // Handle code blocks
    article.find('pre, code, .code-container').each((i, el) => {
        $(el).addClass('bg-background border border-border p-6 rounded-2xl font-mono text-sm my-6 overflow-x-auto custom-scrollbar block');
    });

    // Fix links
    article.find('a').each((i, el) => {
        $(el).attr('target', '_blank');
        $(el).addClass('text-accent font-black hover:underline transition-all');
    });

    const content = article.html();

    res.json({ title, content });
  } catch (error) {
    console.error('Fetch error:', error.message);
    res.status(500).json({ message: 'Failed to extract data from target node' });
  }
};

export const getResources = async (req, res) => {
  const { category } = req.query;
  try {
    let sql = 'SELECT * FROM resources';
    const params = [];
    if (category && category !== 'All') {
      sql += ' WHERE category = ?';
      params.push(category);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createResource = async (req, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Core') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const { title, description, link, category } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO resources (title, description, link, category) VALUES (?, ?, ?, ?)',
      [title, description, link, category]
    );
    res.status(201).json({ id: result.insertId, title, description, link, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteResource = async (req, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Core') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  try {
    await pool.execute('DELETE FROM resources WHERE id = ?', [req.params.id]);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
