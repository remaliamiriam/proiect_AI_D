import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MapPin, Calendar, ArrowLeft, MessageSquare } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'];
type Reply = Database['public']['Tables']['replies']['Row'];
type Attachment = Database['public']['Tables']['attachments']['Row'];

interface PostDetailPageProps {
  postId: string;
  onBack?: () => void;
}

export function PostDetailPage({ postId, onBack }: PostDetailPageProps) {
  const { user, profile } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [replyBody, setReplyBody] = useState('');
  const [isAnonymousReply, setIsAnonymousReply] = useState(!profile?.show_real_name);
  const [loading, setLoading] = useState(true);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    setLoading(true);

    const { data: postData } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postData) {
      setPost(postData);

      const { data: repliesData } = await supabase
        .from('replies')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (repliesData) {
        setReplies(repliesData);
      }

      const { data: attachmentsData } = await supabase
        .from('attachments')
        .select('*')
        .eq('post_id', postId);

      if (attachmentsData) {
        setAttachments(attachmentsData);
      }
    }

    setLoading(false);
  };

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage.from('post-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Trebuie să fii autentificat pentru a lăsa un răspuns');
      return;
    }

    if (replyBody.length > 500) {
      setError('Răspunsul poate avea maximum 500 de caractere');
      return;
    }

    setSubmittingReply(true);

    try {
      const displayName = isAnonymousReply ? 'Anonim' : (profile?.full_name || 'Utilizator');

      const { error: insertError } = await supabase.from('replies').insert({
        post_id: postId,
        author_id: user.id,
        body: replyBody,
        display_name: displayName,
        is_anonymous: isAnonymousReply,
      });

      if (insertError) throw insertError;

      setReplyBody('');
      await fetchPostDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la trimiterea răspunsului');
    } finally {
      setSubmittingReply(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Se încarcă postarea...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Postarea nu a fost găsită.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack || (() => window.history.back())}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Înapoi la listă
        </button>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          {post.title && (
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{post.title}</h1>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{post.hospital_name}</span>
            </div>
            <div>
              <span>{post.locality}, {post.county}</span>
            </div>
            {post.incident_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.incident_date)}</span>
              </div>
            )}
            <div className="ml-auto">
              <span>De: <span className="font-medium">{post.display_name}</span></span>
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{post.body}</p>
          </div>

          {attachments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Imagini atașate</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {attachments.map((attachment) => (
                  <button
                    key={attachment.id}
                    onClick={() => setSelectedImage(getImageUrl(attachment.file_path))}
                    className="relative aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={getImageUrl(attachment.file_path)}
                      alt={attachment.file_name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t text-sm text-gray-500">
            Publicat pe {formatDateTime(post.created_at)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-800">
              Răspunsuri ({replies.length})
            </h2>
          </div>

          {user && (
            <form onSubmit={handleSubmitReply} className="mb-8 p-4 bg-gray-50 rounded-lg">
              <label htmlFor="replyBody" className="block text-sm font-medium text-gray-700 mb-2">
                Lasă un răspuns
              </label>
              <textarea
                id="replyBody"
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                placeholder="Scrie răspunsul tău aici..."
              />
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  {replyBody.length} / 500 caractere
                </p>
                <div className="flex items-center">
                  <input
                    id="isAnonymousReply"
                    type="checkbox"
                    checked={!isAnonymousReply}
                    onChange={(e) => setIsAnonymousReply(!e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAnonymousReply" className="ml-2 text-sm text-gray-700">
                    Publică sub numele meu real
                  </label>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingReply || !replyBody.trim()}
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {submittingReply ? 'Se trimite...' : 'Trimite răspuns'}
              </button>
            </form>
          )}

          {!user && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-blue-800">
                Trebuie să fii autentificat pentru a lăsa un răspuns.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {replies.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nu există răspunsuri încă. Fii primul care comentează!
              </p>
            ) : (
              replies.map((reply) => (
                <div key={reply.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-gray-800">{reply.display_name}</span>
                    <span className="text-sm text-gray-500">{formatDateTime(reply.created_at)}</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{reply.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Imagine mărită"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
