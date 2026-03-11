#!/usr/bin/env python3
"""
Script de test pour vérifier que l'API fonctionne correctement
"""
import sys
import os

# Corriger le path vers part3 au lieu de part2
sys.path.append('/Users/nab/holbertonschool-hbnb/part3')

def test_app():
    """Test de base de l'application Flask"""
    try:
        from app import create_app
        app = create_app()
        print("✅ Application Flask créée avec succès")

        # Tester le contexte de l'application
        with app.app_context():
            print("✅ Contexte d'application OK")

        # Afficher les routes disponibles
        print("\n📍 Routes disponibles:")
        for rule in app.url_map.iter_rules():
            methods = [m for m in rule.methods if m not in ['HEAD', 'OPTIONS']]
            print(f"  {rule.rule} [{', '.join(methods)}]")

        print(f"\n🚀 Application prête sur http://localhost:5000")
        print("📚 Documentation API: http://localhost:5000/api/v1/")

        return True

    except ImportError as e:
        print(f"❌ Erreur d'import: {e}")
        print("💡 Vérifiez que vous êtes dans l'environnement virtuel:")
        print("   source hbnb_env/bin/activate")
        print("💡 Et que les dépendances sont installées:")
        print("   pip install flask flask-restx flask-jwt-extended flask-sqlalchemy")
        return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("🧪 Test de l'application HBnB Part 3...")
    success = test_app()
    if success:
        print("\n✅ Tous les tests sont passés!")
    else:
        print("\n❌ Des erreurs ont été détectées.")
        sys.exit(1)