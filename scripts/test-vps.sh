#!/bin/bash

# VPS Error Handling Test Script
# Usage: ./test-vps.sh https://yourdomain.com

DOMAIN=$1
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

if [ -z "$DOMAIN" ]; then
    echo "Usage: ./test-vps.sh https://yourdomain.com"
    exit 1
fi

echo -e "${CYAN}🧪 Testing Error Handling on VPS${NC}"
echo "Target: $DOMAIN"
echo "================================"

PASSED=0
FAILED=0
WARNINGS=0

# Test 1: Health Check
echo -e "\n${YELLOW}Test 1: Health Check${NC}"
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/api/health)
if [ "$HEALTH" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Health endpoint returned 200"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - Health endpoint returned $HEALTH"
    ((FAILED++))
fi

# Test 2: Database Health
echo -e "\n${YELLOW}Test 2: Database Health Check${NC}"
DB_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/api/health/db)
if [ "$DB_HEALTH" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Database health returned 200"
    RESPONSE=$(curl -s $DOMAIN/api/health/db)
    echo "  $(echo $RESPONSE | jq -r '.responseTime // "N/A"')"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - Database health returned $DB_HEALTH"
    ((FAILED++))
fi

# Test 3: API Routes - Recipes
echo -e "\n${YELLOW}Test 3: Recipe API${NC}"
RECIPES=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/api/recipe?limit=5)
if [ "$RECIPES" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Recipe API returned 200"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - Recipe API returned $RECIPES"
    ((FAILED++))
fi

# Test 4: Categories
echo -e "\n${YELLOW}Test 4: Categories API${NC}"
CATEGORIES=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/api/categories)
if [ "$CATEGORIES" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Categories API returned 200"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - Categories API returned $CATEGORIES"
    ((FAILED++))
fi

# Test 5: Trending Recipes
echo -e "\n${YELLOW}Test 5: Trending Recipes${NC}"
TRENDING=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/api/recipe/trending?limit=5)
if [ "$TRENDING" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Trending API returned 200"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - Trending API returned $TRENDING"
    ((FAILED++))
fi

# Test 6: Latest Recipes
echo -e "\n${YELLOW}Test 6: Latest Recipes${NC}"
LATEST=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/api/recipe/latest?limit=5)
if [ "$LATEST" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Latest API returned 200"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - Latest API returned $LATEST"
    ((FAILED++))
fi

# Test 7: 404 Handling
echo -e "\n${YELLOW}Test 7: 404 Error Handling${NC}"
NOT_FOUND=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/api/recipe/non-existent-12345)
if [ "$NOT_FOUND" -eq 404 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Properly returns 404 for missing resources"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARN${NC} - Expected 404, got $NOT_FOUND"
    ((WARNINGS++))
fi

# Test 8: Unauthorized Access
echo -e "\n${YELLOW}Test 8: Authentication${NC}"
UPLOAD=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/api/upload)
if [ "$UPLOAD" -eq 401 ] || [ "$UPLOAD" -eq 403 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Upload endpoint requires authentication ($UPLOAD)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARN${NC} - Upload endpoint returned $UPLOAD"
    ((WARNINGS++))
fi

# Test 9: Invalid JSON Handling
echo -e "\n${YELLOW}Test 9: Invalid JSON Handling${NC}"
INVALID=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST $DOMAIN/api/recipe \
    -H "Content-Type: application/json" \
    -d "invalid json")
if [ "$INVALID" -ge 400 ] && [ "$INVALID" -lt 500 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Invalid JSON properly rejected ($INVALID)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARN${NC} - Invalid JSON returned $INVALID"
    ((WARNINGS++))
fi

# Test 10: Response Time
echo -e "\n${YELLOW}Test 10: Response Time${NC}"
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" $DOMAIN/api/health)
echo "  Response time: ${RESPONSE_TIME}s"
if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l 2>/dev/null || echo "1") )); then
    echo -e "${GREEN}✅ PASS${NC} - Response time under 1 second"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARN${NC} - Response time over 1 second"
    ((WARNINGS++))
fi

# Test 11: Load Test (light) - Optional
if command -v ab &> /dev/null; then
    echo -e "\n${YELLOW}Test 11: Light Load Test${NC}"
    ab -n 100 -c 5 -q $DOMAIN/api/health > /tmp/ab-test.txt 2>&1
    FAILED_REQUESTS=$(grep "Failed requests" /tmp/ab-test.txt | awk '{print $3}')
    if [ "$FAILED_REQUESTS" -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC} - 100 requests with 0 failures"
        grep "Time per request" /tmp/ab-test.txt | head -1 | sed 's/^/  /'
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - $FAILED_REQUESTS failed requests"
        ((FAILED++))
    fi
else
    echo -e "\n${YELLOW}Test 11: Light Load Test${NC}"
    echo -e "${YELLOW}⚠️  SKIP${NC} - Apache Bench not installed (install with: apt-get install apache2-utils)"
fi

# Summary
echo -e "\n${CYAN}================================${NC}"
echo -e "${CYAN}Test Summary${NC}"
echo -e "${CYAN}================================${NC}"
echo -e "${GREEN}Passed:   $PASSED${NC}"
echo -e "${RED}Failed:   $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"

TOTAL=$((PASSED + FAILED + WARNINGS))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo -e "\n${CYAN}Success Rate: $PERCENTAGE%${NC}"

if [ "$FAILED" -eq 0 ]; then
    echo -e "\n${GREEN}✅ All critical tests passed!${NC}"
    echo -e "${GREEN}🚀 VPS is ready for production${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed${NC}"
    echo -e "${RED}Please check the errors above${NC}"
    exit 1
fi
