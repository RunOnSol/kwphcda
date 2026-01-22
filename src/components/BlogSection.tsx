import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { getAllBlogPosts } from '../lib/supabase';
import { BlogPost } from '../types';
import { format } from 'date-fns';


const BlogSection = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await getAllBlogPosts();
      if (error) throw error;
      
      // Filter only published posts and limit to 3 most recent
      const publishedPosts = (data || [])
        .filter(post => post.status === 'published')
        .slice(0, 3);
      
      setBlogPosts(publishedPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReadMore = (postId: string) => {
    navigate(`/blog/${postId}`);
  };

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-green-800 text-center mb-12">
            Latest News & Updates
          </h2>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4" >
      <div className="container mx-auto" id="blogsec">
        <h2 className="text-3xl font-bold text-green-800 text-center mb-12">
          Latest News & Updates
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={post.image_url || 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg'}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    {post.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(post.created_at), 'dd MMM, yyyy')}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-green-800 mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <button 
                  onClick={() => handleReadMore(post.id)}
                  className="text-green-600 font-medium hover:text-green-800 transition-colors inline-flex items-center"
                >
                  Read More
                  <svg
                    className="w-4 h-4 ml-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {blogPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No blog posts available at the moment.</p>
          </div>
        )}

        <div className="text-center mt-10">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-300">
            View All News
          </button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
