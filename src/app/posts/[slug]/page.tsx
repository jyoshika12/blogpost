'use client';
import { trpc } from '@/app/_trpc/client';
import { notFound } from 'next/navigation'; 
import Link from 'next/link';
import { useRouteParams } from '@/components/useRouteParams'; 

interface Category { id: number; name: string; slug: string; }
interface Post {
    id: number;
    title: string;
    content: string;
    slug: string;
    postsToCategories: { category: Category }[];
}

export default function PostDetailPage() {
    const { slug } = useRouteParams(); 
    const { data: post, isLoading, isError, error } = trpc.post.getById.useQuery(
        { slug },
        { enabled: !!slug } 
    );

    if (isLoading) {
        return <div className="text-center p-12 text-blue-500">Loading post...</div>;
    }
    if (isError) {
        console.error("Error fetching post:", error);
        return <div className="text-center p-12 text-red-600">Error loading post: {error.message}</div>;
    }
    if (!post) {
        notFound(); 
    }
    const firstCategoryName = post.postsToCategories[0]?.category.name || 'default';

    return (
        <main className="container mx-auto p-8 max-w-4xl">
            <div className="w-full h-64 bg-gray-200 overflow-hidden relative mb-8 rounded-lg shadow-md">
                <img 
                    src={`/placeholders/${firstCategoryName}.jpg`} 
                    alt={`Header image for ${post.title}`}
                    className="object-cover"
                />
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">{post.title}</h1>
                <div className="flex flex-wrap gap-2 mb-6">
                    {post.postsToCategories.map(p2c => (
                        <span key={p2c.category.id} className="text-sm font-semibold bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full">
                            {p2c.category.name}
                        </span>
                    ))}
                </div>

                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    <p>{post.content}</p>
                </div>
                <div className="mt-12 text-center">
                    <Link 
                        href="/" 
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold text-lg transition"
                    >
                        ← Back to all posts
                    </Link>
                </div>
            </div>
        </main>
    );
}