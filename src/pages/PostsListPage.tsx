import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Filter, MessageSquare, MapPin, Calendar } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'];

interface PostWithReplies extends Post {
  reply_count: number;
}

export function PostsListPage() {
  const [posts, setPosts] = useState<PostWithReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [countyFilter, setCountyFilter] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const romanianCounties = [
    'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani',
    'Brașov', 'Brăila', 'Buzău', 'Caraș-Severin', 'Călărași', 'Cluj', 'Constanța',
    'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita',
    'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș',
    'Neamț', 'Olt', 'Prahova', 'Satu Mare', 'Sălaj', 'Sibiu', 'Suceava',
    'Teleorman', 'Timiș', 'Tulcea', 'Vaslui', 'Vâlcea', 'Vrancea', 'București'
  ];

  useEffect(() => {
    fetchPosts();
  }, [countyFilter, hospitalFilter]);

  const fetchPosts = async () => {
    setLoading(true);

    let query = supabase
      .from('posts')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (countyFilter) {
      query = query.eq('county', countyFilter);
    }

    if (hospitalFilter) {
      query = query.ilike('hospital_name', `%${hospitalFilter}%`);
    }

    const { data: postsData } = await query;

    if (postsData) {
      const postsWithCounts = await Promise.all(
        postsData.map(async (post) => {
          const { count } = await supabase
            .from('replies')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          return {
            ...post,
            reply_count: count || 0,
          };
        })
      );

      setPosts(postsWithCounts);
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Experiențe din spitale</h1>
          <p className="text-gray-600">
            Mărturii despre situația din sistemul medical românesc
          </p>
        </div>

        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-700 font-medium hover:text-blue-600 transition-colors"
          >
            <Filter className="w-5 h-5" />
            {showFilters ? 'Ascunde filtre' : 'Afișează filtre'}
          </button>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="countyFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrează după județ
                </label>
                <select
                  id="countyFilter"
                  value={countyFilter}
                  onChange={(e) => setCountyFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toate județele</option>
                  {romanianCounties.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="hospitalFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Caută spital
                </label>
                <input
                  id="hospitalFilter"
                  type="text"
                  value={hospitalFilter}
                  onChange={(e) => setHospitalFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Spitalul Județean"
                />
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Se încarcă postările...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600">Nu există postări publicate încă.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <a
                key={post.id}
                href={`/posts/${post.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                {post.title && (
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h2>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{post.hospital_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{post.locality}, {post.county}</span>
                  </div>
                  {post.incident_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.incident_date)}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-700 mb-4">{truncateText(post.body, 200)}</p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    De: <span className="font-medium">{post.display_name}</span>
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.reply_count} {post.reply_count === 1 ? 'răspuns' : 'răspunsuri'}</span>
                    </div>
                    <span className="text-blue-600 font-medium hover:text-blue-700">
                      Citește mai mult →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
