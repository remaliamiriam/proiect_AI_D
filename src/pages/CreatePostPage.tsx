import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Upload, X, AlertCircle } from 'lucide-react';

export function CreatePostPage() {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [locality, setLocality] = useState('');
  const [county, setCounty] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [body, setBody] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(!profile?.show_real_name);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const romanianCounties = [
    'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani',
    'Brașov', 'Brăila', 'Buzău', 'Caraș-Severin', 'Călărași', 'Cluj', 'Constanța',
    'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita',
    'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș',
    'Neamț', 'Olt', 'Prahova', 'Satu Mare', 'Sălaj', 'Sibiu', 'Suceava',
    'Teleorman', 'Timiș', 'Tulcea', 'Vaslui', 'Vâlcea', 'Vrancea', 'București'
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError('Fiecare imagine trebuie să fie mai mică de 5MB');
        return false;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('Doar imagini JPEG și PNG sunt permise');
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles].slice(0, 5));
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (body.length < 30) {
      setError('Descrierea trebuie să aibă minimum 30 de caractere');
      setLoading(false);
      return;
    }

    try {
      const displayName = isAnonymous ? 'Anonim' : (profile?.full_name || 'Utilizator');

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          author_id: user!.id,
          title: title || null,
          body,
          hospital_name: hospitalName,
          locality,
          county,
          incident_date: incidentDate || null,
          status: 'pending',
          display_name: displayName,
          is_anonymous: isAnonymous,
        })
        .select()
        .single();

      if (postError) throw postError;

      if (images.length > 0 && post) {
        for (const image of images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${post.id}-${Date.now()}.${fileExt}`;
          const filePath = `posts/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('post-images')
            .upload(filePath, image);

          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            continue;
          }

          await supabase.from('attachments').insert({
            post_id: post.id,
            file_path: filePath,
            file_name: image.name,
            file_size: image.size,
          });
        }
      }

      setSuccess(true);
      setTitle('');
      setHospitalName('');
      setLocality('');
      setCounty('');
      setIncidentDate('');
      setBody('');
      setImages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la crearea postării');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Postare trimisă cu succes!</h2>
            <p className="text-gray-600 mb-6">
              Postarea ta a fost trimisă și așteaptă aprobarea administratorului.
              Vei primi o notificare când va fi publicată.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Creează altă postare
              </button>
              <a
                href="/"
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Înapoi la listă
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Partajează experiența ta</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Titlu (opțional)
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Experiență neplăcută la UPU"
              />
            </div>

            <div>
              <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700 mb-1">
                Spital / Unitate medicală <span className="text-red-500">*</span>
              </label>
              <input
                id="hospitalName"
                type="text"
                required
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Spitalul Județean Arad"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="locality" className="block text-sm font-medium text-gray-700 mb-1">
                  Localitate <span className="text-red-500">*</span>
                </label>
                <input
                  id="locality"
                  type="text"
                  required
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Arad"
                />
              </div>

              <div>
                <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-1">
                  Județ <span className="text-red-500">*</span>
                </label>
                <select
                  id="county"
                  required
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selectează județul</option>
                  {romanianCounties.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="incidentDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data incidentului (opțional)
              </label>
              <input
                id="incidentDate"
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
                Descriere <span className="text-red-500">*</span>
              </label>
              <textarea
                id="body"
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descrie experiența ta în detaliu (minim 30 caractere)..."
              />
              <p className="mt-1 text-sm text-gray-500">
                {body.length} caractere {body.length < 30 && `(încă ${30 - body.length} până la minim)`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagini (opțional, max 5MB fiecare)
              </label>
              <div className="space-y-3">
                {images.length < 5 && (
                  <label className="flex items-center justify-center w-full h-32 px-4 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Click pentru a selecta imagini
                      </p>
                      <p className="text-xs text-gray-500">JPEG sau PNG, max 5MB</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-start">
                <input
                  id="isAnonymous"
                  type="checkbox"
                  checked={!isAnonymous}
                  onChange={(e) => setIsAnonymous(!e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isAnonymous" className="ml-3 block">
                  <span className="text-sm font-medium text-gray-700">
                    Publică sub numele meu real
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    Dacă bifezi această opțiune, numele tău va fi vizibil la această postare.
                    Altfel, postarea va fi publicată anonim.
                  </p>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Se trimite...' : 'Trimite postarea'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
