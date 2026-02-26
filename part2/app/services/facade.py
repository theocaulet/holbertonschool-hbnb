from app.persistence.repository import InMemoryRepository
from app.models import User, Amenity, Place, Review


class HBnBFacade:
    """
    Facade class that provides a unified interface to the HBnB application's
    core functionality, managing users and amenities through repositories.
    """
    def __init__(self):
        """
        Initialize the HBnBFacade with in-memory repositories for users, amenities, places, and reviews.
        """
        self.user_repo = InMemoryRepository()
        self.amenity_repo = InMemoryRepository()
        self.place_repo = InMemoryRepository()
        self.review_repo = InMemoryRepository()

    # region User Management
    def create_user(self, user_data):
        """
        Create a new user with the provided data.

        Args:
            user_data (dict): Dictionary containing user information

        Returns:
            User: The newly created user object

        Raises:
            ValueError: If user data is invalid
        """
        user = User(**user_data)
        self.user_repo.add(user)
        return user

    def get_user(self, user_id):
        """
        Retrieve a user by their ID.

        Args:
            user_id (str): The unique identifier of the user

        Returns:
            User or None: The user object if found, None otherwise
        """
        return self.user_repo.get(user_id)

    def get_user_by_email(self, email):
        """
        Retrieve a user by their email address.

        Args:
            email (str): The email address of the user

        Returns:
            User or None: The user object if found, None otherwise
        """
        return self.user_repo.get_by_attribute('email', email)

    def get_all_users(self):
        """
        Retrieve all users from the repository.

        Returns:
            list: List of all user objects
        """
        return self.user_repo.get_all()

    def update_user(self, user_id, user_data):
        """
        Update an existing user with new data.

        Args:
            user_id (str): The unique identifier of the user to update
            user_data (dict): Dictionary containing updated user information

        Returns:
            User or None: The updated user object if found, None otherwise
        """
        user = self.user_repo.get(user_id)
        if user:
            user.update(user_data)
            return user
        return None

    # endregion

    # region Amenity Management
    def create_amenity(self, amenity_data):
        """
        Create a new amenity with the provided data.

        Args:
            amenity_data (dict): Dictionary containing amenity information

        Returns:
            Amenity: The newly created amenity object

        Raises:
            ValueError: If amenity name is missing or empty
        """
        if "name" not in amenity_data or not amenity_data["name"]:
            raise ValueError("Amenity name is required")
        amenity = Amenity(**amenity_data)
        self.amenity_repo.add(amenity)
        return amenity

    def get_amenity(self, amenity_id):
        """
        Retrieve an amenity by its ID.

        Args:
            amenity_id (str): The unique identifier of the amenity

        Returns:
            Amenity or None: The amenity object if found, None otherwise
        """
        return self.amenity_repo.get(amenity_id)

    def get_all_amenities(self):
        """
        Retrieve all amenities from the repository.

        Returns:
            list: List of all amenity objects
        """
        return self.amenity_repo.get_all()

    def update_amenity(self, amenity_id, amenity_data):
        """
        Update an existing amenity with new data.

        Args:
            amenity_id (str): The unique identifier of the amenity to update
            amenity_data (dict): Dictionary containing updated amenity information

        Returns:
            Amenity: The updated amenity object

        Raises:
            ValueError: If amenity is not found or name is missing/empty
        """
        amenity = self.amenity_repo.get(amenity_id)
        if not amenity:
            raise ValueError("Amenity not found")
        if "name" not in amenity_data or not amenity_data["name"]:
            raise ValueError("Amenity name is required")
        if "name" in amenity_data:
            amenity.name = amenity_data["name"]
        self.amenity_repo.update(amenity)
        return amenity

    # endregion

    # region Places Management
    def create_place(self, place_data):
        """
        Create a new place with the provided data.

        Args:
            place_data (dict): Dictionary containing place information including owner_id

        Returns:
            Place: The newly created place object

        Raises:
            ValueError: If place data is invalid or owner doesn't exist
        """
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
        
        place = Place(**place_data_copy)
        self.place_repo.add(place)
        return place

    def get_place(self, place_id):
        """
        Retrieve a place by its ID.

        Args:
            place_id (str): The unique identifier of the place

        Returns:
            Place or None: The place object if found, None otherwise
        """
        return self.place_repo.get(place_id)

    def get_all_places(self):
        """
        Retrieve all places from the repository.

        Returns:
            list: List of all place objects
        """
        return self.place_repo.get_all()

    def update_place(self, place_id, place_data):
        """
        Update an existing place with new data.

        Args:
            place_id (str): The unique identifier of the place to update
            place_data (dict): Dictionary containing updated place information

        Returns:
            Place or None: The updated place object if found, None otherwise

        Raises:
            ValueError: If owner doesn't exist when updating owner_id
        """
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

    def get_places_by_owner(self, owner_id):
        """
        Retrieve all places owned by a specific user.

        Args:
            owner_id (str): The unique identifier of the owner

        Returns:
            list: List of place objects owned by the user
        """
        return [place for place in self.place_repo.get_all() if place.owner.id == owner_id]

    # endregion

    # region Reviews Management
    def create_review(self, review_data):
        """
        Create a new review with the provided data.

        Args:
            review_data (dict): Dictionary containing review information including user_id and place_id

        Returns:
            Review: The newly created review object

        Raises:
            ValueError: If review data is invalid, user or place doesn't exist
        """
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
        
        # Create review data with user and place objects instead of IDs
        review_data_copy = review_data.copy()
        review_data_copy['user'] = user
        review_data_copy['place'] = place
        review_data_copy.pop('user_id', None)
        review_data_copy.pop('place_id', None)
        
        review = Review(**review_data_copy)
        self.review_repo.add(review)
        
        # Add review to place's reviews list
        place.add_review(review)
        
        return review

    def get_review(self, review_id):
        """
        Retrieve a review by its ID.

        Args:
            review_id (str): The unique identifier of the review

        Returns:
            Review or None: The review object if found, None otherwise
        """
        return self.review_repo.get(review_id)

    def get_all_reviews(self):
        """
        Retrieve all reviews from the repository.

        Returns:
            list: List of all review objects
        """
        return self.review_repo.get_all()

    def get_reviews_by_place(self, place_id):
        """
        Retrieve all reviews for a specific place.

        Args:
            place_id (str): The unique identifier of the place

        Returns:
            list: List of review objects for the place
        """
        return [review for review in self.review_repo.get_all() if review.place_id == place_id]

    def get_reviews_by_user(self, user_id):
        """
        Retrieve all reviews written by a specific user.

        Args:
            user_id (str): The unique identifier of the user

        Returns:
            list: List of review objects written by the user
        """
        return [review for review in self.review_repo.get_all() if review.user_id == user_id]

    def update_review(self, review_id, review_data):
        """
        Update an existing review with new data.

        Args:
            review_id (str): The unique identifier of the review to update
            review_data (dict): Dictionary containing updated review information

        Returns:
            Review or None: The updated review object if found, None otherwise
        """
        review = self.review_repo.get(review_id)
        if not review:
            return None
            
        review.update(review_data)
        return review

    def delete_review(self, review_id):
        """
        Delete a review by its ID.

        Args:
            review_id (str): The unique identifier of the review to delete

        Returns:
            bool: True if review was deleted, False if not found
        """
        review = self.review_repo.get(review_id)
        if not review:
            return False
            
        # Remove review from place's reviews list
        place = self.get_place(review.place_id)
        if place and review in place.reviews:
            place.reviews.remove(review)
            
        # Delete review from repository
        self.review_repo.delete(review_id)
        return True

    # endregion
