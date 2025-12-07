# Date Demo pentru Dezvoltare

## Creare Utilizator Admin

După ce te înregistrezi în aplicație cu un email (ex: `admin@vocea-pacientilor.ro`), rulează următoarea comandă SQL în Supabase SQL Editor pentru a-i da drepturi de admin:

```sql
UPDATE user_profiles
SET is_admin = true
WHERE email = 'admin@vocea-pacientilor.ro';
```

## Utilizatori Demo

Pentru testare, poți crea următorii utilizatori folosind formularul de înregistrare:

1. **Admin**
   - Email: `admin@vocea-pacientilor.ro`
   - Parolă: (la alegere, min 6 caractere)
   - Apoi rulează SQL-ul de mai sus pentru a-l face admin

2. **Utilizator Anonim**
   - Email: `anonim@test.ro`
   - Parolă: (la alegere)
   - Setează în profil: "Afișează numele meu real" = OFF

3. **Utilizator Public**
   - Email: `maria.popescu@test.ro`
   - Parolă: (la alegere)
   - Nume complet: Maria Popescu
   - Județ: Arad
   - Setează în profil: "Afișează numele meu real" = ON

## Flux de Testare Recomandat

### 1. Înregistrare și Configurare

- Înregistrează cei 3 utilizatori
- Setează primul ca admin folosind SQL
- Configurează profilele pentru ceilalți doi

### 2. Creare Postări

**Ca Utilizator Anonim:**
```
Titlu: Așteptare mult prea lungă
Spital: Spitalul Județean Arad
Localitate: Arad
Județ: Arad
Data: (o dată recentă)
Descriere: "Am așteptat peste 8 ore la urgențe pentru o problemă care se putea rezolva în 30 de minute. Nu a fost nimeni la ghișeu și nimeni nu știa nimic despre cazul meu. Este inadmisibil!"
Anonimat: Bifat
```

**Ca Maria Popescu:**
```
Titlu: Lipsa igienei în secție
Spital: Spitalul Clinic Județean de Urgență Cluj
Localitate: Cluj-Napoca
Județ: Cluj
Data: (o dată din ultima lună)
Descriere: "Am fost internată pe secția de chirurgie și am fost șocată de lipsa igienei. Saloanele nu erau curățate regulat, iar condițiile sanitare erau sub orice critică. Personalul medical era extrem de obosit și suprasolicitat."
Anonimat: Nebifat (sub nume real)
```

**Ca Utilizator Anonim:**
```
Titlu: Personal medical dedicat, dar infrastructură depășită
Spital: Spitalul Municipal Timișoara
Localitate: Timișoara
Județ: Timiș
Data: (o dată din ultima săptămână)
Descriere: "Doresc să mulțumesc medicilor și asistentelor care au fost foarte profesioniști și dedicați. Din păcate, infrastructura spitalului este în stare deplorabilă - aparatură învechită, pereți murați, lipsa unui lift funcțional. Se moare cu zile în aceste condiții."
Anonimat: Bifat
```

### 3. Moderare (ca Admin)

- Autentifică-te cu contul admin
- Mergi la secțiunea "Admin"
- Vezi cele 3 postări în așteptare
- Aprobă 2 din ele
- Respinge una (pentru testare)

### 4. Interacțiune

**Ca Maria Popescu:**
- Vizualizează postările aprobate
- Deschide o postare
- Adaugă un reply:
  ```
  Și eu am avut o experiență similară. Trebuie să facem ceva în legătură cu aceste probleme!
  ```
- Setează să fie sub nume real

**Ca Utilizator Anonim:**
- Vizualizează postările
- Adaugă reply-uri anonime pe diverse postări

### 5. Testare Filtre

- Testează filtrul după județ (Arad, Cluj, Timiș)
- Testează căutarea după spital
- Verifică că funcționează corect

### 6. Testare Mobile

- Deschide aplicația pe telefon
- Verifică responsive design
- Testează toate funcționalitățile

## Note Importante

- Toate postările încep cu status "pending"
- Doar admin-ul poate aproba/respinge postări
- Doar postările "approved" apar în listă publică
- Utilizatorii pot vedea doar propriile postări pending
- Reply-urile apar imediat (nu necesită aprobare)
