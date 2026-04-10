#!/usr/bin/env python3
"""
Unit tests for the HBnB application endpoints.
Tests all CRUD operations for Users, Places, Reviews, and Amenities.
"""

import unittest
import json
from uuid import uuid4
from app import create_app


class TestHBnBApplication(unittest.TestCase):
    """Test suite for HBnB application endpoints."""

    def setUp(self):
        """Set up test client and application context."""
        self.app = create_app()
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()

        # Reset facade for each test
        from app.services import facade
        facade.user_repo = facade.user_repo.__class__()
        facade.place_repo = facade.place_repo.__class__()
        facade.review_repo = facade.review_repo.__class__()
        facade.amenity_repo = facade.amenity_repo.__class__()

    def tearDown(self):
        """Clean up after each test."""
        self.app_context.pop()

    def _unique_email(self, prefix="user"):
        """Generate a unique email for isolated tests on persistent DB."""
        return f"{prefix}_{uuid4().hex}@example.com"

    def _create_user_via_api(self, first_name="John", last_name="Doe", password="test1234", email=None):
        """Create a user through API and return (response, payload, email, password)."""
        email = email or self._unique_email(first_name.lower())
        payload = {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "password": password
        }
        response = self.client.post('/api/v1/users/', json=payload, content_type='application/json')
        data = json.loads(response.data)
        return response, data, email, password

    def _login_and_get_token(self, email, password):
        """Authenticate a user and return the JWT access token."""
        response = self.client.post(
            '/api/v1/auth/login',
            json={"email": email, "password": password},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('access_token', data)
        return data['access_token']

    def _auth_headers(self, token):
        """Build Authorization headers for JWT protected routes."""
        return {'Authorization': f'Bearer {token}'}

    def _create_admin_and_get_token(self):
        """Create an admin user directly via facade and return an auth token."""
        from app.services import facade

        admin_password = "admin1234"
        admin_email = self._unique_email("admin")
        admin_user = facade.create_user({
            "first_name": "Admin",
            "last_name": "Test",
            "email": admin_email,
            "password": admin_password,
            "is_admin": True
        })
        admin_user.is_admin = True
        facade.user_repo.update(admin_user.id, {"is_admin": True})

        token = self._login_and_get_token(admin_email, admin_password)
        return token


class TestUserEndpoints(TestHBnBApplication):
    """Test User-related endpoints."""

    def test_create_user_success(self):
        """Test successful user creation."""
        user_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": self._unique_email("john"),
            "password": "test1234"
        }

        response = self.client.post('/api/v1/users/',
                                    json=user_data,
                                    content_type='application/json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('id', data)
        self.assertEqual(data['first_name'], "John")
        self.assertEqual(data['last_name'], "Doe")
        self.assertEqual(data['email'], user_data['email'])

    def test_create_user_duplicate_email(self):
        """Test user creation with duplicate email."""
        email = self._unique_email("john")
        user_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": email,
            "password": "test1234"
        }

        # Create first user
        self.client.post('/api/v1/users/',
                         json=user_data,
                         content_type='application/json')

        # Try to create second user with same email
        response = self.client.post('/api/v1/users/',
                                    json=user_data,
                                    content_type='application/json')

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Email already registered')

    def test_create_user_invalid_data(self):
        """Test user creation with invalid data."""
        invalid_data = {
            "first_name": "",
            "last_name": "",
            "email": "invalid-email",
            "password": "test1234"
        }

        response = self.client.post('/api/v1/users/',
                                    json=invalid_data,
                                    content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_get_user_success(self):
        """Test successful user retrieval."""
        # First create a user
        user_data = {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": self._unique_email("jane"),
            "password": "test1234"
        }

        create_response = self.client.post('/api/v1/users/',
                                           json=user_data,
                                           content_type='application/json')
        created_user = json.loads(create_response.data)
        user_id = created_user['id']

        # Now retrieve the user
        response = self.client.get(f'/api/v1/users/{user_id}')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['id'], user_id)
        self.assertEqual(data['first_name'], "Jane")

    def test_get_user_not_found(self):
        """Test user retrieval with invalid ID."""
        response = self.client.get('/api/v1/users/invalid-id')

        self.assertEqual(response.status_code, 404)
        data = json.loads(response.data)
        self.assertIn('error', data)

    def test_get_all_users(self):
        """Test retrieving all users."""
        baseline_response = self.client.get('/api/v1/users/')
        baseline_data = json.loads(baseline_response.data)

        # Create multiple users
        users_data = [
            {
                "first_name": "User1",
                "last_name": "Test",
                "email": self._unique_email("user1"),
                "password": "test1234"
            },
            {
                "first_name": "User2",
                "last_name": "Test",
                "email": self._unique_email("user2"),
                "password": "test1234"
            }
        ]

        for user_data in users_data:
            self.client.post('/api/v1/users/',
                             json=user_data,
                             content_type='application/json')

        response = self.client.get('/api/v1/users/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), len(baseline_data) + 2)

    def test_update_user_success(self):
        """Test successful user update."""
        create_response, created_user, email, password = self._create_user_via_api(
            first_name="Original",
            last_name="Name"
        )
        self.assertEqual(create_response.status_code, 201)
        user_id = created_user['id']
        token = self._login_and_get_token(email, password)

        # Update the user
        update_data = {
            "first_name": "Updated",
            "last_name": "Name"
        }

        response = self.client.put(f'/api/v1/users/{user_id}',
                                   json=update_data,
                                   headers=self._auth_headers(token),
                                   content_type='application/json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['first_name'], "Updated")
        self.assertEqual(data['email'], email)

    def test_update_user_not_found(self):
        """Test updating non-existent user."""
        admin_token = self._create_admin_and_get_token()
        update_data = {
            "first_name": "Updated",
            "last_name": "Name",
            "email": "updated@example.com"
        }

        response = self.client.put('/api/v1/users/invalid-id',
                                   json=update_data,
                                   headers=self._auth_headers(admin_token),
                                   content_type='application/json')

        self.assertEqual(response.status_code, 404)


class TestPlaceEndpoints(TestHBnBApplication):
    """Test Place-related endpoints."""

    def setUp(self):
        """Set up test data including a user for place ownership."""
        super().setUp()
        create_response, self.owner, email, password = self._create_user_via_api(
            first_name="Owner",
            last_name="User"
        )
        self.assertEqual(create_response.status_code, 201)
        self.owner_token = self._login_and_get_token(email, password)
        self.owner_id = self.owner['id']

    def test_create_place_success(self):
        """Test successful place creation."""
        place_data = {
            "title": "Beautiful Apartment",
            "description": "A lovely place to stay",
            "price": 120.50,
            "latitude": 40.7128,
            "longitude": -74.0060
        }

        response = self.client.post('/api/v1/places/',
                                    json=place_data,
                                    headers=self._auth_headers(self.owner_token),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('id', data)
        self.assertEqual(data['title'], "Beautiful Apartment")
        self.assertEqual(data['price'], 120.50)

    def test_create_place_invalid_owner(self):
        """Test place creation without authentication."""
        place_data = {
            "title": "Test Place",
            "description": "Test description",
            "price": 100.0,
            "latitude": 40.0,
            "longitude": -74.0
        }

        response = self.client.post('/api/v1/places/',
                                    json=place_data,
                                    content_type='application/json')

        self.assertEqual(response.status_code, 401)

    def test_get_place_success(self):
        """Test successful place retrieval."""
        # Create a place
        place_data = {
            "title": "Test Place",
            "description": "Test description",
            "price": 100.0,
            "latitude": 40.0,
            "longitude": -74.0
        }

        create_response = self.client.post('/api/v1/places/',
                                           json=place_data,
                                           headers=self._auth_headers(self.owner_token),
                                           content_type='application/json')
        created_place = json.loads(create_response.data)
        place_id = created_place['id']

        # Retrieve the place
        response = self.client.get(f'/api/v1/places/{place_id}')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['title'], "Test Place")

    def test_get_all_places(self):
        """Test retrieving all places."""
        baseline_response = self.client.get('/api/v1/places/')
        baseline_data = json.loads(baseline_response.data)

        # Create multiple places
        for i in range(2):
            place_data = {
                "title": f"Place {i}",
                "description": f"Description {i}",
                "price": 100.0 + i,
                "latitude": 40.0 + i,
                "longitude": -74.0 - i
            }

            self.client.post('/api/v1/places/',
                             json=place_data,
                             headers=self._auth_headers(self.owner_token),
                             content_type='application/json')

        response = self.client.get('/api/v1/places/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), len(baseline_data) + 2)


class TestReviewEndpoints(TestHBnBApplication):
    """Test Review-related endpoints."""

    def setUp(self):
        """Set up test data including user and place for reviews."""
        super().setUp()

        create_owner_response, self.owner, owner_email, owner_password = self._create_user_via_api(
            first_name="Place",
            last_name="Owner"
        )
        self.assertEqual(create_owner_response.status_code, 201)
        self.owner_token = self._login_and_get_token(owner_email, owner_password)
        self.owner_id = self.owner['id']

        create_reviewer_response, self.user, reviewer_email, reviewer_password = self._create_user_via_api(
            first_name="Reviewer",
            last_name="User"
        )
        self.assertEqual(create_reviewer_response.status_code, 201)
        self.reviewer_token = self._login_and_get_token(reviewer_email, reviewer_password)
        self.user_id = self.user['id']

        # Create a place
        place_data = {
            "title": "Test Place",
            "description": "A place to review",
            "price": 100.0,
            "latitude": 40.0,
            "longitude": -74.0
        }
        response = self.client.post('/api/v1/places/',
                                    json=place_data,
                                    headers=self._auth_headers(self.owner_token),
                                    content_type='application/json')
        self.place = json.loads(response.data)
        self.place_id = self.place['id']

    def test_create_review_success(self):
        """Test successful review creation."""
        review_data = {
            "text": "Great place to stay!",
            "rating": 5,
            "place_id": self.place_id
        }

        response = self.client.post('/api/v1/reviews/',
                                    json=review_data,
                                    headers=self._auth_headers(self.reviewer_token),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('id', data)
        self.assertEqual(data['text'], "Great place to stay!")
        self.assertEqual(data['rating'], 5)

    def test_create_review_invalid_user(self):
        """Test review creation for a missing place."""
        review_data = {
            "text": "Test review",
            "rating": 5,
            "place_id": "invalid-place-id"
        }

        response = self.client.post('/api/v1/reviews/',
                                    json=review_data,
                                    headers=self._auth_headers(self.reviewer_token),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 404)

    def test_get_review_success(self):
        """Test successful review retrieval."""
        # Create a review
        review_data = {
            "text": "Test review",
            "rating": 4,
            "place_id": self.place_id
        }

        create_response = self.client.post('/api/v1/reviews/',
                                           json=review_data,
                                           headers=self._auth_headers(self.reviewer_token),
                                           content_type='application/json')
        created_review = json.loads(create_response.data)
        review_id = created_review['id']

        # Retrieve the review
        response = self.client.get(f'/api/v1/reviews/{review_id}')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['text'], "Test review")

    def test_delete_review_success(self):
        """Test successful review deletion."""
        # Create a review
        review_data = {
            "text": "Review to delete",
            "rating": 3,
            "place_id": self.place_id
        }

        create_response = self.client.post('/api/v1/reviews/',
                                           json=review_data,
                                           headers=self._auth_headers(self.reviewer_token),
                                           content_type='application/json')
        created_review = json.loads(create_response.data)
        review_id = created_review['id']

        # Delete the review
        response = self.client.delete(
            f'/api/v1/reviews/{review_id}',
            headers=self._auth_headers(self.reviewer_token)
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('message', data)


class TestAmenityEndpoints(TestHBnBApplication):
    """Test Amenity-related endpoints."""

    def setUp(self):
        """Prepare admin token for protected amenity routes."""
        super().setUp()
        self.admin_token = self._create_admin_and_get_token()
        self.admin_headers = self._auth_headers(self.admin_token)

    def test_create_amenity_success(self):
        """Test successful amenity creation."""
        amenity_data = {
            "name": "WiFi"
        }

        response = self.client.post('/api/v1/amenities/',
                                    json=amenity_data,
                                    headers=self.admin_headers,
                                    content_type='application/json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('id', data)
        self.assertEqual(data['name'], "WiFi")

    def test_create_amenity_empty_name(self):
        """Test amenity creation with empty name."""
        amenity_data = {
            "name": ""
        }

        response = self.client.post('/api/v1/amenities/',
                                    json=amenity_data,
                                    headers=self.admin_headers,
                                    content_type='application/json')

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)

    def test_get_amenity_success(self):
        """Test successful amenity retrieval."""
        # Create an amenity first
        amenity_data = {
            "name": "Air Conditioning"
        }

        create_response = self.client.post('/api/v1/amenities/',
                                           json=amenity_data,
                                           headers=self.admin_headers,
                                           content_type='application/json')
        created_amenity = json.loads(create_response.data)
        amenity_id = created_amenity['id']

        # Retrieve the amenity
        response = self.client.get(f'/api/v1/amenities/{amenity_id}')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['name'], "Air Conditioning")

    def test_get_all_amenities(self):
        """Test retrieving all amenities."""
        baseline_response = self.client.get('/api/v1/amenities/')
        baseline_data = json.loads(baseline_response.data)

        # Create multiple amenities
        amenities_data = [
            {"name": "WiFi"},
            {"name": "Parking"},
            {"name": "Pool"}
        ]

        for amenity_data in amenities_data:
            self.client.post('/api/v1/amenities/',
                             json=amenity_data,
                             headers=self.admin_headers,
                             content_type='application/json')

        response = self.client.get('/api/v1/amenities/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), len(baseline_data) + 3)

    def test_update_amenity_success(self):
        """Test successful amenity update."""
        # Create an amenity
        amenity_data = {
            "name": "Original Name"
        }

        create_response = self.client.post('/api/v1/amenities/',
                                           json=amenity_data,
                                           headers=self.admin_headers,
                                           content_type='application/json')
        created_amenity = json.loads(create_response.data)
        amenity_id = created_amenity['id']

        # Update the amenity
        update_data = {
            "name": "Updated Name"
        }

        response = self.client.put(f'/api/v1/amenities/{amenity_id}',
                                   json=update_data,
                                   headers=self.admin_headers,
                                   content_type='application/json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['name'], "Updated Name")

    def test_get_amenity_not_found(self):
        """Test amenity retrieval with invalid ID."""
        response = self.client.get('/api/v1/amenities/invalid-id')

        self.assertEqual(response.status_code, 404)
        data = json.loads(response.data)
        self.assertIn('error', data)


class TestValidation(TestHBnBApplication):
    """Test validation logic."""

    def test_user_validation_empty_fields(self):
        """Test user creation with missing required fields."""
        invalid_users = [
            {
                "first_name": "John",
                "last_name": "Doe",
                "password": "test1234"
            },
            {
                "first_name": "John",
                "last_name": "Doe",
                "email": self._unique_email("test2")
            },
            {
                "last_name": "Doe",
                "email": self._unique_email("test3"),
                "password": "test1234"
            }
        ]

        for user_data in invalid_users:
            response = self.client.post('/api/v1/users/',
                                        json=user_data,
                                        content_type='application/json')
            self.assertEqual(response.status_code, 400)

    def test_place_creation_requires_authentication(self):
        """Test place creation is blocked without JWT token."""
        place_data = {
            "title": "Test",
            "description": "Test",
            "price": 100.0,
            "latitude": 91.0,
            "longitude": 0.0
        }

        response = self.client.post('/api/v1/places/',
                                    json=place_data,
                                    content_type='application/json')
        self.assertEqual(response.status_code, 401)


def run_tests():
    """Run all tests and display results."""
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # Add test classes
    test_classes = [
        TestUserEndpoints,
        TestPlaceEndpoints,
        TestReviewEndpoints,
        TestAmenityEndpoints,
        TestValidation
    ]

    for test_class in test_classes:
        tests = loader.loadTestsFromTestCase(test_class)
        suite.addTests(tests)

    # Run tests with detailed output
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    # Print summary
    print(f"\n{'='*60}")
    print(f"TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(
        f"Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")

    if result.failures:
        print(f"\nFAILURES:")
        for test, traceback in result.failures:
            print(f"- {test}")

    if result.errors:
        print(f"\nERRORS:")
        for test, traceback in result.errors:
            print(f"- {test}")

    return result.wasSuccessful()


if __name__ == '__main__':
    print("🧪 Running HBnB Application Unit Tests")
    print("="*60)
    success = run_tests()

    if success:
        print("\n🎉 All tests passed!")
        exit(0)
    else:
        print("\n❌ Some tests failed!")
        exit(1)
