from app import create_app
from app.services import facade


def main() -> None:
    app = create_app()
    with app.app_context():
        email = "test@hbnb.fr"
        existing = facade.get_user_by_email(email)
        if existing:
            print(f"User already exists: {existing.id} ({existing.email})")
            return

        user_data = {
            "first_name": "Test",
            "last_name": "User",
            "email": email,
            "password": "hbnb",
        }

        user = facade.create_user(user_data)
        print(f"Created user: {user.id} ({user.email})")


if __name__ == "__main__":
    main()
