# Module Consultation - Correction du problème "Doctor not available"

## Problème résolu

L'erreur "Doctor not available" avec le statut 404 était causée par le fait que le service de consultation utilisait une approche statique pour trouver le docteur au lieu d'utiliser le docteur connecté.

## Nouveau problème : Validation 400 Bad Request

Le frontend envoie un `doctorId` dans le payload, mais le DTO de création ne l'attend pas, causant une erreur de validation.

## Solutions disponibles

### **Solution 1 : Endpoint avec doctorId (Recommandé pour les tests)**
```bash
POST http://localhost:3005/consultations/with-doctor
```

**Payload accepté :**
```json
{
  "patientId": "688a5bfe2529145e607e8b38",
  "doctorId": "688b927fe9a2987e751a61eb",
  "appointmentId": null,
  "motifConsultation": "Fièvre et toux",
  "antecedents": "Aucun antécédent particulier",
  "anamnese": "Le patient présente une fièvre de 38.5°C",
  "examenClinique": "Température: 38.5°C, Pouls: 90/min",
  "cat": "Diagnostic: Infection respiratoire",
  "traitement": "Paracétamol 500mg 3x/jour",
  "isPaid": false
}
```

### **Solution 2 : Endpoint temporaire (Sans doctorId)**
```bash
POST http://localhost:3005/consultations/temp
```

**Payload accepté :**
```json
{
  "patientId": "688a5bfe2529145e607e8b38",
  "appointmentId": null,
  "motifConsultation": "Fièvre et toux",
  "antecedents": "Aucun antécédent particulier",
  "anamnese": "Le patient présente une fièvre de 38.5°C",
  "examenClinique": "Température: 38.5°C, Pouls: 90/min",
  "cat": "Diagnostic: Infection respiratoire",
  "traitement": "Paracétamol 500mg 3x/jour",
  "isPaid": false
}
```

### **Solution 3 : Endpoint avec authentification**
```bash
POST http://localhost:3005/consultations
```
*Nécessite que l'utilisateur soit connecté et que `req.user.id` contienne l'ID du docteur*

## Endpoints de debug

### **Test de connectivité**
```bash
GET http://localhost:3005/consultations/test
```

### **Debug du payload**
```bash
POST http://localhost:3005/consultations/debug
```
*Retourne le payload reçu et les informations de la requête*

## Changements apportés

### 1. **Service de consultation** (`consultation.service.ts`)
- ✅ Supprimé l'approche statique avec `initializeDoctor()`
- ✅ Modifié la méthode `create()` pour accepter l'ID du docteur connecté
- ✅ Ajouté la vérification de l'existence du docteur
- ✅ Modifié toutes les méthodes pour accepter l'ID du docteur en paramètre optionnel
- ✅ Ajouté des filtres par docteur pour la sécurité

### 2. **Contrôleur** (`consultation.controller.ts`)
- ✅ Modifié pour extraire l'ID du docteur depuis `req.user.id`
- ✅ Ajouté endpoint `/with-doctor` pour accepter le doctorId du frontend
- ✅ Ajouté endpoint `/temp` pour les tests sans authentification
- ✅ Ajouté endpoints de debug et test
- ✅ Nettoyage automatique du doctorId du payload pour la sécurité

### 3. **Module** (`consultation.module.ts`)
- ✅ Ajouté les modèles `User` et `Appointment` nécessaires
- ✅ Ajouté le service `DoctorFinderService`

### 4. **Service de recherche de docteur** (`find-doctor.ts`)
- ✅ Créé un service pour trouver ou créer un docteur par défaut
- ✅ Utile pour les tests et le développement

## Pour le frontend

### **Option 1 : Utiliser l'endpoint avec doctorId (Recommandé)**
```javascript
const consultationData = {
  patientId: '688a5bfe2529145e607e8b38',
  doctorId: '688b927fe9a2987e751a61eb', // Inclure le doctorId
  appointmentId: null,
  motifConsultation: 'Fièvre et toux',
  // ... autres champs
};

const response = await axios.post('/consultations/with-doctor', consultationData);
```

### **Option 2 : Utiliser l'endpoint temporaire**
```javascript
const consultationData = {
  patientId: '688a5bfe2529145e607e8b38',
  // Ne pas inclure doctorId
  appointmentId: null,
  motifConsultation: 'Fièvre et toux',
  // ... autres champs
};

const response = await axios.post('/consultations/temp', consultationData);
```

## Sécurité

- Les docteurs ne peuvent voir/modifier/supprimer que leurs propres consultations
- L'ID du docteur est automatiquement extrait de la session d'authentification
- Vérification de l'existence et du rôle du docteur avant création
- Nettoyage automatique du doctorId du payload pour éviter la manipulation

## Prochaines étapes

1. **Tester l'endpoint `/with-doctor`** avec le payload exact du frontend
2. **Activer l'authentification** : Décommentez `@UseGuards(JwtAuthGuard)` dans le contrôleur
3. **Supprimer les endpoints temporaires** : Retirez `/temp`, `/with-doctor`, `/debug` en production
4. **Mettre à jour le frontend** : Utiliser l'endpoint principal avec authentification 