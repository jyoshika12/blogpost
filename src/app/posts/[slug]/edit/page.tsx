'use client';
import { trpc } from '@/app/_trpc/client';
import { notFound, useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';

const useRouteParams = () => {
    const params = useParams() as { slug?: string | string[] }; 
    const slug = useMemo(() => {
        if (!params.slug) return undefined;
        if (Array.isArray(params.slug)) return params.slug[0];
        return params.slug as string;
    }, [params.slug]);

    return { slug };
};

interface Category { id: number; name: string; slug: string; }
interface Post {
    id: number;
    title: string;
    content: string;
    slug: string;
    postsToCategories: { category: Category }[];
}


export default function EditPostPage() {
    const router = useRouter();
    const { slug } = useRouteParams(); 
    const trpcContext = trpc.useContext(); 
    const [id, setId] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const { data: allCategories } = trpc.category.getAll.useQuery();

    const { data: post, isLoading, isError } = trpc.post.getById.useQuery(
        { slug: slug! }, 
        { enabled: !!slug }
    );
    
    const updatePostMutation = trpc.post.update.useMutation({
        onSuccess: () => {
            trpcContext.post.getAll.invalidate(); 
            router.push(`/posts/${post?.slug}`); 
        },
    });

    useEffect(() => {
        if (post && !id) {
            setId(post.id);
            setTitle(post.title);
            setContent(post.content);
            setSelectedCategoryIds(post.postsToCategories.map(p2c => p2c.category.id));
        }
    }, [post, id]);

    const toggleCategory = (categoryId: number) => {
        setSelectedCategoryIds(prev => 
            prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId) 
                : [...prev, categoryId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (id) {
            updatePostMutation.mutate({
                id,
                title,
                content,
                categoryIds: selectedCategoryIds,
            });
        }
    };

    if (isLoading) return <div className="text-center p-12">Loading post data...</div>;
    if (isError || !post) notFound();
    return (
        <main className="container mx-auto p-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Edit Post: {post.title}</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium">Title</label>
                    <input 
                        id="title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        disabled={updatePostMutation.isPending} 
                        className="mt-1 block w-full border rounded-md shadow-sm p-3" 
                    />
                </div>
                
                <div className="pt-2">
                    <span className="block text-sm font-medium text-gray-700 mb-2">Categories (Select one or more)</span>
                    <div className="flex flex-wrap gap-2">
                        {allCategories?.map(category => {
                            const isSelected = selectedCategoryIds.includes(category.id);
                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => toggleCategory(category.id)}
                                    className={`px-4 py-1.5 rounded-full text-sm transition shadow-sm ${
                                        isSelected 
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                <div>
                    <label htmlFor="content" className="block text-sm font-medium">Content</label>
                    <textarea 
                        id="content" 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                        rows={10} 
                        disabled={updatePostMutation.isPending} 
                        className="mt-1 block w-full border rounded-md shadow-sm p-3" 
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={updatePostMutation.isPending}
                    className="w-full py-3 px-4 rounded-md shadow-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
                >
                    {updatePostMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </main>
    );
}