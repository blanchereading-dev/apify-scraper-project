"""
Backend API Tests for ReEntry Connect MN
Tests all API endpoints: resources, categories, chat, submissions, seed
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://reentry-connect-1.preview.emergentagent.com')

class TestHealthAndRoot:
    """Test basic API health and root endpoint"""
    
    def test_api_root(self):
        """Test API root returns welcome message"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "ReEntry Connect MN API" in data["message"]
        print(f"✓ API root returns: {data['message']}")


class TestResourcesEndpoints:
    """Test /api/resources CRUD operations"""
    
    def test_get_all_resources(self):
        """Test GET /api/resources returns list of resources"""
        response = requests.get(f"{BASE_URL}/api/resources")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ GET /api/resources returned {len(data)} resources")
        
        # Verify resource structure
        resource = data[0]
        required_fields = ["id", "name", "category", "description", "address", "city", "latitude", "longitude"]
        for field in required_fields:
            assert field in resource, f"Missing field: {field}"
        print(f"✓ Resource structure validated with all required fields")
    
    def test_filter_resources_by_category(self):
        """Test filtering resources by category"""
        categories = ["housing", "legal", "employment", "healthcare", "education", "food"]
        
        for category in categories:
            response = requests.get(f"{BASE_URL}/api/resources?category={category}")
            assert response.status_code == 200
            data = response.json()
            
            # All returned resources should match the category
            for resource in data:
                assert resource["category"] == category, f"Expected {category}, got {resource['category']}"
            print(f"✓ Category filter '{category}' returned {len(data)} resources")
    
    def test_filter_resources_by_city(self):
        """Test filtering resources by city"""
        response = requests.get(f"{BASE_URL}/api/resources?city=Minneapolis")
        assert response.status_code == 200
        data = response.json()
        
        # All returned resources should be in Minneapolis
        for resource in data:
            assert "Minneapolis" in resource["city"], f"Expected Minneapolis, got {resource['city']}"
        print(f"✓ City filter 'Minneapolis' returned {len(data)} resources")
    
    def test_search_resources(self):
        """Test search functionality"""
        response = requests.get(f"{BASE_URL}/api/resources?search=housing")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        print(f"✓ Search 'housing' returned {len(data)} resources")
    
    def test_get_single_resource(self):
        """Test GET /api/resources/{id} returns single resource"""
        # First get all resources to get a valid ID
        all_response = requests.get(f"{BASE_URL}/api/resources")
        all_data = all_response.json()
        
        if len(all_data) > 0:
            resource_id = all_data[0]["id"]
            response = requests.get(f"{BASE_URL}/api/resources/{resource_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == resource_id
            print(f"✓ GET /api/resources/{resource_id} returned correct resource")
    
    def test_get_nonexistent_resource(self):
        """Test GET /api/resources/{id} with invalid ID returns 404"""
        response = requests.get(f"{BASE_URL}/api/resources/nonexistent-id-12345")
        assert response.status_code == 404
        print("✓ GET nonexistent resource returns 404")
    
    def test_create_resource(self):
        """Test POST /api/resources creates new resource"""
        new_resource = {
            "name": "TEST_Resource Center",
            "category": "housing",
            "description": "Test resource for automated testing",
            "address": "123 Test St",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55401",
            "phone": "(612) 555-0123",
            "website": "https://test.example.com",
            "hours": "Mon-Fri 9am-5pm",
            "services": ["Testing", "Automation"],
            "latitude": 44.9778,
            "longitude": -93.2650,
            "eligibility": "Test eligibility"
        }
        
        response = requests.post(f"{BASE_URL}/api/resources", json=new_resource)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == new_resource["name"]
        assert data["category"] == new_resource["category"]
        assert "id" in data
        print(f"✓ POST /api/resources created resource with ID: {data['id']}")
        
        # Verify resource was persisted
        get_response = requests.get(f"{BASE_URL}/api/resources/{data['id']}")
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["name"] == new_resource["name"]
        print("✓ Created resource verified via GET")


class TestCategoriesEndpoint:
    """Test /api/categories endpoint"""
    
    def test_get_categories(self):
        """Test GET /api/categories returns list of categories"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 6  # At least 6 categories
        
        # Verify category structure
        category = data[0]
        assert "id" in category
        assert "name" in category
        assert "icon" in category
        print(f"✓ GET /api/categories returned {len(data)} categories")
        
        # Verify expected categories exist
        category_ids = [c["id"] for c in data]
        expected = ["housing", "legal", "employment", "healthcare", "education", "food"]
        for exp in expected:
            assert exp in category_ids, f"Missing category: {exp}"
        print("✓ All expected categories present")


class TestChatEndpoint:
    """Test /api/chat endpoint with AI integration"""
    
    def test_chat_basic_message(self):
        """Test POST /api/chat with basic message"""
        chat_request = {
            "message": "I need help finding housing",
            "session_id": "test-session-123",
            "history": []
        }
        
        response = requests.post(f"{BASE_URL}/api/chat", json=chat_request, timeout=30)
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "session_id" in data
        assert len(data["response"]) > 0
        print(f"✓ Chat response received: {data['response'][:100]}...")
    
    def test_chat_with_history(self):
        """Test POST /api/chat with conversation history"""
        chat_request = {
            "message": "What about in Minneapolis?",
            "session_id": "test-session-456",
            "history": [
                {"role": "user", "content": "I need housing help"},
                {"role": "assistant", "content": "What area are you looking in?"}
            ]
        }
        
        response = requests.post(f"{BASE_URL}/api/chat", json=chat_request, timeout=30)
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        print(f"✓ Chat with history response: {data['response'][:100]}...")
    
    def test_chat_conversational_flow(self):
        """Test that chatbot asks clarifying questions before detailed answer"""
        chat_request = {
            "message": "I need help",
            "session_id": "test-session-789",
            "history": []
        }
        
        response = requests.post(f"{BASE_URL}/api/chat", json=chat_request, timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        # The response should be a question or short clarification, not a long detailed answer
        response_text = data["response"]
        assert len(response_text) < 500, "First response should be concise (asking clarifying question)"
        print(f"✓ Conversational flow: Initial response is concise ({len(response_text)} chars)")


class TestSubmissionsEndpoint:
    """Test /api/submissions endpoint"""
    
    def test_submit_resource(self):
        """Test POST /api/submissions creates new submission"""
        submission = {
            "name": "TEST_Community Center",
            "category": "housing",
            "description": "Test submission for automated testing",
            "address": "456 Test Ave",
            "city": "St. Paul",
            "county": "Ramsey",
            "phone": "(651) 555-0456",
            "website": "https://testsubmission.example.com",
            "services": "Testing, Automation",
            "submitterEmail": "test@example.com"
        }
        
        response = requests.post(f"{BASE_URL}/api/submissions", json=submission)
        assert response.status_code == 201
        data = response.json()
        assert "message" in data
        assert "id" in data
        print(f"✓ POST /api/submissions created submission with ID: {data['id']}")
    
    def test_get_submissions(self):
        """Test GET /api/submissions returns list of submissions"""
        response = requests.get(f"{BASE_URL}/api/submissions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/submissions returned {len(data)} submissions")


class TestSeedEndpoint:
    """Test /api/seed endpoint"""
    
    def test_seed_database(self):
        """Test POST /api/seed seeds database (idempotent)"""
        response = requests.post(f"{BASE_URL}/api/seed")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ POST /api/seed response: {data['message']}")


class TestDataIntegrity:
    """Test data integrity and relationships"""
    
    def test_resources_have_valid_categories(self):
        """Verify all resources have valid category IDs"""
        # Get categories
        cat_response = requests.get(f"{BASE_URL}/api/categories")
        categories = cat_response.json()
        valid_category_ids = [c["id"] for c in categories]
        
        # Get resources
        res_response = requests.get(f"{BASE_URL}/api/resources")
        resources = res_response.json()
        
        for resource in resources:
            assert resource["category"] in valid_category_ids, \
                f"Resource '{resource['name']}' has invalid category: {resource['category']}"
        
        print(f"✓ All {len(resources)} resources have valid categories")
    
    def test_resources_have_valid_coordinates(self):
        """Verify all resources have valid lat/long for Minnesota"""
        response = requests.get(f"{BASE_URL}/api/resources")
        resources = response.json()
        
        # Minnesota approximate bounds
        MN_LAT_MIN, MN_LAT_MAX = 43.0, 49.5
        MN_LON_MIN, MN_LON_MAX = -97.5, -89.0
        
        for resource in resources:
            lat = resource["latitude"]
            lon = resource["longitude"]
            assert MN_LAT_MIN <= lat <= MN_LAT_MAX, \
                f"Resource '{resource['name']}' has invalid latitude: {lat}"
            assert MN_LON_MIN <= lon <= MN_LON_MAX, \
                f"Resource '{resource['name']}' has invalid longitude: {lon}"
        
        print(f"✓ All {len(resources)} resources have valid Minnesota coordinates")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
