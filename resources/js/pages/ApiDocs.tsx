import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function ApiDocs() {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'authentication', title: 'Authentication' },
    { id: 'posts', title: 'Posts' },
    { id: 'comments', title: 'Comments' },
    { id: 'users', title: 'Users' },
    { id: 'categories', title: 'Categories' },
    { id: 'tags', title: 'Tags' },
    { id: 'search', title: 'Search' },
    { id: 'errors', title: 'Error Handling' },
  ];

  return (
    <>
      <Helmet>
        <title>API Documentation - BlogSite</title>
        <meta name="description" content="Complete API documentation for BlogSite's REST API." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">API Documentation</h1>
            <p className="text-xl text-gray-600">
              Complete reference for integrating with BlogSite's REST API
            </p>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Navigation */}
            <aside className="w-64 shrink-0">
              <div className="sticky top-6 bg-white rounded-lg shadow-sm p-4">
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {activeSection === 'introduction' && <Introduction />}
              {activeSection === 'authentication' && <Authentication />}
              {activeSection === 'posts' && <Posts />}
              {activeSection === 'comments' && <Comments />}
              {activeSection === 'users' && <Users />}
              {activeSection === 'categories' && <Categories />}
              {activeSection === 'tags' && <Tags />}
              {activeSection === 'search' && <Search />}
              {activeSection === 'errors' && <Errors />}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

// Section Components
function Introduction() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Introduction</h2>
      
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-6">
          Welcome to the BlogSite API documentation. Our REST API provides programmatic access to read and write BlogSite data.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Base URL</h3>
          <code className="bg-white px-3 py-1 rounded text-blue-800">
            https://api.blogsite.com/api
          </code>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-4">Key Features</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
          <li>RESTful architecture</li>
          <li>JSON request and response format</li>
          <li>OAuth 2.0 authentication</li>
          <li>Rate limiting to ensure fair usage</li>
          <li>Comprehensive error messages</li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mb-4">Rate Limits</h3>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Endpoint Type</th>
                <th className="text-left py-2">Rate Limit</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">Public endpoints</td>
                <td className="py-2">60 requests/minute</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Authenticated endpoints</td>
                <td className="py-2">120 requests/minute</td>
              </tr>
              <tr>
                <td className="py-2">Write operations</td>
                <td className="py-2">30 requests/minute</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
        <p className="text-gray-600">
          For questions or support, please <Link to="/contact" className="text-blue-600 hover:underline">contact our support team</Link>.
        </p>
      </div>
    </div>
  );
}

function Authentication() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Authentication</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Register</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-green-600 font-bold">POST</span> /register
            </code>
          </div>
          <p className="text-gray-600 mb-4">Create a new user account.</p>
          
          <h4 className="font-semibold text-gray-900 mb-2">Request Body</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-4">
{`{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "SecurePassword123",
  "password_confirmation": "SecurePassword123"
}`}
          </pre>

          <h4 className="font-semibold text-gray-900 mb-2">Response (201 Created)</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
{`{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "created_at": "2026-02-16T10:00:00.000000Z"
  },
  "token": "1|abcdef123456..."
}`}
          </pre>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Login</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-green-600 font-bold">POST</span> /login
            </code>
          </div>
          
          <h4 className="font-semibold text-gray-900 mb-2">Request Body</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-4">
{`{
  "email": "john@example.com",
  "password": "SecurePassword123"
}`}
          </pre>

          <h4 className="font-semibold text-gray-900 mb-2">Response (200 OK)</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
{`{
  "user": { /* user object */ },
  "token": "2|xyz789..."
}`}
          </pre>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Using the Token</h3>
          <p className="text-gray-600 mb-4">
            Include the token in the Authorization header for authenticated requests:
          </p>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
{`Authorization: Bearer YOUR_TOKEN_HERE`}
          </pre>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Logout</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-green-600 font-bold">POST</span> /logout
            </code>
          </div>
          <p className="text-gray-600">Invalidates the current access token.</p>
        </section>
      </div>
    </div>
  );
}

function Posts() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Posts</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">List Posts</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-blue-600 font-bold">GET</span> /posts
            </code>
          </div>
          
          <h4 className="font-semibold text-gray-900 mb-2">Query Parameters</h4>
          <table className="w-full border rounded-lg mb-4">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 border-b">Parameter</th>
                <th className="text-left p-3 border-b">Type</th>
                <th className="text-left p-3 border-b">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3"><code>page</code></td>
                <td className="p-3">integer</td>
                <td className="p-3">Page number (default: 1)</td>
              </tr>
              <tr className="border-b">
                <td className="p-3"><code>per_page</code></td>
                <td className="p-3">integer</td>
                <td className="p-3">Results per page (default: 15, max: 100)</td>
              </tr>
              <tr className="border-b">
                <td className="p-3"><code>status</code></td>
                <td className="p-3">string</td>
                <td className="p-3">Filter by status: draft, published</td>
              </tr>
            </tbody>
          </table>

          <h4 className="font-semibold text-gray-900 mb-2">Response (200 OK)</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
{`{
  "data": [
    {
      "id": 1,
      "title": "Getting Started with React",
      "slug": "getting-started-with-react",
      "excerpt": "Learn the basics of React...",
      "status": "published",
      "published_at": "2026-02-15T10:00:00.000000Z",
      "author": {
        "id": 1,
        "name": "John Doe",
        "username": "johndoe"
      },
      "category": {
        "id": 1,
        "name": "Technology",
        "slug": "technology"
      },
      "tags": [
        { "id": 1, "name": "React", "slug": "react" }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "per_page": 15,
    "total": 150
  }
}`}
          </pre>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Get Single Post</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-blue-600 font-bold">GET</span> /posts/{`{post}`}
            </code>
          </div>
          <p className="text-gray-600 mb-4">Retrieve a single post by ID or slug.</p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Create Post</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-green-600 font-bold">POST</span> /posts
            </code>
            <span className="ml-4 text-sm text-orange-600">🔒 Requires Authentication</span>
          </div>

          <h4 className="font-semibold text-gray-900 mb-2">Request Body</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
{`{
  "title": "My New Post",
  "slug": "my-new-post",
  "content": "Post content here...",
  "excerpt": "Brief summary...",
  "status": "published",
  "category_id": 1,
  "tag_ids": [1, 2, 3],
  "is_premium": false
}`}
          </pre>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Update Post</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-yellow-600 font-bold">PUT</span> /posts/{`{post}`}
            </code>
            <span className="ml-4 text-sm text-orange-600">🔒 Requires Authentication</span>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Post</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-red-600 font-bold">DELETE</span> /posts/{`{post}`}
            </code>
            <span className="ml-4 text-sm text-orange-600">🔒 Requires Authentication</span>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Trending Posts</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-blue-600 font-bold">GET</span> /posts/trending
            </code>
          </div>
          <p className="text-gray-600">Get trending posts based on views and engagement.</p>
        </section>
      </div>
    </div>
  );
}

function Comments() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Comments</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">List Comments</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-blue-600 font-bold">GET</span> /posts/{`{post}`}/comments
            </code>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Create Comment</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-green-600 font-bold">POST</span> /posts/{`{post}`}/comments
            </code>
            <span className="ml-4 text-sm text-orange-600">🔒 Requires Authentication</span>
          </div>

          <h4 className="font-semibold text-gray-900 mb-2">Request Body</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
{`{
  "content": "Great article!",
  "parent_id": null
}`}
          </pre>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Guest Comment</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-green-600 font-bold">POST</span> /comments/guest
            </code>
          </div>
          <p className="text-gray-600 mb-4">Allows unauthenticated users to comment.</p>

          <h4 className="font-semibold text-gray-900 mb-2">Request Body</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
{`{
  "post_id": 1,
  "name": "Guest User",
  "email": "guest@example.com",
  "content": "Nice post!",
  "parent_id": null
}`}
          </pre>
        </section>
      </div>
    </div>
  );
}

function Users() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Users</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Get User Profile</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-blue-600 font-bold">GET</span> /users/{`{identifier}`}
            </code>
          </div>
          <p className="text-gray-600">Get user by ID or username.</p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Get User Posts</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-blue-600 font-bold">GET</span> /users/{`{identifier}`}/posts
            </code>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Follow User</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-green-600 font-bold">POST</span> /users/{`{user}`}/follow
            </code>
            <span className="ml-4 text-sm text-orange-600">🔒 Requires Authentication</span>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Unfollow User</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-red-600 font-bold">DELETE</span> /users/{`{user}`}/unfollow
            </code>
            <span className="ml-4 text-sm text-orange-600">🔒 Requires Authentication</span>
          </div>
        </section>
      </div>
    </div>
  );
}

function Categories() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Categories</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">List Categories</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-blue-600 font-bold">GET</span> /categories
            </code>
          </div>

          <h4 className="font-semibold text-gray-900 mb-2">Response (200 OK)</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
{`[
  {
    "id": 1,
    "name": "Technology",
    "slug": "technology",
    "color": "#3B82F6",
    "posts_count": 42
  }
]`}
          </pre>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Get Category Posts</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-blue-600 font-bold">GET</span> /categories/{`{slug}`}/posts
            </code>
          </div>
        </section>
      </div>
    </div>
  );
}

function Tags() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Tags</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">List Tags</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-blue-600 font-bold">GET</span> /tags
            </code>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Tag Cloud</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-blue-600 font-bold">GET</span> /tags/cloud
            </code>
          </div>
          <p className="text-gray-600">Get popular tags with post counts.</p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Tag Suggestions</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-blue-600 font-bold">GET</span> /tags/suggestions?query={`{query}`}
            </code>
          </div>
        </section>
      </div>
    </div>
  );
}

function Search() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Search</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Search Posts</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm">
              <span className="text-blue-600 font-bold">GET</span> /search
            </code>
          </div>

          <h4 className="font-semibold text-gray-900 mb-2">Query Parameters</h4>
          <table className="w-full border rounded-lg mb-4">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 border-b">Parameter</th>
                <th className="text-left p-3 border-b">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3"><code>query</code></td>
                <td className="p-3">Search term</td>
              </tr>
              <tr className="border-b">
                <td className="p-3"><code>categoryId</code></td>
                <td className="p-3">Filter by category</td>
              </tr>
              <tr className="border-b">
                <td className="p-3"><code>tagIds</code></td>
                <td className="p-3">Filter by tags (comma-separated)</td>
              </tr>
              <tr className="border-b">
                <td className="p-3"><code>sortBy</code></td>
                <td className="p-3">Sort: date, views, likes, relevance</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

function Errors() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Error Handling</h2>

      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">HTTP Status Codes</h3>
          <table className="w-full border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 border-b">Code</th>
                <th className="text-left p-3 border-b">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3"><code>200</code></td>
                <td className="p-3">Success</td>
              </tr>
              <tr className="border-b">
                <td className="p-3"><code>201</code></td>
                <td className="p-3">Created</td>
              </tr>
              <tr className="border-b">
                <td className="p-3"><code>400</code></td>
                <td className="p-3">Bad Request</td>
              </tr>
              <tr className="border-b">
                <td className="p-3"><code>401</code></td>
                <td className="p-3">Unauthorized</td>
              </tr>
              <tr className="border-b">
                <td className="p-3"><code>403</code></td>
                <td className="p-3">Forbidden</td>
              </tr>
              <tr className="border-b">
                <td className="p-3"><code>404</code></td>
                <td className="p-3">Not Found</td>
              </tr>
              <tr className="border-b">
                <td className="p-3"><code>422</code></td>
                <td className="p-3">Validation Error</td>
              </tr>
              <tr className="border-b">
                <td className="p-3"><code>429</code></td>
                <td className="p-3">Too Many Requests</td>
              </tr>
              <tr>
                <td className="p-3"><code>500</code></td>
                <td className="p-3">Internal Server Error</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Error Response Format</h3>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
{`{
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}`}
          </pre>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Rate Limit Headers</h3>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
{`X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1645012800`}
          </pre>
        </section>
      </div>
    </div>
  );
}