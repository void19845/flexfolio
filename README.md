cd# Portfolio

Portfolio modulaire — Next.js 15 (App Router) + Supabase + Tailwind CSS v4,
avec galerie de projets, panel admin (upload multi-images, positionnement
au pixel) et direction artistique éditoriale (hero asymétrique, page About,
CV card).

## Stack

- Next.js 15 + TypeScript, App Router, Server Actions
- Supabase : Postgres + Storage + Auth
- Tailwind CSS v4 (tokens définis dans `src/app/globals.css` via `@theme`)
- Composants UI façon shadcn/ui (écrits localement, voir note plus bas)
- `@dnd-kit` pour le réordonnancement des images à la souris

## Mise en route

### 1. Créer le projet Supabase

Sur [supabase.com](https://supabase.com), crée un nouveau projet.

### 2. Variables d'environnement

```bash
cp .env .env.local
```

Remplis `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(Project Settings → API dans le dashboard Supabase).

### 3. Schéma de base de données

Dans le SQL Editor de Supabase, exécute le contenu de
`supabase/migrations/0001_init.sql`. Ça crée :

- `projects`, `project_images`, `site_settings`
- la contrainte "une seule image featured par projet"
- le bucket de storage public `project-images` + ses policies RLS

### 4. Compte admin

Il n'y a volontairement pas de page d'inscription publique. Crée le compte
admin depuis Authentication → Users → Add user dans le dashboard Supabase
(email + mot de passe).

### 5. Lancer en local

```bash
npm install
npm run dev
```

Connecte-toi sur `/admin/login`, crée un premier projet, puis va dans
`/admin/parametres` pour uploader la photo hero (accueil) et la photo de
profil (About).

### 6. Déploiement (Vercel)

Connecte le repo à Vercel, ajoute les deux variables d'environnement dans
les Project Settings, déploie.

## Contenu à personnaliser

- `src/lib/site-config.ts` — nom, tagline, liens de nav, bio About, contenu
  du CV (expériences, formation, compétences...). Tout est en placeholder
  générique ("Prénom Nom", `[Nom du studio]`) : les images de référence
  fournies montraient un portfolio réel en ligne, traité ici uniquement
  comme référence de style (mise en page, palette, typo), pas comme
  contenu à reproduire.
- Photo hero / photo de profil : éditables depuis `/admin/parametres`
  (ce sont les deux seuls champs de contenu pilotés depuis la base, comme
  demandé dans le brief).

## Décisions techniques (là où le brief laissait le choix)

- **Next.js pinné en 15.5.x** — `create-next-app` proposait la 16 par
  défaut au moment de la génération ; le brief demandait explicitement du
  15.
- **Composants UI "shadcn"** écrits à la main (Radix + CVA + Tailwind,
  mêmes conventions que le CLI) plutôt que générés par `npx shadcn init` —
  son registre distant n'était pas joignable depuis l'environnement où
  j'ai construit le projet. Aucun impact une fois le repo chez toi.
- **Rendu dynamique** (`export const dynamic = "force-dynamic"`) sur les
  pages qui lisent Supabase, plutôt que du SSG — les données restent
  toujours à jour et le build ne dépend pas d'un projet Supabase déjà
  configuré.
- **Upload d'images** : un UUID de projet est généré côté client dès
  l'ouverture du formulaire "nouveau projet", pour pouvoir uploader vers
  `projects/{id}/...` avant le tout premier enregistrement. Le formulaire
  (infos + images) est validé et sauvegardé en un seul submit.
- **Suppression d'image** : immédiate (storage + ligne DB supprimés au
  clic), indépendante du bouton "Enregistrer".
- **Galerie de la page projet** : les hauteurs `max-h-[60vh]` / `max-h-[80vh]`
  du brief sont appliquées comme des hauteurs fixes, pas comme des
  plafonds — avec une hauteur seulement plafonnée, `object-position`
  n'a aucun effet visible tant que l'image ne déborde pas, ce qui aurait
  rendu la grille de positionnement 3×3 inopérante.
- **`display_order`** existe en base (tri secondaire de la home) mais
  n'a pas de champ dans le formulaire admin — non demandé dans le brief.
  Reste à `0` sauf modification manuelle en SQL.
- **`tailwind.config.ts`** est présent mais Tailwind v4 lit en réalité ses
  tokens dans `globals.css` (bloc `@theme`) — le fichier config sert de
  miroir typé pour l'éditeur/outillage, pas de source de vérité.

## Point de vigilance

`next lint` remonte une erreur de résolution de plugin ESLint (mélange
eslint 9 / eslint-config-next 15.5 issu du repin de version). `next build`
et `next dev` ne sont pas affectés. Si ça gêne : `npm install eslint@8`.
