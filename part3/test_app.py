#!/usr/bin/env python3
"""
Script de test pour vérifier que l'API fonctionne correctement
"""
import sys
from app import create_app
sys.path.append('/Users/nab/holbertonschool-hbnb/part2')


def test_app():
    """Test de base de l'application Flask"""
    try:
        app = create_app()
        print("✅ Application Flask créée avec succès")

        # Tester le contexte de l'application
        with app.app_context():
            print("✅ Contexte d'application OK")

        # Afficher les routes disponibles
        print("\n📍 Routes disponibles:")
        for rule in app.url_map.iter_rules():
            print(f"  {rule.rule} [{', '.join(rule.methods)}]")

        print(f"\n🚀 Application prête sur http://localhost:5000")
        print("📚 Documentation API: http://localhost:5000/api/v1/")

        return True

    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    test_app()
