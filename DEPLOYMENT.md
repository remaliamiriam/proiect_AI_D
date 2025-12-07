# Ghid de Deployment

## Deployment pe Vercel (Recomandat)

### 1. Pregătire Repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-git-repo-url>
git push -u origin main
```

### 2. Deploy pe Vercel

1. Mergi pe [vercel.com](https://vercel.com) și autentifică-te
2. Click pe "New Project"
3. Importă repository-ul tău Git
4. Configurează:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. Adaugă Environment Variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

6. Click "Deploy"

### 3. Custom Domain (Opțional)

În setările proiectului Vercel, poți adăuga un domeniu custom.

## Deployment pe Netlify

### 1. Build Settings

- Build command: `npm run build`
- Publish directory: `dist`

### 2. Environment Variables

Adaugă în Site settings > Build & deploy > Environment:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Deploy

```bash
# Instalează Netlify CLI
npm install -g netlify-cli

# Autentificare
netlify login

# Deploy
netlify deploy --prod
```

## Deployment Manual (Self-hosted)

### 1. Build

```bash
npm run build
```

### 2. Server Setup

Configurează un web server (Nginx, Apache) să servească conținutul din `dist/`:

**Nginx Example:**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. SSL Certificate

```bash
# Folosește Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

## Configurare Supabase pentru Production

### 1. Database

- Schema este deja aplicată prin migrații
- Verifică că toate migrațiile au fost rulate cu succes

### 2. Storage

- Bucket-ul `post-images` ar trebui să fie deja creat
- Verifică politicile de access sunt configurate corect

### 3. Authentication

În Supabase Dashboard:

1. Mergi la Authentication > Settings
2. Configurează:
   - Site URL: URL-ul aplicației tale
   - Redirect URLs: Adaugă URL-urile de redirect permise

### 4. Email Templates (Opțional)

Personalizează template-urile de email pentru:
- Confirmare cont
- Reset parolă
- Schimbare email

## Monitoring și Maintenance

### 1. Logs

- Vercel/Netlify oferă logs pentru cereri HTTP
- Supabase oferă logs pentru database și authentication

### 2. Backup

Configurează backup-uri automate în Supabase:
- Dashboard > Database > Backups
- Recomandare: Backup zilnic

### 3. Updates

```bash
# Update dependențe
npm update

# Rebuild și redeploy
npm run build
```

## Scaling

### Storage

Dacă volumul de imagini crește:
- Supabase oferă 1GB storage gratuit
- Pentru mai mult: Upgrade plan sau migrează către S3

### Database

- Supabase free tier: 500MB database
- Pentru trafic mare: Upgrade către plan paid

### CDN

Pentru performanță mai bună:
- Vercel și Netlify oferă CDN inclus
- Pentru self-hosted: Cloudflare CDN

## Securitate

### 1. Environment Variables

- Nu commit-a NICIODATĂ `.env` în Git
- Folosește `.env.example` pentru template

### 2. RLS Policies

- Verifică că toate tabelele au RLS activat
- Testează că utilizatorii nu pot accesa date neautorizate

### 3. Rate Limiting

Configurează în Supabase:
- API rate limits
- Authentication rate limits

### 4. CORS

- Supabase permite toate origin-urile by default
- Pentru production, restrânge la domeniul tău

## Troubleshooting

### Build Errors

```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working

- Verifică că variabilele încep cu `VITE_`
- Restart dev server după modificări `.env`

### Images Not Loading

- Verifică că bucket-ul `post-images` este public
- Verifică politicile de storage

### Authentication Issues

- Verifică Site URL în Supabase
- Verifică Redirect URLs
- Verifică că CORS este configurat corect
