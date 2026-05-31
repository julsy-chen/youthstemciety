import './Blog.css';
import blogData from './blogs.json';
import streaks from '../images/streaks.png'

import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeSanitize from "rehype-sanitize";

const TOPICS = Object.keys(blogData);
const DEFAULT_TOPIC = TOPICS.find((topic) => (blogData[topic] || []).length > 0) || TOPICS[0] || '';

const topicToSlug = (topic) => topic.toLowerCase();

const titleToSlug = (value = '') =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const blogToSlug = (blog) => {
    if (blog?.slug) {
        return blog.slug;
    }

    if (blog?.filePath) {
        const fileName = blog.filePath.split('/').pop() || '';
        return fileName.replace(/\.[^/.]+$/, '');
    }

    return titleToSlug(blog?.title || '');
};

const buildBlogPath = (topic, blog) => `/blogs/${topicToSlug(topic)}/${blogToSlug(blog)}`;

export default function Blog() {
    const navigate = useNavigate();
    const { topicSlug, postSlug } = useParams();

    const [currentTopic, setCurrentTopic] = useState(DEFAULT_TOPIC);
    const [currentBlog, setCurrentBlog] = useState(() => {
        const initialBlogs = blogData[DEFAULT_TOPIC] || [];
        return initialBlogs[0] || null;
    });

    const [blogContent, setBlogContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [blogSources, setBlogSources] = useState('');
    useEffect(() => {
        if (!DEFAULT_TOPIC) {
            setCurrentTopic('');
            setCurrentBlog(null);
            return;
        }

        const matchedTopic = TOPICS.find((topic) => topicToSlug(topic) === topicSlug);
        const resolvedTopic = matchedTopic || DEFAULT_TOPIC;
        const blogsForTopic = blogData[resolvedTopic] || [];
        const matchedBlog = postSlug
            ? blogsForTopic.find((blog) => blogToSlug(blog) === postSlug)
            : null;
        const resolvedBlog = matchedBlog || blogsForTopic[0] || null;

        setCurrentTopic(resolvedTopic);
        setCurrentBlog(resolvedBlog);

        if (resolvedBlog) {
            const resolvedTopicSlug = topicToSlug(resolvedTopic);
            const resolvedBlogSlug = blogToSlug(resolvedBlog);
            if (topicSlug !== resolvedTopicSlug || postSlug !== resolvedBlogSlug) {
                navigate(`/blogs/${resolvedTopicSlug}/${resolvedBlogSlug}`, { replace: true });
            }
        } else {
            const resolvedTopicSlug = topicToSlug(resolvedTopic);
            if (topicSlug !== resolvedTopicSlug || postSlug) {
                navigate(`/blogs/${resolvedTopicSlug}`, { replace: true });
            }
        }
    }, [topicSlug, postSlug, navigate]);

    useEffect(() => {
        setIsLoading(true);
        setBlogContent('');
        setBlogSources('');
        if (currentBlog?.filePath) {
            // This blog's content is in a separate file, so we fetch it.
            fetch(process.env.PUBLIC_URL + currentBlog.filePath) // Use PUBLIC_URL for deployment
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.text();
                })
                .then(text => {
                // This is the string we are searching for. It must match EXACTLY.
                    const delimiter = '---SOURCES---';
                    
                    if (text.includes(delimiter)) {
                        // If the delimiter is found, split the content
                        const parts = text.split(delimiter);
                        const mainContent = parts[0].trim(); // .trim() removes extra newlines
                        const sourcesContent = parts[1].trim();
                        
                        setBlogContent(mainContent);
                        setBlogSources(sourcesContent);
                    } else {
                        // THIS IS WHAT IS HAPPENING NOW:
                        // If no delimiter is found, the whole file becomes the content.
                        setBlogContent(text);
                        setBlogSources('');
                    }
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching or parsing blog content:", error);
                    setBlogContent("Failed to load blog post.");
                    setBlogSources('');
                    setIsLoading(false);
                });
        } else if (currentBlog?.content) {
            // This blog's content is directly in the JSON, so we just use it.
            setBlogContent(currentBlog.content);
            setIsLoading(false);
        } else {
            // Handle cases where a blog might not have content or a file path
            setBlogContent('');
            setIsLoading(false);
        }
    }, [currentBlog]);

    const currentTopicBlogs = blogData[currentTopic] || [];

    return(
        <div className="Blog">
            <div className="blog-banner">
                <img className="backdrop" src={streaks} alt="" />
                <h1>OUR BLOGS</h1>
            </div>
            <div className="blog-description">
                <p>
                    Our student researched and written blogs present an opportunity for learning on both their and our audience’s end! Read them to stay informed, learn new concepts, and explore the world of science, tech, engineering, and math!
                </p>
                <hr className="solid"/>
            </div>
            <div className="blog-page-body">
                <div className="topic-all-blogs">
                    <h2>{currentTopic ? `Our ${currentTopic} Blogs` : 'Our Blogs'}</h2>
                    <div>
                        {currentTopicBlogs.map((blog, index) => {
                            const blogSlug = blogToSlug(blog);
                            const isActiveBlog = currentBlog && blogToSlug(currentBlog) === blogSlug;

                            return (
                                <li 
                                    key={`${blogSlug}-${index}`}
                                    className={isActiveBlog ? "active-blog-item" : ""}
                                >
                                    <NavLink to={buildBlogPath(currentTopic, blog)} className="blog-nav-link">
                                        <p>{blog.title}</p>
                                    </NavLink>
                                </li>
                            );
                        })}
                    </div>
                </div>

                <div className="blog-content">
                    
                    {currentBlog ? (
                        <>
                            <div className="blog-title">
                                <h1>{currentBlog.title}</h1>
                            </div>
                            <div className="blog-numbers">
                                <p>{currentBlog.date} — {currentBlog.author}</p>
                            </div>
                            <hr className="solid"/>
                            <div className="blog-text">
                                {isLoading ? (
                                        <p>Loading...</p>
                                    ) : (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm, remarkBreaks]}
                                            rehypePlugins={[rehypeSanitize]}
                                        >
                                            {blogContent}
                                        </ReactMarkdown>
                                )}
                            </div>
                            <div className="blog-citations">
                                {blogSources && (
                                    <>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm, remarkBreaks]}
                                            rehypePlugins={[rehypeSanitize]}
                                        >
                                            {blogSources}
                                        </ReactMarkdown>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        // If no blog is selected (because the topic is empty), show this placeholder
                        <div className="no-blogs-placeholder-main">
                            <h1>Coming Soon!</h1>
                            <p>There are no blogs in our {currentTopic} category yet, but our team is hard at work. Please check back later for new content!</p>
                        </div>
                    )}
                </div>

                <div className="topics-and-comments">
                    <div className="topic-selection">
                        <h2>Topics</h2>
                        <ul className ="topic-list">
                            {TOPICS.map((topic) => {
                                const firstBlog = (blogData[topic] || [])[0] || null;
                                const topicPath = firstBlog
                                    ? buildBlogPath(topic, firstBlog)
                                    : `/blogs/${topicToSlug(topic)}`;

                                return (
                                    <li key={topic}>
                                        <NavLink to={topicPath} className="topic-nav-link">
                                            <p className={(currentTopic === topic ? "current-topic" : "other-topic")}>
                                                {topic}
                                            </p>
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}