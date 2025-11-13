import './Blog.css';
import blogData from './blogs.json';

import commentIcon from '../images/speech-bubble.png';
import streaks from '../images/streaks.png'

import { useState, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeSanitize from "rehype-sanitize";

export default function Blog() {
    // Step 1: Initialize state from localStorage
    const [currentTopic, setCurrentTopic] = useState(() => {
        return localStorage.getItem('currentTopic') || 'Science';
    });

    const [currentBlog, setCurrentBlog] = useState(() => {
        const savedBlogTitle = localStorage.getItem('currentBlogTitle');
        const topicToSearch = localStorage.getItem('currentTopic') || 'Science';

        if (savedBlogTitle && blogData[topicToSearch]) {
            const savedBlog = blogData[topicToSearch].find(blog => blog.title === savedBlogTitle);
            if (savedBlog) return savedBlog;
        }

        return blogData[topicToSearch][0];
    });

    const [blogContent, setBlogContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [blogSources, setBlogSources] = useState('');

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

    // Step 2: Save state changes to localStorage
    useEffect(() => {
        localStorage.setItem('currentTopic', currentTopic);
        if (currentBlog) {
            localStorage.setItem('currentBlogTitle', currentBlog.title);
        }
    }, [currentTopic, currentBlog]);

    const handleTopicClick = (topic) => {
        setCurrentTopic(topic);
        setCurrentBlog(blogData[topic] ? blogData[topic][0] : null);
    };

    const handleBlogClick = (blog) => {
        setCurrentBlog(blog);
    };

    // Step 3: The navigate logic has been removed.

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
                    <h2>Our {currentTopic} Blogs</h2>
                    <div>
                        {blogData[currentTopic] && blogData[currentTopic].map((blog, index) => (
                            <li 
                                key={index}
                                onClick={() => handleBlogClick(blog)}
                                className={currentBlog && currentBlog.title === blog.title ? "active-blog-item" : ""}
                            >
                                <p>{blog.title}</p>
                            </li>
                        ))}
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
                            <li onClick={() => handleTopicClick("Science")}>
                                <p className={(currentTopic === "Science" ? "current-topic" : "other-topic")}>
                                    Science
                                </p>
                            </li>
                            <li onClick={() => handleTopicClick("Technology")}>
                                <p className={(currentTopic === "Technology" ? "current-topic" : "other-topic")}>
                                    Technology
                                </p>
                            </li>
                            <li onClick={() => handleTopicClick("Engineering")}>
                                <p className={(currentTopic === "Engineering" ? "current-topic" : "other-topic")}>
                                    Engineering
                                </p>
                            </li>
                            <li onClick={() => handleTopicClick("Mathematics")}>
                                <p className={(currentTopic === "Mathematics" ? "current-topic" : "other-topic")}>
                                    Mathematics
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}