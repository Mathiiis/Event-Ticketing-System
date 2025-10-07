# 🎟️ Event Ticketing System

**Event Ticketing System (ETS)** est une application complète et open source pour créer, gérer et vérifier des tickets d’événements.  
Elle permet l’inscription à des événements gratuits (et plus tard payants), la génération de QR codes, l’envoi de e-tickets par email et la vérification des tickets via une interface de scan.

---

## 🚀 Fonctionnalités principales

- ✅ Création et gestion d’événements  
- 👥 Inscription des participants  
- 🎫 Génération de tickets uniques (code + QR code)  
- ✉️ Envoi automatique du ticket par email  
- 📱 Application de vérification pour les organisateurs (scan QR + validation)  
- 💾 Base de données centralisée (utilisateurs, événements, tickets)  
- 🔐 Architecture sécurisée et modulaire  
- 🏠 Auto-hébergeable sur ta propre machine (Docker Ready)

---

## 🧰 Stack technique (MVP)

| Côté | Technologie | Description |
|------|--------------|--------------|
| Frontend | **Next.js (React + TypeScript)** | Interface moderne et rapide |
| Backend | **NestJS (Node.js)** | API REST + logique métier modulaire |
| Base de données | **PostgreSQL (via Prisma ORM)** | Stockage des utilisateurs, événements et tickets |
| Authentification | **JWT (JSON Web Token)** | Sessions sécurisées |
| QR Code | **qrcode / qr-image** | Génération des QR codes pour les tickets |
| Emails | **Nodemailer** | Envoi des e-tickets aux participants |
| Conteneurisation | **Docker + Docker Compose** | Déploiement et auto-hébergement simplifiés |

---

## 🗂️ Structure du dépôt

```
event-ticketing-system/
│
├── frontend/         # Interface Next.js
├── backend/          # API NestJS
├── shared/           # Types et utilitaires partagés
├── prisma/           # Modèles et migrations de base de données
├── docs/             # Documentation technique
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Installation (local)

### 1. Cloner le dépôt
```bash
git clone https://github.com/<ton-username>/event-ticketing-system.git
cd event-ticketing-system
```

### 2. Lancer avec Docker
```bash
docker-compose up --build
```

L’application sera accessible sur :
- Frontend → [http://localhost:3000](http://localhost:3000)
- Backend API → [http://localhost:4000](http://localhost:4000)

---

## 🧑‍💻 Développement manuel (sans Docker)

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📸 Aperçu (à venir)
Des captures d’écran et une démonstration seront ajoutées au fur et à mesure du développement.

---

## 🛠️ Prochaines étapes
- [ ] Authentification utilisateur  
- [ ] Création d’événements  
- [ ] Génération de tickets + QR code  
- [ ] Envoi d’e-tickets  
- [ ] Interface de scan et validation  

---

## 🤝 Contribution
Les contributions sont les bienvenues !  
Forke le projet, crée une branche et ouvre une pull request.

---

## 📜 Licence
Ce projet est distribué sous la licence **MIT** — voir le fichier [LICENSE](./LICENSE) pour plus de détails.

---

### 💬 À propos
Développé avec ❤️ pour offrir une solution d’émission de tickets simple, gratuite et auto-hébergeable.
