# 🧹 Repository Cleanup & API Testing Guide

## ✅ Repository Status: CLEAN ✅

Votre repository a été nettoyé et organisé. Voici l'état actuel :

### **Structure complète :**
```
part2/
├── app/
│   ├── __init__.py                 # ✅ App Flask configurée
│   ├── api/
│   │   ├── __init__.py            # ✅ 
│   │   └── v1/
│   │       ├── __init__.py        # ✅
│   │       └── users.py           # ✅ Endpoints complets (GET, POST, PUT)
│   ├── models/
│   │   ├── __init__.py            # ✅
│   │   ├── base_model.py          # ✅ BaseModel avec UUID
│   │   └── user.py                # ✅ User avec validation
│   ├── persistence/
│   │   ├── __init__.py            # ✅
│   │   └── repository.py          # ✅ InMemoryRepository
│   └── services/
│       ├── __init__.py            # ✅
│       └── facade.py              # ✅ Façade complète
├── config.py
├── requirements.txt
├── run.py
└── test_app.py                    # ✅ Script de test
```

## 🚀 **Comment démarrer l'API**

### 1. Démarrer le serveur :
```bash
cd /Users/nab/holbertonschool-hbnb/part2
python3 run.py
```

### 2. Accéder à la documentation :
- **API Documentation** : http://localhost:5000/api/v1/
- **Swagger UI** : Interface graphique pour tester

## 🧪 **Tests cURL pour les endpoints**

### **POST - Créer un utilisateur**
```bash
curl -X POST http://localhost:5000/api/v1/users/ \
  -H "Content-Type: application/json" \
  -d '{"first_name": "John", "last_name": "Doe", "email": "john.doe@example.com"}'
```

**Réponse attendue :**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com"
}
```

### **GET - Liste des utilisateurs**
```bash
curl -X GET http://localhost:5000/api/v1/users/
```

### **GET - Utilisateur par ID**
```bash
curl -X GET http://localhost:5000/api/v1/users/<user_id>
```

### **PUT - Mettre à jour un utilisateur**
```bash
curl -X PUT http://localhost:5000/api/v1/users/<user_id> \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Jane", "last_name": "Smith", "email": "jane.smith@example.com"}'
```

## ✅ **Fonctionnalités implémentées**

- ✅ **POST /api/v1/users/** : Création d'utilisateur avec validation
- ✅ **GET /api/v1/users/** : Liste de tous les utilisateurs  
- ✅ **GET /api/v1/users/<id>** : Récupération par ID
- ✅ **PUT /api/v1/users/<id>** : Mise à jour d'utilisateur
- ✅ **Validation** : Email unique, champs requis
- ✅ **Gestion d'erreurs** : 400, 404 avec messages clairs
- ✅ **Documentation** : Swagger UI intégrée

## 🎯 **Prochaines étapes**

1. **Tester l'API** avec les commandes cURL ci-dessus
2. **Implémenter Place endpoints** (même pattern)
3. **Implémenter Review endpoints** 
4. **Implémenter Amenity endpoints**

## 🚨 **Commandes Git pour synchroniser**

```bash
# Sauvegarder le travail actuel
cd /Users/nab/holbertonschool-hbnb
git add .
git commit -m "feat: complete user API endpoints with full CRUD operations"
git push origin nabil

# Fusionner avec main si nécessaire
git checkout main
git pull origin main
git merge nabil
```

Votre repository est maintenant **propre et fonctionnel** ! 🎉