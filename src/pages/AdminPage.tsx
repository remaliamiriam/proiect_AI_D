import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Eye, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'];
type Attachment = Database['public']['Tables']['attachments']['Row'];

interface PostWithAttachments extends Post {
  attachments: Attachment[];
}

export function AdminPage() {
  const { profile } = useAuth();
  const [pendingPosts, setPendingPosts] = useState<PostWithAttachments[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostWithAttachments | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (profile?.is_admin) {
      fetchPendingPosts();
    }
  }, [profile]);

  const fetchPendingPosts = async () => {
    setLoading(true);

    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (postsData) {
      const postsWithAttachments = await Promise.all(
        postsData.map(async (post) => {
          const { data: attachments } = await supabase
            .from('attachments')
            .select('*')
            .eq('post_id', post.id);

          return {
            ...post,
            attachments: attachments || [],
          };
        })
      );

      setPendingPosts(postsWithAttachments);
    }

    setLoading(false);
  };

  const handleApprove = async (postId: string) => {
    if (!confirm('Ești sigur că vrei să aprobi această postare?')) return;

    setActionLoading(true);

    const { error } = await supabase
      .from('posts')
      .update({ status: 'approved' })
      .eq('id', postId);

    if (!error) {
      await fetchPendingPosts();
      setSelectedPost(null);
    }

    setActionLoading(false);
  };

  const handleReject = async (postId: string) => {
    if (!confirm('Ești sigur că vrei să respingi această postare?')) return;

    setActionLoading(true);

    const { error } = await supabase
      .from('posts')
      .update({ status: 'rejected' })
      .eq('id', postId);

    if (!error) {
      await fetchPendingPosts();
      setSelectedPost(null);
    }

    setActionLoading(false);
  };

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage.from('post-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">Acces interzis</h2>
            <p className="text-red-700">Nu ai permisiuni de administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Se încarcă postările...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Panou Administrator</h1>
          <p className="text-gray-600">
            {pendingPosts.length} {pendingPosts.length === 1 ? 'postare în așteptare' : 'postări în așteptare'}
          </p>
        </div>

        {pendingPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Nu există postări în așteptare!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all ${
                    selectedPost?.id === post.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedPost(post)}
                >
                  {post.title && (
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{post.title}</h3>
                  )}

                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{post.hospital_name}</span>
                    </div>
                    <div>
                      <span>{post.locality}, {post.county}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm line-clamp-2 mb-3">{post.body}</p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">De: {post.display_name}</span>
                    <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                      <Eye className="w-4 h-4" />
                      Vezi detalii
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {selectedPost && (
              <div className="lg:sticky lg:top-4 h-fit">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="mb-6">
                    {selectedPost.title && (
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedPost.title}</h2>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4 pb-4 border-b">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">{selectedPost.hospital_name}</span>
                      </div>
                      <div>
                        <span>{selectedPost.locality}, {selectedPost.county}</span>
                      </div>
                      {selectedPost.incident_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(selectedPost.incident_date)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Autor:</p>
                      <p className="font-medium text-gray-800">{selectedPost.display_name}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Data postării:</p>
                      <p className="font-medium text-gray-800">{formatDateTime(selectedPost.created_at)}</p>
                    </div>

                    <div className="prose max-w-none mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.body}</p>
                    </div>

                    {selectedPost.attachments.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Imagini atașate ({selectedPost.attachments.length})
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedPost.attachments.map((attachment) => (
                            <a
                              key={attachment.id}
                              href={getImageUrl(attachment.file_path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                            >
                              <img
                                src={getImageUrl(attachment.file_path)}
                                alt={attachment.file_name}
                                className="w-full h-full object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedPost.id)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Aprobă
                    </button>
                    <button
                      onClick={() => handleReject(selectedPost.id)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      Respinge
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
