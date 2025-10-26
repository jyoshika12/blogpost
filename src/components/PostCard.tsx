import Link from 'next/link';
interface Category { id: number; name: string; slug: string; }
interface Post {
    id: number;
    title: string;
    content: string;
    slug: string;
    postsToCategories: { category: Category }[];
}

export const PostCard: React.FC<{ post: Post }> = ({ post }) => { 
    const firstCategoryName = post.postsToCategories[0]?.category.name || 'default';
    
    return (
        <div className=" bg-gray-200 overflow-hidden relative">
            <div className="bg-gray-200 overflow-hidden relative"> 
                <img 
                    src={`/placeholders/${firstCategoryName}.jpg`} 
                    alt={`Header image for ${post.title}`}
                    className="object-cover transition duration-500 hover:scale-105"
                />
            </div>
            <div className="p-4"> 
                <div>
                    <div className="flex flex-wrap gap-2 mb-1">
                        {post.postsToCategories.map(p2c => (
                            <span 
                                key={p2c.category.id} 
                                className="text-xs font-semibold bg-gray-200 text-gray-800 px-3 py-1 rounded-full border border-gray-300"
                            >
                                {p2c.category.name}
                            </span>
                        ))}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2 leading-tight -mt-1">
                        {post.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-3 leading-snug">
                        {post.content.substring(0, 100)}...
                    </p>
                </div>
                <Link 
                    href={`/posts/${post.slug}`} 
                    className="mt-4 block text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition self-start"
                >
                    Read Full Blog Post →
                </Link>
                <div 
                style={{ paddingTop: '1%', paddingBottom: '1%' }}
                className="mx-4 border-b-2 border-gray-200"></div>
            </div>
        </div>
    );
};
    