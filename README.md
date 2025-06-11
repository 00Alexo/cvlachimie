verificareGrila.py este un sistem de computer vision (nu machine learning) care analizează imagini cu teste grilă și compară automat răspunsurile elevului cu baremul, returnând:

Numele elevului (prin OCR)
Numărul de răspunsuri corecte
O imagine vizuală cu rezultatele colorate
🛠️ Tehnologii Folosite
1. Computer Vision (OpenCV)
Nu este machine learning - folosește algoritmi deterministici de procesare a imaginilor
Analizează pixeli, contururi și forme geometrice
Nu necesită antrenare pe date
2. OCR (Optical Character Recognition)
EasyOCR pentru detectarea numelui elevului
Aceasta DA folosește modele pre-antrenate (deep learning)
Dar noi doar o folosim, nu o antrenăm
3. Algoritmi Clasici
Clustering (K-Means) pentru gruparea checkbox-urilor similare
Threshold-uri adaptive pentru binarizarea imaginilor
Detectarea contururilor pentru identificarea căsuțelor
🔬 Cum Funcționează Pas cu Pas
PASUL 1: Preprocesarea Imaginii
Ce face: Transformă imaginea color într-una în alb-negru, optimizată pentru detectarea formelor.

PASUL 2: Detectarea Checkbox-urilor
Ce face: Identifică toate formele din imagine care arată ca niște căsuțe (dimensiune și formă corecte).

PASUL 3: Clustering pentru Consistență
Ce face: Elimină forme care nu se potrivesc cu majoritatea checkbox-urilor (zgomot, alte elemente grafice).

PASUL 4: Sortarea Spațială
Ce face: Ordonează checkbox-urile în ordinea în care apar pe foaie (întrebarea 1, 2, 3...).

PASUL 5: Detectarea Bifării
Ce face: Pentru fiecare căsuță, analizează ce este înăuntru:

Densitate mare de pixeli albi = bifă sau X
Multe muchii = X desenat
Zone goale = nebifat
PASUL 6: Extragerea Numelui (OCR)
Ce face: Ia zona specifică unde ar trebui să fie numele și folosește OCR pentru a-l citi.

PASUL 7: Compararea cu Baremul
Ce face: Compară fiecare întrebare: dacă elevul a bifat exact ca în barem = corect.

📊 Tipul de Tehnologie
NU este Machine Learning clasic pentru că:
Nu antrenează modele noi
Nu învață din date
Folosește reguli fixe și algoritmi deterministici
Rezultatele sunt predictibile și explicabile
ESTE Computer Vision și Image Processing:
Analizează proprietăți geometrice (forme, dimensiuni)
Folosește operații matematice pe matrici de pixeli
Aplică filtre și transformări deterministice
Detectează pattern-uri vizuale prin reguli
Componenta de ML:
Doar EasyOCR pentru nume (folosește modele pre-antrenate)
K-Means clustering pentru gruparea checkbox-urilor (algoritm nesupervizat simplu)
🎯 Avantajele Abordării
1. Transparență Completă
Poți vedea exact de ce o căsuță e considerată bifată
Algoritmii sunt explicabili și debuggabili
Nu există "cutie neagră"
2. Nu Necesită Date de Antrenare
Funcționează imediat pe orice test grilă
Nu trebuie să antrenezi pe sute de exemple
Adaptabil la formate diferite
3. Rapiditate
Procesează o imagine în câteva secunde
Nu necesită GPU sau resurse mari
Scalabil pentru multe teste
4. Robustețe
Funcționează cu imagini de calitate variabilă
Tolerant la zgomot și distorsiuni mici
Se adaptează automat la dimensiuni diferite
💡 Pentru Prezentarea la Profesor
"Este un sistem de computer vision care analizează geometric imaginile cu teste grilă, folosind algoritmi de procesare a imaginilor pentru a detecta și compara forme bifate, fără a necesita antrenare pe date specifice. Singura componentă de machine learning este OCR-ul pentru numele elevului, care folosește modele pre-antrenate."

Puncte cheie de evidențiat:

✅ Explicabil și transparent
✅ Nu necesită date de antrenare
✅ Funcționează prin reguli geometrice clare
✅ Rapid și eficient
✅ Poate fi adaptat ușor la formate noi