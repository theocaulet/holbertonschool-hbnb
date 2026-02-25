from app.persistence.repository import InMemoryRepository
from app.models import User
from app.models import Amenity


class HBnBFacade:
    """
    Facade class that provides a unified interface to the HBnB application's
    core functionality, managing users and amenities through repositories.
    """
    def __init__(self):
        """
        Initialize the HBnBFacade with in-memory repositories for users and amenities.
        """
        self.user_repo = InMemoryRepository()
        self.amenity_repo = InMemoryRepository()

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
