'use client';
import { trpc } from '@/app/_trpc/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { isTRPCClientError } from '@trpc/client'; 

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const trpcContext = trpc.useContext(); 
  
  const { data: categories } = trpc.category.getAll.useQuery();

  const createPost = trpc.post.create.useMutation({
    onSuccess: (data) => {
      trpcContext.post.getAll.invalidate(); 
      router.push(`/posts/${data.slug}`);
    },
    onError: (error) => { 
        if (isTRPCClientError(error) && error.data?.zodError) {
            console.error("Zod Validation Failed:", error.data.zodError);
        } else {
            console.error("General Error:", error.message);
        }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createPost.mutate({
      title,
      content,
      categoryIds: selectedCategoryIds,
    });
  };

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]
    );
  };
  
  const getZodError = (path: 'title' | 'content' | 'categoryIds') => {
    if (
      createPost.error &&
      isTRPCClientError(createPost.error) &&
      createPost.error.data?.zodError
    ) {
      const fieldErrors = (createPost.error.data.zodError.fieldErrors as {
        [key: string]: string[] | undefined; 
      });

      if (fieldErrors[path] && fieldErrors[path]!.length > 0) {
        return <p className="text-sm text-red-600 mt-1">{fieldErrors[path]![0]}</p>;
      }
    }
    return null;
  };

  return (
    <main className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Create New Post</h1>
      {createPost.isError && !createPost.error.data?.zodError && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-6">
          General Error: {createPost.error.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-8 p-6 bg-white rounded-xl shadow-lg">
        <div className="mb-6"> 
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={createPost.isPending}
            className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm p-3"
          />
          {getZodError('title')} 
        </div>
        <div style={{ marginTop: '1%', marginBottom: '1%', borderTopWidth: '1px' }} className="border-gray-200 pt-2">
            <span className="block text-sm font-medium text-gray-700 mb-3">Categories (Select one or more)</span>
            <div className="flex flex-wrap gap-2">
                {categories?.map(category => (
                    <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className={`px-4 py-1.5 rounded-full text-sm transition shadow-sm ${
                            selectedCategoryIds.includes(category.id)
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
            {getZodError('categoryIds')}
        </div>

        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            disabled={createPost.isPending}
            className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm p-3"
          />
          {getZodError('content')}
        </div>
      
        <button
          type="submit"
          disabled={createPost.isPending || !title || !content}
          className="w-full py-3 px-4 rounded-md shadow-sm text-base font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
        >
          {createPost.isPending ? 'Publishing...' : 'Publish Post'}
        </button>
      </form>
    </main>
  );
}