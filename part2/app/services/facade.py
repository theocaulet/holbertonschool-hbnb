from app.persistence.repository import InMemoryRepository
from app.models import User
from app.models import Amenity


class HBnBFacade:
    def __init__(self):
        self.user_repo = InMemoryRepository()
        self.amenity_repo = InMemoryRepository()

    def create_user(self, user_data):
        user = User(**user_data)
        self.user_repo.add(user)
        return user

    def get_user(self, user_id):
        return self.user_repo.get(user_id)

    def get_user_by_email(self, email):
        return self.user_repo.get_by_attribute('email', email)

    def create_amenity(self, amenity_data):
        if "name" not in amenity_data or not amenity_data["name"]:
            raise ValueError("Amenity name is required")
        amenity = Amenity(**amenity_data)
        self.amenity_repo.add(amenity)
        return amenity

    def get_amenity(self, amenity_id):
        return self.amenity_repo.get(amenity_id)

    def get_all_amenities(self):
        return self.amenity_repo.get_all()

    def update_amenity(self, amenity_id, amenity_data):
        amenity = self.amenity_repo.get(amenity_id)
        if not amenity:
            raise ValueError("Amenity not found")
        if "name" not in amenity_data or not amenity_data["name"]:
            raise ValueError("Amenity name is required")
        if "name" in amenity_data:
            amenity.name = amenity_data["name"]
        self.amenity_repo.update(amenity)
        return amenity
