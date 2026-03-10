from app.persistence.repository import InMemoryRepository, SQLAlchemyRepository
from app.models import User, Amenity, Place, Review


class HBnBFacade:
    """
    Facade class that provides a unified interface to the HBnB application's
    core functionality, managing users, places, reviews, and amenities through repositories.
    """

    def __init__(self):
        """Initialize the HBnBFacade with in-memory repositories."""
        self.user_repo = SQLAlchemyRepository(User)
        self.amenity_repo = SQLAlchemyRepository(Amenity)
        self.place_repo = SQLAlchemyRepository(Place)
        self.review_repo = SQLAlchemyRepository(Review)

    # region User Management
    def create_user(self, user_data):
        """Create a new user with the provided data."""
        user = User(**user_data)
        user.hash_password(user_data['password'])
        self.user_repo.add(user)
        return user

    def get_user(self, user_id):
        """Retrieve a user by their ID."""
        return self.user_repo.get(user_id)

    def get_user_by_email(self, email):
        """Retrieve a user by their email address."""
        users = [user for user in self.user_repo.get_all()
                 if user.email == email]
        return users[0] if users else None

    def get_all_users(self):
        """Retrieve all users from the repository."""
        return self.user_repo.get_all()

    def update_user(self, user_id, user_data):
        """Update an existing user with new data."""
        user = self.user_repo.get(user_id)
        if user:
            user.update(user_data)
            return user
        return None
    # endregion

    # region Place Management
    def create_place(self, place_data):
        """Create a new place with the provided data."""
        # Validate that owner exists
        owner_id = place_data.get('owner_id')
        if not owner_id:
            raise ValueError("Owner ID is required")

        owner = self.get_user(owner_id)
        if not owner:
            raise ValueError("Owner not found")

        # Create place data with owner object instead of owner_id
        place_data_copy = place_data.copy()
        place_data_copy['owner'] = owner
        place_data_copy.pop('owner_id', None)

        # Extract amenities to add them separately after place creation
        amenities_list = place_data_copy.pop('amenities', [])

        place = Place(**place_data_copy)

        # Add amenities if provided
        for amenity in amenities_list:
            place.add_amenity(amenity)

        self.place_repo.add(place)
        return place

    def get_place(self, place_id):
        """Retrieve a place by its ID."""
        return self.place_repo.get(place_id)

    def get_all_places(self):
        """Retrieve all places from the repository."""
        return self.place_repo.get_all()

    def update_place(self, place_id, place_data):
        """Update an existing place with new data."""
        place = self.place_repo.get(place_id)
        if not place:
            return None

        # If updating owner, validate the new owner exists
        if 'owner_id' in place_data:
            new_owner = self.get_user(place_data['owner_id'])
            if not new_owner:
                raise ValueError("Owner not found")
            place_data = place_data.copy()
            place_data['owner'] = new_owner
            place_data.pop('owner_id')

        place.update(place_data)
        return place
    # endregion

    # region Review Management
    def create_review(self, review_data):
        """Create a new review with the provided data."""
        # Validate that user and place exist
        user_id = review_data.get('user_id')
        place_id = review_data.get('place_id')

        if not user_id:
            raise ValueError("User ID is required")
        if not place_id:
            raise ValueError("Place ID is required")

        user = self.get_user(user_id)
        if not user:
            raise ValueError("User not found")

        place = self.get_place(place_id)
        if not place:
            raise ValueError("Place not found")

        # Create review with proper constructor arguments
        text = review_data.get('text')
        rating = review_data.get('rating')

        review = Review(text, rating, place, user)
        self.review_repo.add(review)

        # Add review to place
        place.add_review(review)

        return review

    def get_review(self, review_id):
        """Retrieve a review by its ID."""
        return self.review_repo.get(review_id)

    def get_all_reviews(self):
        """Retrieve all reviews from the repository."""
        return self.review_repo.get_all()

    def get_reviews_by_place(self, place_id):
        """Retrieve all reviews for a specific place."""
        return [review for review in self.review_repo.get_all() if review.place_id == place_id]

    def update_review(self, review_id, review_data):
        """Update an existing review with new data."""
        review = self.review_repo.get(review_id)
        if not review:
            return None
        review.update(review_data)
        return review

    def delete_review(self, review_id):
        """Delete a review by its ID."""
        review = self.review_repo.get(review_id)
        if not review:
            return False

        # Remove review from place
        place = self.get_place(review.place_id)
        if place and review in place.reviews:
            place.reviews.remove(review)

        self.review_repo.delete(review_id)
        return True
    # endregion

    # region Amenity Management
    def create_amenity(self, amenity_data):
        """Create a new amenity with the provided data."""
        if "name" not in amenity_data or not amenity_data["name"]:
            raise ValueError("Amenity name is required")
        amenity = Amenity(**amenity_data)
        self.amenity_repo.add(amenity)
        return amenity

    def get_amenity(self, amenity_id):
        """Retrieve an amenity by its ID."""
        return self.amenity_repo.get(amenity_id)

    def get_all_amenities(self):
        """Retrieve all amenities from the repository."""
        return self.amenity_repo.get_all()

    def update_amenity(self, amenity_id, amenity_data):
        """Update an existing amenity with new data."""
        amenity = self.amenity_repo.get(amenity_id)
        if not amenity:
            raise ValueError("Amenity not found")
        if "name" not in amenity_data or not amenity_data["name"]:
            raise ValueError("Amenity name is required")
        if "name" in amenity_data:
            amenity.name = amenity_data["name"]
        self.amenity_repo.update(amenity_id, amenity_data)
        return amenity
    # endregion
