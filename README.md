# Dokumentacija projekta

Projekt je sestavljen iz 4 delov:

### 1. Prikaz kvadratkov
Ki skrbi za sporočanje informacij o trenutni porabi sistema uporabniku.
### 2. Prikaz nadzorne plošče in ure
Ki skrbi za sporočanje informacij o prihodnosti porabe energije uporabniku.
### 3. Mobilna aplikacija
Ki uporabniku omogoča interakcijo z sistemom, prižiganje in ugašanje naprav.
### 4. Node-red
Ki sprejema podatke iz mobilne aplikacije in jih obdeluje in pošilja prikazoma.

Za pravilno delovanje našega projekta morajo biti postavljene vse štiri komponente sledeč navodilom:

Najprej klonirajte ta repozitorij. V njem boste našli 3 pomembne datoteke "dashboardDisplay" "squaresDisplay"  in "nodeRed".
V teh datotekah se nahajajo aplikacije za prikaz nadzorne plošče in ure, prikaz kvadratkov in node-red. 


## 1. Prikaz Kvadratkov 
Prikaz kvadratkov je node.js aplikacija. Da jo zaženete sledite naslednjim korakom:
1. navigirajte v mapo squaresDisplay
2. odprite terminal v tej mapi in izvedite ukaz: node nodeserver.js
3. aplikacije je sesdaj dostopna na naslovu localhost:4000

## 2. Prikaz nadzorne plošče in ure
Na drugi napravi, sedaj ponovite isti postopek, samo da tokrat navigirajte v mapo dashboardDisplay. Če želite aplikacijo pognati na isti napravi, v datoteki nodeserver.js spremenite privzet port iz 4000 na 400x. Aplikacija bo nato dostopna na localhost:400x

## 3. Node-red
Nodered vzpostavite tako, da preprosto navigirate v mapo z imenom "nodeRed", vzamete flow.json in ga uvozite na lokalni node-red strežnik.
1. odprite terminal
2. zaženite node-red strežnik z ukazom "node-red"
3. navigirajte na "http://localhost:1880" ali podoben naslov, kjer teče vaš node-red strežnik
4. na desni zgoraj izberite gumb s tremi vodoravnimi črticami in izberite opcijo "import" ter nato izberite flow.json za import
5. poženite node-red flow s pritiskom na gumb "Deploy"

## 4. Mobilna aplikacija
Za mobilno aplikacijo uporabljamo preprosto aplikacijo na play store: MQTT Dash "https://play.google.com/store/apps/details?id=net.routix.mqttdash&hl=en&gl=US". Za pravilno vzpostavitev aplikacije sledite korakom:
1. Prenesite si MQTT Dash aplikacijo
2. Naredite novo okolje s klikom na okrogel plus v desnem zgornjem kotu. Vnesite naslednje podatke:
   - Name: Lucami MQTT  
   - Adress: rlab.lucami.org
   - Port: 1883
   - Username: lucmqtt
   - Password: se nahaja na drive
   - Client ID: mqttdash-179c48d8
3. Dodajte gumbe za upravljanje naprav s klikom na plus v desnem zgornjem kotu: Vnesite naslednje podatke,
Kjer je X številka naprave. Številke so: Pralni stroj (0), Avto (1), Gretje (2), Luč (3), Romba (4) :
   - Name: ime naprave
   - Topic: WaM
   - Enable Publishing
   - Update metric on publish immediately
   - On: X+
   - Off: X-
   - QoS(0)



Tako ste uspešno vzpostavili vse dele sistema in ta bi moral delovati normalno.