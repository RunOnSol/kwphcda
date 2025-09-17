import React from "react";

const blogPosts = [
  {
    id: 1,
    title: "New Immunization Campaign Launches Across Kwara State",
    excerpt:
      "KWPHCDA rolls out comprehensive immunization program targeting under-five children across all 16 local government areas.",
    date: "15 May, 2025",
    imageUrl: "http://kwphcda.com.ng/image/post1.jpg",
    category: "Immunization",
  },
  {
    id: 2,
    title: "Maternal Health Services Expanded to Rural Communities",
    excerpt:
      "New initiative brings essential maternal health services closer to women in hard-to-reach communities of Kwara State.",
    date: "28 April, 2025",
    imageUrl: "http://kwphcda.com.ng/image/post2.jpg",
    category: "Maternal Health",
  },
  {
    id: 3,
    title:
      "KWPHCDA Partners with International Organizations for Health System Strengthening",
    excerpt:
      "New partnerships aim to enhance primary healthcare infrastructure and service delivery across the state.",
    date: "10 April, 2025",
    imageUrl: "http://kwphcda.com.ng/image/post3.jpg",
    category: "Partnerships",
  },
];

const BlogSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
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
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    {post.category}
                  </span>
                  <span className="text-sm text-gray-500">{post.date}</span>
                </div>

                <h3 className="text-xl font-semibold text-green-800 mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <button className="text-green-600 font-medium hover:text-green-800 transition-colors inline-flex items-center">
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
