#!/usr/bin/env python3
"""
Unit tests for the HBnB application endpoints.
Tests all CRUD operations for Users, Places, Reviews, and Amenities.
"""

import unittest
import json
from app import create_app
from app.services.facade import HBnBFacade


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


class TestUserEndpoints(TestHBnBApplication):
    """Test User-related endpoints."""

    def test_create_user_success(self):
        """Test successful user creation."""
        user_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com"
        }
        
        response = self.client.post('/api/v1/users/', 
                                  json=user_data,
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('id', data)
        self.assertEqual(data['first_name'], "John")
        self.assertEqual(data['last_name'], "Doe")
        self.assertEqual(data['email'], "john.doe@example.com")

    def test_create_user_duplicate_email(self):
        """Test user creation with duplicate email."""
        user_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com"
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
            "email": "invalid-email"
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
            "email": "jane.smith@example.com"
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
        # Create multiple users
        users_data = [
            {"first_name": "User1", "last_name": "Test", "email": "user1@test.com"},
            {"first_name": "User2", "last_name": "Test", "email": "user2@test.com"}
        ]
        
        for user_data in users_data:
            self.client.post('/api/v1/users/', 
                           json=user_data,
                           content_type='application/json')
        
        response = self.client.get('/api/v1/users/')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)

    def test_update_user_success(self):
        """Test successful user update."""
        # Create a user
        user_data = {
            "first_name": "Original",
            "last_name": "Name",
            "email": "original@example.com"
        }
        
        create_response = self.client.post('/api/v1/users/', 
                                         json=user_data,
                                         content_type='application/json')
        created_user = json.loads(create_response.data)
        user_id = created_user['id']
        
        # Update the user
        update_data = {
            "first_name": "Updated",
            "last_name": "Name",
            "email": "updated@example.com"
        }
        
        response = self.client.put(f'/api/v1/users/{user_id}', 
                                 json=update_data,
                                 content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['first_name'], "Updated")
        self.assertEqual(data['email'], "updated@example.com")

    def test_update_user_not_found(self):
        """Test updating non-existent user."""
        update_data = {
            "first_name": "Updated",
            "last_name": "Name",
            "email": "updated@example.com"
        }
        
        response = self.client.put('/api/v1/users/invalid-id', 
                                 json=update_data,
                                 content_type='application/json')
        
        self.assertEqual(response.status_code, 404)


class TestPlaceEndpoints(TestHBnBApplication):
    """Test Place-related endpoints."""

    def setUp(self):
        """Set up test data including a user for place ownership."""
        super().setUp()
        # Create a user first (needed for place ownership)
        user_data = {
            "first_name": "Owner",
            "last_name": "User",
            "email": "owner@example.com"
        }
        
        response = self.client.post('/api/v1/users/', 
                                  json=user_data,
                                  content_type='application/json')
        self.owner = json.loads(response.data)
        self.owner_id = self.owner['id']

    def test_create_place_success(self):
        """Test successful place creation."""
        place_data = {
            "title": "Beautiful Apartment",
            "description": "A lovely place to stay",
            "price": 120.50,
            "latitude": 40.7128,
            "longitude": -74.0060,
            "owner_id": self.owner_id
        }
        
        response = self.client.post('/api/v1/places/', 
                                  json=place_data,
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('id', data)
        self.assertEqual(data['title'], "Beautiful Apartment")
        self.assertEqual(data['price'], 120.50)

    def test_create_place_invalid_owner(self):
        """Test place creation with invalid owner."""
        place_data = {
            "title": "Test Place",
            "description": "Test description",
            "price": 100.0,
            "latitude": 40.0,
            "longitude": -74.0,
            "owner_id": "invalid-owner-id"
        }
        
        response = self.client.post('/api/v1/places/', 
                                  json=place_data,
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_get_place_success(self):
        """Test successful place retrieval."""
        # Create a place
        place_data = {
            "title": "Test Place",
            "description": "Test description",
            "price": 100.0,
            "latitude": 40.0,
            "longitude": -74.0,
            "owner_id": self.owner_id
        }
        
        create_response = self.client.post('/api/v1/places/', 
                                         json=place_data,
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
        # Create multiple places
        for i in range(2):
            place_data = {
                "title": f"Place {i}",
                "description": f"Description {i}",
                "price": 100.0 + i,
                "latitude": 40.0 + i,
                "longitude": -74.0 - i,
                "owner_id": self.owner_id
            }
            
            self.client.post('/api/v1/places/', 
                           json=place_data,
                           content_type='application/json')
        
        response = self.client.get('/api/v1/places/')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)


class TestReviewEndpoints(TestHBnBApplication):
    """Test Review-related endpoints."""

    def setUp(self):
        """Set up test data including user and place for reviews."""
        super().setUp()
        
        # Create an owner user
        owner_data = {
            "first_name": "Place",
            "last_name": "Owner", 
            "email": "owner@example.com"
        }
        response = self.client.post('/api/v1/users/', 
                                  json=owner_data,
                                  content_type='application/json')
        self.owner = json.loads(response.data)
        self.owner_id = self.owner['id']
        
        # Create a reviewer user
        reviewer_data = {
            "first_name": "Reviewer",
            "last_name": "User",
            "email": "reviewer@example.com"
        }
        response = self.client.post('/api/v1/users/', 
                                  json=reviewer_data,
                                  content_type='application/json')
        self.user = json.loads(response.data)
        self.user_id = self.user['id']
        
        # Create a place
        place_data = {
            "title": "Test Place",
            "description": "A place to review",
            "price": 100.0,
            "latitude": 40.0,
            "longitude": -74.0,
            "owner_id": self.owner_id
        }
        response = self.client.post('/api/v1/places/', 
                                  json=place_data,
                                  content_type='application/json')
        self.place = json.loads(response.data)
        self.place_id = self.place['id']

    def test_create_review_success(self):
        """Test successful review creation."""
        review_data = {
            "text": "Great place to stay!",
            "rating": 5,
            "user_id": self.user_id,
            "place_id": self.place_id
        }
        
        response = self.client.post('/api/v1/reviews/', 
                                  json=review_data,
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('id', data)
        self.assertEqual(data['text'], "Great place to stay!")
        self.assertEqual(data['rating'], 5)

    def test_create_review_invalid_user(self):
        """Test review creation with invalid user."""
        review_data = {
            "text": "Test review",
            "rating": 5,
            "user_id": "invalid-user-id",
            "place_id": self.place_id
        }
        
        response = self.client.post('/api/v1/reviews/', 
                                  json=review_data,
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_get_review_success(self):
        """Test successful review retrieval."""
        # Create a review
        review_data = {
            "text": "Test review",
            "rating": 4,
            "user_id": self.user_id,
            "place_id": self.place_id
        }
        
        create_response = self.client.post('/api/v1/reviews/', 
                                         json=review_data,
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
            "user_id": self.user_id,
            "place_id": self.place_id
        }
        
        create_response = self.client.post('/api/v1/reviews/', 
                                         json=review_data,
                                         content_type='application/json')
        created_review = json.loads(create_response.data)
        review_id = created_review['id']
        
        # Delete the review
        response = self.client.delete(f'/api/v1/reviews/{review_id}')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('message', data)


class TestAmenityEndpoints(TestHBnBApplication):
    """Test Amenity-related endpoints."""

    def test_create_amenity_success(self):
        """Test successful amenity creation."""
        amenity_data = {
            "name": "WiFi"
        }
        
        response = self.client.post('/api/v1/amenities/', 
                                  json=amenity_data,
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
        # Create multiple amenities
        amenities_data = [
            {"name": "WiFi"},
            {"name": "Parking"},
            {"name": "Pool"}
        ]
        
        for amenity_data in amenities_data:
            self.client.post('/api/v1/amenities/', 
                           json=amenity_data,
                           content_type='application/json')
        
        response = self.client.get('/api/v1/amenities/')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 3)

    def test_update_amenity_success(self):
        """Test successful amenity update."""
        # Create an amenity
        amenity_data = {
            "name": "Original Name"
        }
        
        create_response = self.client.post('/api/v1/amenities/', 
                                         json=amenity_data,
                                         content_type='application/json')
        created_amenity = json.loads(create_response.data)
        amenity_id = created_amenity['id']
        
        # Update the amenity
        update_data = {
            "name": "Updated Name"
        }
        
        response = self.client.put(f'/api/v1/amenities/{amenity_id}', 
                                 json=update_data,
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
        """Test user creation with empty required fields."""
        invalid_users = [
            {"first_name": "", "last_name": "Doe", "email": "test@example.com"},
            {"first_name": "John", "last_name": "", "email": "test@example.com"},
            {"first_name": "John", "last_name": "Doe", "email": ""}
        ]
        
        for user_data in invalid_users:
            response = self.client.post('/api/v1/users/', 
                                      json=user_data,
                                      content_type='application/json')
            self.assertEqual(response.status_code, 400)

    def test_place_validation_invalid_coordinates(self):
        """Test place creation with invalid coordinates."""
        # First create a user
        user_data = {
            "first_name": "Owner",
            "last_name": "User",
            "email": "owner@example.com"
        }
        response = self.client.post('/api/v1/users/', 
                                  json=user_data,
                                  content_type='application/json')
        owner = json.loads(response.data)
        
        invalid_places = [
            {
                "title": "Test",
                "description": "Test",
                "price": 100.0,
                "latitude": 91.0,  # Invalid latitude
                "longitude": 0.0,
                "owner_id": owner['id']
            },
            {
                "title": "Test",
                "description": "Test",
                "price": 100.0,
                "latitude": 0.0,
                "longitude": 181.0,  # Invalid longitude
                "owner_id": owner['id']
            }
        ]
        
        for place_data in invalid_places:
            response = self.client.post('/api/v1/places/', 
                                      json=place_data,
                                      content_type='application/json')
            self.assertEqual(response.status_code, 400)


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
    print(f"Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")
    
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