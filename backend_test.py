#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
from typing import Dict, List, Any

class ReEntryConnectAPITester:
    def __init__(self, base_url="https://reentry-connect-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test_name": name,
            "success": success,
            "details": details,
            "response_data": response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Dict = None, params: Dict = None) -> tuple:
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            response_data = None
            
            try:
                response_data = response.json()
            except:
                response_data = response.text

            details = f"Status: {response.status_code} (expected {expected_status})"
            if not success:
                details += f" | Response: {str(response_data)[:200]}"
            
            self.log_test(name, success, details, response_data if not success else None)
            return success, response_data

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, str(e)

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_seed_database(self):
        """Test database seeding"""
        return self.run_test("Seed Database", "POST", "seed", 200)

    def test_get_categories(self):
        """Test get categories endpoint"""
        success, data = self.run_test("Get Categories", "GET", "categories", 200)
        if success and isinstance(data, list):
            expected_categories = ["housing", "legal", "employment", "healthcare", "education", "food", "transportation"]
            found_categories = [cat.get("id") for cat in data if isinstance(cat, dict)]
            missing = set(expected_categories) - set(found_categories)
            if missing:
                self.log_test("Categories Validation", False, f"Missing categories: {missing}")
            else:
                self.log_test("Categories Validation", True, f"Found all {len(found_categories)} categories")
        return success, data

    def test_get_all_resources(self):
        """Test get all resources"""
        success, data = self.run_test("Get All Resources", "GET", "resources", 200)
        if success and isinstance(data, list):
            self.log_test("Resources Count", True, f"Found {len(data)} resources")
            if len(data) >= 16:
                self.log_test("Expected Resource Count", True, f"Has {len(data)} resources (expected ≥16)")
            else:
                self.log_test("Expected Resource Count", False, f"Only {len(data)} resources (expected ≥16)")
        return success, data

    def test_filter_by_category(self):
        """Test filtering resources by category"""
        categories = ["housing", "legal", "employment", "healthcare"]
        for category in categories:
            success, data = self.run_test(
                f"Filter by {category.title()}", 
                "GET", 
                "resources", 
                200, 
                params={"category": category}
            )
            if success and isinstance(data, list):
                # Verify all returned resources match the category
                wrong_category = [r for r in data if r.get("category") != category]
                if wrong_category:
                    self.log_test(f"{category.title()} Filter Validation", False, 
                                f"Found {len(wrong_category)} resources with wrong category")
                else:
                    self.log_test(f"{category.title()} Filter Validation", True, 
                                f"All {len(data)} resources match category")

    def test_search_functionality(self):
        """Test search functionality"""
        search_terms = ["housing", "legal", "employment", "Minneapolis"]
        for term in search_terms:
            success, data = self.run_test(
                f"Search '{term}'", 
                "GET", 
                "resources", 
                200, 
                params={"search": term}
            )
            if success and isinstance(data, list):
                self.log_test(f"Search '{term}' Results", True, f"Found {len(data)} matching resources")

    def test_get_specific_resource(self):
        """Test getting a specific resource by ID"""
        # First get all resources to get a valid ID
        success, resources = self.run_test("Get Resources for ID Test", "GET", "resources", 200)
        if success and resources and len(resources) > 0:
            resource_id = resources[0].get("id")
            if resource_id:
                success, data = self.run_test(
                    f"Get Resource by ID", 
                    "GET", 
                    f"resources/{resource_id}", 
                    200
                )
                if success and isinstance(data, dict):
                    if data.get("id") == resource_id:
                        self.log_test("Resource ID Match", True, "Retrieved resource matches requested ID")
                    else:
                        self.log_test("Resource ID Match", False, "Retrieved resource ID doesn't match")
            else:
                self.log_test("Resource ID Test", False, "No resource ID found in first resource")
        else:
            self.log_test("Resource ID Test", False, "Could not get resources for ID test")

    def test_nonexistent_resource(self):
        """Test getting a non-existent resource"""
        fake_id = "nonexistent-resource-id-12345"
        success, data = self.run_test(
            "Get Non-existent Resource", 
            "GET", 
            f"resources/{fake_id}", 
            404
        )

    def test_chat_functionality(self):
        """Test chat endpoint"""
        chat_data = {
            "message": "Hello, I need help finding housing resources in Minneapolis",
            "session_id": "test-session-123",
            "history": []
        }
        
        success, data = self.run_test("Chat Request", "POST", "chat", 200, data=chat_data)
        if success and isinstance(data, dict):
            if "response" in data and "session_id" in data:
                response_text = data.get("response", "")
                if len(response_text) > 10:  # Basic check for meaningful response
                    self.log_test("Chat Response Quality", True, f"Got {len(response_text)} character response")
                else:
                    self.log_test("Chat Response Quality", False, "Response too short or empty")
            else:
                self.log_test("Chat Response Format", False, "Missing required fields in response")

    def test_create_resource(self):
        """Test creating a new resource"""
        new_resource = {
            "name": "Test Resource Center",
            "category": "housing",
            "description": "A test resource for automated testing",
            "address": "123 Test Street",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55401",
            "phone": "(612) 555-0123",
            "email": "test@example.com",
            "website": "https://test.example.com",
            "hours": "Mon-Fri 9am-5pm",
            "services": ["Testing", "Validation"],
            "latitude": 44.9778,
            "longitude": -93.2650,
            "eligibility": "Test users only"
        }
        
        success, data = self.run_test("Create Resource", "POST", "resources", 201, data=new_resource)
        if success and isinstance(data, dict):
            created_id = data.get("id")
            if created_id:
                self.log_test("Resource Creation ID", True, f"Created resource with ID: {created_id}")
                return created_id
            else:
                self.log_test("Resource Creation ID", False, "No ID returned for created resource")
        return None

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting ReEntry Connect MN API Tests")
        print("=" * 50)
        
        # Basic connectivity
        self.test_root_endpoint()
        
        # Database seeding
        self.test_seed_database()
        
        # Categories
        self.test_get_categories()
        
        # Resources
        self.test_get_all_resources()
        self.test_filter_by_category()
        self.test_search_functionality()
        self.test_get_specific_resource()
        self.test_nonexistent_resource()
        
        # Chat functionality
        self.test_chat_functionality()
        
        # Resource creation
        created_id = self.test_create_resource()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests failed")
            print("\nFailed tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test_name']}: {result['details']}")
            return 1

def main():
    tester = ReEntryConnectAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())