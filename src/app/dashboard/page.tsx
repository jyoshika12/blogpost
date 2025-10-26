'use client';
import { trpc } from '@/app/_trpc/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 

export default function DashboardPage() {
  const router = useRouter();
  const { data: posts, isLoading: postsLoading, refetch: refetchPosts, isError: postsError } = trpc.post.getAll.useQuery({});
  const { data: categories, isLoading: categoriesLoading, refetch: refetchCategories, isError: categoriesError } = trpc.category.getAll.useQuery({});
  const deletePostMutation = trpc.post.delete.useMutation({ onSuccess: () => refetchPosts() });
  const deleteCategoryMutation = trpc.category.delete.useMutation({ onSuccess: () => { refetchCategories(); refetchPosts(); } });
  const handleDeletePost = (id: number) => { if (window.confirm("Are you sure?")) { deletePostMutation.mutate({ id }); } };
  const handleDeleteCategory = (id: number) => { if (window.confirm("Are you sure?")) { deleteCategoryMutation.mutate({ id }); } };
  if (postsLoading || categoriesLoading) { return <div className="text-center p-12 text-blue-500">Loading dashboard data...</div>; }
  if (postsError || categoriesError) { return <div className="text-center p-12 text-red-600">Error loading data. Check server connection.</div>; }



  return (
    <main className="min-h-screen bg-gray-100 container mx-auto p-8"> 
      <div className="text-center mb-10 pt-4 pb-8">
        <h1 className="text-5xl font-extrabold text-gray-800">Admin Dashboard</h1>
        
        <div className="mt-4 flex justify-center">
            <Link 
                href="/create" 
                className="bg-green-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-700 transition shadow-md"
            >
                ✍️ Create New Blog
            </Link>
        </div>
      </div>

      <section className="mb-12 p-6 bg-white rounded-xl shadow-lg border-t-2 border-indigo-600">
        <h2 className="text-3xl font-semibold mb-6 ">
            Post Management
        </h2>
        
        <div className="p-0"> 
            {posts && posts.length > 0 ? (
                <ul className="list-decimal pl-5 space-y-0">
                {posts.map((post) => (
                    <li key={post.id} className="p-1 hover:bg-indigo-50 transition last:border-b-0">
                        <div className="flex justify-between items-center pl-2">
                            <span className="font-medium">{post.title}</span>
                            <div className="space-x-2">
                                
                                <button 
                                    onClick={() => router.push(`/posts/${post.slug}/edit`)} 
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    View/Edit
                                </button>
                               
                                <button 
                                    onClick={() => handleDeletePost(post.id)}
                                    disabled={deletePostMutation.isPending}
                                    className="text-sm text-red-600 hover:underline disabled:opacity-50"
                                >
                                    {deletePostMutation.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
                </ul>
            ) : (<p className="text-gray-500 p-3">No posts found.</p>)}
        </div>
      </section>

      <section className="p-6 bg-white rounded-xl shadow-lg border-t-2 border-indigo-600">
        <h2 className="text-3xl font-semibold mb-6">
            Category Management
        </h2>
        
        <div className="p-0"> 
            {categories && categories.length > 0 ? (
                <ul className="list-decimal pl-5 space-y-0"> 
                {categories.map((category) => (
                    <li key={category.id} className="p-1 hover:bg-indigo-50 transition last:border-b-0">
                        <div className="flex justify-between items-center pl-2">
                            <span className="font-medium">{category.name}</span>
                            <button 
                                onClick={() => handleDeleteCategory(category.id)}
                                disabled={deleteCategoryMutation.isPending}
                                className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 font-medium"
                            >
                                {deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </li>
                ))}
                </ul>
            ) : (<p className="text-gray-500 p-3">No categories found. Use the Create New Blog option to start.</p>)}
        </div>
      </section>
    </main>
  );
}