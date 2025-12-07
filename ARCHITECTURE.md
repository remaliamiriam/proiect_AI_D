# Arhitectura Aplicației

## Overview

Aplicația este construită ca o Single Page Application (SPA) folosind React și TypeScript, cu Supabase ca backend complet (BaaS - Backend as a Service).

## Stack Tehnologic

### Frontend
- **React 18**: Library pentru UI
- **TypeScript**: Type safety
- **Vite**: Build tool și dev server
- **Tailwind CSS**: Styling utility-first
- **Lucide React**: Icon library

### Backend (Supabase)
- **PostgreSQL**: Database relațională
- **Supabase Auth**: Sistem de autentificare
- **Supabase Storage**: File storage pentru imagini
- **Row Level Security (RLS)**: Securitate la nivel de rând

## Structura Componentelor

```
App (AuthProvider)
├── Header (Navigation)
└── Pages
    ├── PostsListPage (Home)
    ├── PostDetailPage
    ├── CreatePostPage
    ├── ProfilePage
    ├── AdminPage
    └── AuthPage
        ├── LoginForm
        └── RegisterForm
```

## Fluxul de Date

### Autentificare

```
User Action → AuthContext → Supabase Auth → Database (user_profiles)
     ↓
Auth State Update
     ↓
Component Re-render
```

### Creare Postare

```
User Input → CreatePostPage → Validation
     ↓
Upload Images → Supabase Storage
     ↓
Create Post → Database (posts table, status: pending)
     ↓
Create Attachments → Database (attachments table)
     ↓
Success Message
```

### Moderare (Admin)

```
Admin View → Fetch Pending Posts
     ↓
Select Post → View Details
     ↓
Approve/Reject → Update Post Status
     ↓
Refresh List
```

### Citire Postări

```
User View → Fetch Approved Posts
     ↓
Apply Filters (county, hospital)
     ↓
Display List
     ↓
Click Post → Fetch Details + Replies + Attachments
     ↓
Display Full View
```

## Schema Bazei de Date

### user_profiles
```sql
- id (uuid, PK, FK to auth.users)
- email (text)
- full_name (text, nullable)
- county (text, nullable)
- show_real_name (boolean, default false)
- is_admin (boolean, default false)
- created_at, updated_at (timestamptz)
```

**Relații:**
- One-to-Many cu `posts`
- One-to-Many cu `replies`

### posts
```sql
- id (uuid, PK)
- author_id (uuid, FK to user_profiles)
- title (text, nullable)
- body (text, required)
- hospital_name (text, required)
- locality (text, required)
- county (text, required)
- incident_date (date, nullable)
- status (enum: pending|approved|rejected)
- display_name (text, required)
- is_anonymous (boolean)
- created_at, updated_at (timestamptz)
```

**Relații:**
- Many-to-One cu `user_profiles`
- One-to-Many cu `attachments`
- One-to-Many cu `replies`

### attachments
```sql
- id (uuid, PK)
- post_id (uuid, FK to posts)
- file_path (text, path in storage)
- file_name (text)
- file_size (integer)
- created_at (timestamptz)
```

**Relații:**
- Many-to-One cu `posts`

### replies
```sql
- id (uuid, PK)
- post_id (uuid, FK to posts)
- author_id (uuid, FK to user_profiles)
- body (text, max 500 chars)
- display_name (text)
- is_anonymous (boolean)
- created_at (timestamptz)
```

**Relații:**
- Many-to-One cu `posts`
- Many-to-One cu `user_profiles`

## Securitate (RLS Policies)

### user_profiles
- **SELECT**: Authenticated users pot vedea toate profilurile
- **UPDATE**: Users pot actualiza doar propriul profil
- **INSERT**: Users pot crea doar propriul profil

### posts
- **SELECT**: Oricine poate vedea postări approved; autorul și admin pot vedea toate
- **INSERT**: Authenticated users pot crea postări
- **UPDATE**: Autorul poate edita propriile postări pending; admin poate edita orice

### attachments
- **SELECT**: Oricine poate vedea attachments pentru postări approved
- **INSERT**: Users pot adăuga attachments la propriile postări

### replies
- **SELECT**: Oricine poate vedea reply-uri pe postări approved
- **INSERT**: Authenticated users pot crea reply-uri

## Storage (Supabase Storage)

### Bucket: post-images
- **Public**: Da
- **Max file size**: 5MB (enforced client-side)
- **Allowed types**: JPEG, PNG

**Policies:**
- Public read access
- Authenticated users pot upload
- Users pot șterge propriile imagini

## Routing

Aplicația folosește un sistem de routing simplu bazat pe state (fără library extern):

```typescript
type Page = 'home' | 'post-detail' | 'create-post' | 'profile' | 'admin' | 'auth'
```

Navigarea se face prin:
- Header navigation buttons
- Link-uri în liste de postări
- Programmatic navigation după acțiuni

## State Management

### Global State (AuthContext)
- User authentication state
- User profile data
- Authentication methods (signIn, signUp, signOut)

### Local State
Fiecare pagină își gestionează propriul state:
- Form inputs
- Loading states
- Error messages
- Fetched data

## API Calls

Toate API calls sunt făcute direct prin Supabase client:

```typescript
// Example: Fetch posts
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'approved')
  .order('created_at', { ascending: false });
```

## Validări

### Client-side
- Email format
- Password length (min 6 chars)
- Body length (min 30 chars pentru posts)
- Reply length (max 500 chars)
- Image size (max 5MB)
- Image type (JPEG, PNG)

### Database-level
- NOT NULL constraints
- CHECK constraints pentru status enum
- Foreign key constraints
- Unique constraints (email)

## Performanță

### Optimizări
- Imagini servite prin Supabase CDN
- Lazy loading pentru imagini
- Paginare pregătită (poate fi adăugată)
- Indexes pe coloane frecvent căutate

### Caching
- Supabase oferă caching automat
- Browser caching pentru assets statice

## Scalabilitate

### Limitări Actuale MVP
- Nu există paginare (poate deveni problemă cu multe postări)
- Nu există rate limiting client-side
- Nu există optimistic updates

### Recomandări pentru Scaling
1. Implementare paginare cu infinite scroll
2. Implementare debouncing pentru search
3. Optimistic UI updates
4. Image optimization (resize, compression)
5. Implementare Redis pentru caching

## Extensibilitate

### Pregătit pentru Mobile
Codul este structurat să fie ușor de portat în React Native:
- Logica de business separată de UI
- Supabase client funcționează în React Native
- Componentele pot fi adaptate ușor

### Endpoints pentru API
Dacă e nevoie de funcționalități custom:
- Supabase Edge Functions pot fi adăugate
- Pot rula Deno/TypeScript
- Se pot integra cu database-ul existent

## Testare

### Recomandate (nu implementate în MVP)
- Unit tests pentru componente
- Integration tests pentru flows
- E2E tests pentru user journeys
- RLS policy tests

## Monitorizare

### Disponibile prin Supabase
- Database query performance
- API usage metrics
- Storage usage
- Authentication events

## Considerații Legale și Etice

### Date Personale (GDPR)
- Email-uri stocate securizat
- Opțiune anonimat disponibilă
- Users pot șterge contul (TODO: implementare)

### Moderare Conținut
- Toate postările trec prin aprobare admin
- Admin poate respinge conținut inadecvat
- Reply-urile apar imediat (TODO: consider moderare)
