# Vocea Pacienților - Platformă Civică

Platformă MVP pentru raportarea experiențelor din spitalele din România. Aplicație web construită cu React, TypeScript, Tailwind CSS și Supabase.

## Caracteristici

- **Autentificare**: Email și parolă prin Supabase Auth
- **Postări**: Utilizatorii pot crea mărturii despre experiențe din spitale
- **Anonimat**: Opțiune de publicare anonimă la nivel de profil și per postare
- **Upload imagini**: Suport pentru încărcarea de imagini (max 5MB, JPEG/PNG)
- **Comentarii**: Sistem de reply-uri pentru postări
- **Moderare**: Panou admin pentru aprobarea/respingerea postărilor
- **Filtre**: Căutare și filtrare după județ și spital
- **Responsive**: Design adaptat pentru mobile și desktop

## Structura Proiectului

```
project/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   └── layout/
│   │       └── Header.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── database.types.ts
│   ├── pages/
│   │   ├── AdminPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── CreatePostPage.tsx
│   │   ├── PostDetailPage.tsx
│   │   ├── PostsListPage.tsx
│   │   └── ProfilePage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
└── package.json
```

## Tehnologii

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Icons**: Lucide React

## Instalare și Configurare

### 1. Instalare Dependențe

```bash
npm install
```

### 2. Configurare Supabase

Creează un fișier `.env` în rădăcina proiectului:

```bash
cp .env.example .env
```

Completează variabilele de mediu cu valorile tale din Supabase:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Schema de Bază de Date

Schema de bază de date a fost deja aplicată și include:

- **user_profiles**: Profiluri utilizatori cu preferințe
- **posts**: Postări/mărturii
- **attachments**: Imagini atașate la postări
- **replies**: Comentarii la postări
- **Storage bucket**: `post-images` pentru stocarea imaginilor

### 4. Creare Admin

Pentru a crea un administrator, după ce un utilizator se înregistrează, rulează următoarea comandă SQL în Supabase SQL Editor:

```sql
UPDATE user_profiles
SET is_admin = true
WHERE email = 'email@admin.com';
```

## Rulare Aplicație

### Mod Development

```bash
npm run dev
```

Aplicația va fi disponibilă la `http://localhost:5173`

### Build pentru Production

```bash
npm run build
```

Fișierele compilate vor fi în folderul `dist/`

### Preview Build

```bash
npm run preview
```

## Funcționalități Principale

### Pentru Utilizatori

1. **Înregistrare/Autentificare**
   - Creare cont cu email și parolă
   - Autentificare securizată

2. **Profil**
   - Setare nume complet (opțional)
   - Selectare județ (opțional)
   - Preferință afișare nume real

3. **Creare Postări**
   - Titlu (opțional)
   - Spital/unitate medicală
   - Localitate și județ
   - Data incidentului (opțional)
   - Descriere (min 30 caractere)
   - Upload imagini (max 5MB)
   - Opțiune anonimat

4. **Vizualizare și Interacțiune**
   - Listă postări aprobate
   - Filtre după județ și spital
   - Detalii postare cu imagini
   - Adăugare comentarii (reply-uri)

### Pentru Administratori

1. **Panou Admin**
   - Vizualizare postări în așteptare
   - Aprobare/respingere postări
   - Previzualizare completă înainte de moderare

## Securitate

- **RLS (Row Level Security)**: Activat pe toate tabelele
- **Autentificare**: Gestionată de Supabase Auth
- **Imagini**: Validate client-side (tip și dimensiune)
- **Politici**: Acces restricționat bazat pe autentificare și rol

## Limitări MVP

- Nu există notificări în timp real
- Nu există chat în timp real
- Nu există sistem de raportare abuze
- Nu există export de date
- Nu există statistici detaliate

## Dezvoltare Viitoare

- Aplicație mobile (React Native / Expo)
- Notificări email
- Export date pentru ONG-uri
- Statistici și dashboards
- Sistem de raportare abuze
- Traducere în mai multe limbi

## Licență

Acest proiect este dezvoltat pentru scop civic.
