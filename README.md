# 🎟️ Event Ticketing System (ETS)

**Event Ticketing System (ETS)** est une application complète de billetterie permettant de **créer, gérer et vérifier des événements et leurs tickets**.  
Elle inclut la **gestion des organisateurs**, la **génération de tickets avec QR code**, l’**envoi automatique des billets par e-mail**, et une **interface de vérification sécurisée** réservée aux créateurs d’événements.

---

## 🚀 Fonctionnalités principales

- ✅ **Authentification via Discord** (NextAuth + OAuth2)  
- 🧑‍💼 **Création, modification et suppression d’événements** par les organisateurs  
- 👥 **Inscription des participants** à un événement  
- 🎟️ **Génération de tickets uniques** avec code et QR code  
- ✉️ **Envoi automatique des e-tickets par e-mail** (via Nodemailer)  
- 📱 **Vérification sécurisée des billets** avec scan QR code (Html5Qrcode)  
- 🔐 **Protection d’accès** : seules les personnes connectées peuvent accéder aux zones sensibles  
- 📊 **Statistiques en temps réel** (tickets scannés / émis)  
- 💾 **Base de données relationnelle Prisma + PostgreSQL**  
- ⚙️ **API intégrée à Next.js (App Router + Pages)**  
- 🧱 **Architecture moderne, typée et modulaire (TypeScript)**  

---

## 🧰 Stack technique

| Domaine | Technologie | Description |
|----------|--------------|--------------|
| Frontend | **Next.js 15 (React + TypeScript)** | Framework fullstack avec App Router |
| Authentification | **NextAuth.js (Discord OAuth)** | Gestion sécurisée des sessions utilisateur |
| ORM | **Prisma** | Accès et gestion des données PostgreSQL |
| Base de données | **PostgreSQL** | Stockage persistant des utilisateurs, événements et tickets |
| Emailing | **Nodemailer** | Envoi automatique des tickets PDF aux participants |
| QR Codes | **html5-qrcode / qrcode** | Génération et lecture des QR codes |
| Style | **Tailwind CSS** | Design responsive et moderne |
| Validation | **Zod** | Validation et typage fort des environnements et entrées |
| Environnement | **@t3-oss/env-nextjs** | Validation stricte des variables d’environnement |
| Conteneurisation | **Docker (optionnel)** | Déploiement simplifié |

---

## 🗂️ Structure du projet

```
event-ticketing-system/
│
├── prisma/                # Schéma et migrations Prisma
├── src/
│   ├── app/               # Routes Next.js (App Router)
│   │   ├── api/           # API routes (NextAuth, admin, etc.)
│   │   └── page.tsx       # Page principale
│   ├── pages/             # Pages classiques (admin, verify, etc.)
│   ├── server/            # Auth, config et logique serveur
│   ├── trpc/              # Configuration tRPC (API type-safe)
│   └── components/        # Composants UI réutilisables
│
├── public/                # Assets (logos, images)
├── .env.example           # Exemple de variables d’environnement
├── next.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Installation et lancement

### 1️⃣ Cloner le dépôt
```bash
git clone https://github.com/<ton-username>/event-ticketing-system.git
cd event-ticketing-system
```

### 2️⃣ Installer les dépendances
```bash
npm install
```

### 3️⃣ Créer ton fichier `.env`
Copie le modèle :
```bash
cp .env.example .env
```

Puis remplis les valeurs (obligatoires) :
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ets"
AUTH_SECRET="clé_secrète_random"
AUTH_DISCORD_ID="ton_client_id_discord"
AUTH_DISCORD_SECRET="ton_secret_discord"
```

### 4️⃣ Mettre à jour la base de données
```bash
npx prisma migrate dev
```

### 5️⃣ Lancer le serveur de développement
```bash
npm run dev
```

> Application accessible sur [http://localhost:3000](http://localhost:3000)

---

## 🔐 Règles d’accès

| Page | Accès | Description |
|------|--------|-------------|
| `/` | Public | Accueil (liste d’événements ou contenu à venir) |
| `/admin/events` | 🔒 Authentifié | Gestion complète des événements (CRUD) |
| `/events/[id]/register` | Public | Inscription à un événement |
| `/verify` | 🔒 Créateur d’événement | Scanner et vérifier les billets de son propre événement |

---

## 📊 Statistiques organisateur

- Affiche en temps réel :  
  > 🎟️ `X billets validés / Y émis` pour chaque événement.  
- Actualisation automatique après chaque scan validé.

---

## 🛠️ Prochaines évolutions

- 💰 Gestion d’événements payants (intégration Stripe)  
- 🧾 Tableau de bord analytique (stats de participation)  
- 🗂️ Gestion multi-organisateurs  
- 📱 Billets Apple/Google Wallet

---

## 📜 Licence

Distribué sous licence **MIT**.  
Voir le fichier [LICENSE](./LICENSE) pour plus d’informations.

---

### 💬 À propos

Développé avec ❤️ dans le but de proposer une solution de billetterie **gratuite**, **sécurisée** et **auto-hébergeable** pour tous les organisateurs d’événements.