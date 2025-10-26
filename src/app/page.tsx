'use client'; 
import { trpc } from './_trpc/client';
import Link from 'next/link';
import { useState } from 'react';
import { PostCard } from '@/components/PostCard'; 
import styles from './HomePage.module.css'; 

export default function HomePage() {
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(undefined);

  const { data: categories } = trpc.category.getAll.useQuery();
  const { data: posts, isLoading, isError, error } = trpc.post.getAll.useQuery({
    categoryId: activeCategoryId,
  });
  
  return (
    <main className={`min-h-screen bg-gray-50 ${styles.mainContainer}`}>
      <header className={styles.heroHeader}>
        <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight">
            <span className="text-indigo-600">Welcome to BlogPost</span>
        </h1>
        <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
            Explore articles, manage content, and refine your craft.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
            <Link 
                href="/dashboard" 
                className="bg-indigo-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-xl transform hover:scale-[1.02] duration-200"
            >
                📊 Go to Dashboard
            </Link>
        </div>
      </header>
      <section className="mb-10 border-b pb-8">
        <h2 className={`${styles.contentHeader} text-3xl mb-4`}>Filter by Category</h2>
        <div className="flex flex-wrap gap-3">
            <button
                onClick={() => setActiveCategoryId(undefined)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition duration-200 ${
                    activeCategoryId === undefined ? 'bg-black text-white shadow-md' : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200'
                }`}
            >
                All Posts
            </button>
            {categories?.map(category => (
                <button
                    key={category.id}
                    onClick={() => setActiveCategoryId(category.id)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition duration-200 ${
                        activeCategoryId === category.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200'
                    }`}
                >
                    {category.name}
                </button>
            ))}
        </div>
      </section>

      <section>
        <h2 className={`${styles.contentHeader} text-3xl mb-8`}>Latest Articles</h2>
        
        {isLoading && <div className="text-center text-xl text-indigo-500">Fetching articles...</div>}
        {isError && <div className="text-center text-xl text-red-600">Error loading posts: {error.message}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} /> 
          ))}
          
          {posts?.length === 0 && !isLoading && (
            <p className="text-lg text-gray-500 col-span-full text-center py-10">No articles found in this category.</p>
          )}
        </div>
      </section>
    </main>
  );
}