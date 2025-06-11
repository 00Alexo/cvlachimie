x# 🎓 AutoGrader - Sistem Automat de Evaluare Teste Grilă

Un sistem inteligent pentru corectarea automată a testelor grilă prin analiză vizuală, dezvoltat special pentru profesorii de chimie.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933.svg)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)

## 📋 Cuprins

- [Despre Proiect](#despre-proiect)
- [Caracteristici](#caracteristici)
- [Tehnologii Folosite](#tehnologii-folosite)
- [Instalare și Configurare](#instalare-și-configurare)
- [Utilizare](#utilizare)
- [Structura Proiectului](#structura-proiectului)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contribuții](#contribuții)

## 🎯 Despre Proiect

CVLaChimie este o platformă web care automatizează procesul de corectare a testelor grilă prin tehnologii de computer vision. Sistemul analizează imaginile cu răspunsurile corecte (baremul) și răspunsurile elevului, oferind rezultate instant și vizualizări clare.

### Problemele Rezolvate
- ⏱️ **Reducerea timpului de corectare** de la ore la secunde
- 📊 **Eliminarea erorilor umane** în procesul de evaluare
- 📈 **Urmărirea progresului** elevilor prin statistici detaliate
- 🗂️ **Arhivarea automată** a rezultatelor testelor

## ✨ Caracteristici

### 🖼️ Procesare Imagini Avansată
- **Computer Vision** pentru detectarea checkbox-urilor
- **OCR (Optical Character Recognition)** pentru extragerea numelor
- **Algoritmi de clustering** pentru consistența detectării
- **Preprocessing automat** pentru optimizarea calității imaginilor

### 📊 Analiza Rezultatelor
- **Comparație automată** între barem și răspunsurile elevului
- **Vizualizare color-coded** a rezultatelor (verde=corect, roșu=greșit)
- **Statistici detaliate** pe întrebări individuale
- **Rapoarte comprehensive** cu metrici de performanță

### 💾 Gestiunea Datelor
- **Salvare automată** în baza de date MongoDB
- **Istoric complet** al tuturor testelor corectate
- **Filtrare și căutare** avansată prin rezultate
- **Export și arhivare** a datelor

### 🎨 Interfață Modernă
- **Design responsive** compatibil cu toate dispozitivele
- **UX intuitiv** pentru utilizare ușoară
- **Preview în timp real** al imaginilor încărcate
- **Feedback vizual** pentru toate acțiunile

## 🛠️ Tehnologii Folosite

### Frontend
- **React 18** - Framework UI modern
- **Tailwind CSS** - Styling utility-first
- **Lucide React** - Icoane elegante
- **React Router** - Navigare SPA

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Bază de date NoSQL
- **Mongoose** - ODM pentru MongoDB
- **Multer** - Upload fișiere

### Computer Vision & AI
- **Python 3.9+** - Procesare imagini
- **OpenCV** - Computer vision
- **EasyOCR** - Recunoaștere text
- **scikit-learn** - Algoritmi clustering
- **NumPy** - Operații numerice

### DevOps & Deployment
- **Render** - Hosting backend
- **Vercel** - Hosting frontend
- **MongoDB Atlas** - Bază de date cloud
- **Git** - Version control

## 🚀 Instalare și Configurare

### Cerințe de Sistem
- **Node.js** 18.x sau superior
- **Python** 3.9+ cu pip
- **Git** pentru clonarea repository-ului
- **MongoDB** (local sau Atlas)

### 1. Clonarea Proiectului
```bash
git clone https://github.com/username/cvlachimie.git
cd cvlachimie
```

### 2. Configurarea Backend-ului
```bash
cd backend

# Instalare dependențe Node.js
npm install

# Instalare dependențe Python
pip install -r requirements.txt

# Configurare variabile de mediu
cp .env.example .env
nano .env
```

#### Variabile de Mediu (.env)
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/cvlachimie
# sau pentru MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cvlachimie

# Server
PORT=4000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
```

### 3. Configurarea Frontend-ului
```bash
cd ../frontend

# Instalare dependențe
npm install

# Configurare variabile de mediu
cp .env.example .env.local
nano .env.local
```

#### Variabile de Mediu Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_ENVIRONMENT=development
```

### 4. Pornirea Aplicației

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

Aplicația va fi disponibilă la `http://localhost:3000`

## 📖 Utilizare

### 1. Încărcarea Imaginilor
1. **Selectează baremul** - imaginea cu răspunsurile corecte
2. **Selectează testul elevului** - imaginea cu răspunsurile elevului
3. **Adaugă titlul testului** (opțional)

### 2. Procesarea Automată
1. Click pe **"Începe Evaluarea"**
2. Sistemul va procesa imaginile automat
3. Rezultatele vor fi afișate în câteva secunde

### 3. Vizualizarea Rezultatelor
- **Nume elev** detectat automat (dacă este vizibil)
- **Numărul de răspunsuri corecte** din totalul de întrebări
- **Imagine color-coded** cu rezultatele vizuale
- **Detalii pe întrebări** cu status individual

### 4. Gestiunea Istoricului
- Accesează **"Vezi Toate Testele"** pentru istoric complet
- **Filtrează** după nume elev, titlu test sau dată
- **Șterge** rezultatele vechi dacă este necesar

## 📁 Structura Proiectului

```
cvlachimie/
├── frontend/                   # Aplicația React
│   ├── public/
│   ├── src/
│   │   ├── components/         # Componente reutilizabile
│   │   ├── pages/             # Pagini principale
│   │   │   ├── Grader.js      # Pagina de evaluare
│   │   │   └── TestResults.js # Pagina cu rezultate
│   │   ├── utils/             # Funcții utilitare
│   │   └── App.js             # Componenta principală
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                   # Server Node.js
│   ├── controllers/
│   │   └── gradingController.js # Logica de evaluare
│   ├── models/
│   │   └── TestResult.js      # Schema MongoDB
│   ├── python/
│   │   └── verificareGrila.py # Script computer vision
│   ├── uploads/               # Fișiere temporare
│   ├── package.json
│   ├── requirements.txt       # Dependențe Python
│   └── index.js              # Server principal
│
├── docs/                     # Documentație
├── .gitignore
├── README.md
└── LICENSE
```

## 🔌 API Documentation

### Base URL
```
Local: http://localhost:4000/api/grading
Production: https://your-app.onrender.com/api/grading
```

### Endpoints

#### POST /grade
Evaluează un test grilă

**Request:**
```javascript
FormData {
  barem: File,        // Imagine cu răspunsurile corecte
  elev: File,         // Imagine cu răspunsurile elevului
  testTitle: String   // Titlul testului (opțional)
}
```

**Response:**
```json
{
  "success": true,
  "student_name": {
    "name": "Ion Popescu",
    "confidence": 0.85,
    "success": true
  },
  "correct_answers": 8,
  "total_questions": 10,
  "score_percentage": 80.0,
  "details": [
    {
      "question": 1,
      "status": "CORRECT",
      "barem": [1, 0, 0, 0],
      "elev": [1, 0, 0, 0]
    }
  ],
  "result_image": "data:image/png;base64,iVBOR...",
  "timestamp": "2024-06-11T10:30:00.000Z",
  "processingTime": 2500
}
```

#### GET /results
Obține lista rezultatelor

**Query Parameters:**
- `page` (int): Numărul paginii
- `limit` (int): Rezultate per pagină
- `studentName` (string): Filtrare după nume
- `testTitle` (string): Filtrare după titlu
- `startDate` (date): Data de început
- `endDate` (date): Data de sfârșit

#### GET /results/:id
Obține detaliile unui rezultat specific

#### DELETE /results/:id
Șterge un rezultat

#### GET /stats
Obține statistici generale

## 🌐 Deployment

### Backend pe Render

1. **Conectează repository-ul** la Render
2. **Configurează Web Service:**
   - Environment: Node
   - Build Command: `pip install -r requirements.txt && npm install`
   - Start Command: `npm start`
3. **Setează Environment Variables**
4. **Deploy automat** la fiecare push

### Frontend pe Vercel

1. **Conectează repository-ul** la Vercel
2. **Configurează build settings:**
   - Framework: React
   - Build Command: `npm run build`
   - Output Directory: `build`
3. **Setează Environment Variables**
4. **Deploy automat** la fiecare push

### MongoDB Atlas

1. **Creează cluster gratuit** pe MongoDB Atlas
2. **Configurează network access** (0.0.0.0/0 pentru development)
3. **Creează database user**
4. **Copiază connection string** în environment variables

## 🔧 Tehnologia Computer Vision

### Cum Funcționează Algoritmul

1. **Preprocesarea Imaginii**
   - Conversie la grayscale
   - Aplicarea de filtre pentru reducerea zgomotului
   - Threshold adaptiv pentru binarizare

2. **Detectarea Checkbox-urilor**
   - Găsirea contururilor cu OpenCV
   - Filtrarea după dimensiune și aspect ratio
   - Clustering pentru eliminarea zgomotului

3. **Analiza Bifării**
   - Calcularea densității pixelilor albi
   - Detectarea muchiilor pentru X-uri
   - Clasificarea ca bifat/nebifat

4. **Sortarea Spațială**
   - Ordonarea de sus în jos, stânga-dreapta
   - Crearea matricii de răspunsuri

5. **Comparația și Scoring**
   - Compararea element cu element
   - Calcularea scorului final
   - Generarea imaginii cu rezultate

### Avantaje față de ML
- ✅ **Transparent și explicabil**
- ✅ **Nu necesită date de antrenare**
- ✅ **Funcționează imediat**
- ✅ **Adaptabil la formate diferite**
- ✅ **Performanță consistentă**

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Test server status
curl http://localhost:4000/

# Test cu Postman
# Import collection din docs/postman/
```

### Frontend Testing
```bash
cd frontend

# Run tests
npm test

# Run tests cu coverage
npm run test:coverage
```

## 🤝 Contribuții

Contribuțiile sunt binevenite! Urmează acești pași:

1. **Fork** proiectul
2. **Creează** o branch pentru feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** modificările (`git commit -m 'Add some AmazingFeature'`)
4. **Push** în branch (`git push origin feature/AmazingFeature`)
5. **Deschide** un Pull Request

### Guidelines pentru Contribuții
- Respectă stilul de cod existent
- Adaugă teste pentru funcționalitățile noi
- Actualizează documentația dacă este necesar
- Testează pe multiple browsere

## 📄 Licență

Acest proiect este licențiat sub MIT License - vezi fișierul [LICENSE](LICENSE) pentru detalii.

## 👨‍💻 Autori

- **Developer Principal** - [Numele Tău](https://github.com/username)

## 🙏 Mulțumiri

- **OpenCV Community** pentru biblioteca de computer vision
- **React Team** pentru framework-ul frontend
- **MongoDB** pentru baza de date flexibilă
- **Render & Vercel** pentru hosting gratuit

## 📞 Contact și Suport

- **Email**: contact@cvlachimie.ro
- **GitHub Issues**: Pentru bug reports și feature requests
- **Documentație**: Wiki-ul proiectului pentru ghiduri detaliate

## 🔮 Roadmap Viitor

### v2.0.0 (În Dezvoltare)
- [ ] **Suport pentru multiple choice complex** (mai multe răspunsuri corecte)
- [ ] **Integrare cu Google Classroom**
- [ ] **Export PDF** cu rezultate detaliate
- [ ] **Dashboard pentru profesori** cu analytics avansate

### v2.1.0
- [ ] **OCR îmbunătățit** pentru detectarea numelor
- [ ] **Suport pentru scanare mobilă**
- [ ] **Sistem de notificări** pentru rezultate
- [ ] **API pentru integrări externe**

### v3.0.0
- [ ] **Machine Learning** pentru îmbunătățirea preciziei
- [ ] **Recunoașterea scrisului de mână**
- [ ] **Multi-tenant support** pentru școli
- [ ] **Mobile app** nativă

---

<div align="center">

**[⬆ Înapoi sus](#-cvlachimie---sistem-automat-de-evaluare-teste-grilă)**

Făcut cu ❤️ pentru educația românească

</div>