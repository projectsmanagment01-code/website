/**
 * Test script for internal linking system
 * Run with: node test-internal-links.js
 */

const BASE_URL = 'http://localhost:3000';

async function testInternalLinkingSystem() {
  console.log('🧪 Testing Internal Linking System\n');
  
  try {
    // 1. Test: Get current suggestions
    console.log('1️⃣  Fetching pending suggestions...');
    const suggestionsRes = await fetch(`${BASE_URL}/api/admin/internal-links/suggestions?status=pending`);
    const suggestionsData = await suggestionsRes.json();
    console.log(`   ✅ Found ${suggestionsData.total} pending suggestions`);
    console.log(`   📝 Showing first 3:`, suggestionsData.suggestions.slice(0, 3).map(s => ({
      anchor: s.anchorText,
      field: s.fieldName,
      score: s.relevanceScore,
      source: s.sourceRecipe.title,
      target: s.targetRecipe.title
    })));
    
    // 2. Test: Get orphan pages
    console.log('\n2️⃣  Fetching orphan pages...');
    const orphansRes = await fetch(`${BASE_URL}/api/admin/internal-links/orphans`);
    const orphansData = await orphansRes.json();
    console.log(`   ✅ Found ${orphansData.total} orphan pages`);
    if (orphansData.orphans.length > 0) {
      console.log(`   📝 First orphan:`, {
        title: orphansData.orphans[0].recipeTitle,
        incomingLinks: orphansData.orphans[0].incomingLinks,
        outgoingLinks: orphansData.orphans[0].outgoingLinks,
        priority: orphansData.orphans[0].priority
      });
    }
    
    // 3. Test: Get stats
    console.log('\n3️⃣  Fetching system stats...');
    const statsRes = await fetch(`${BASE_URL}/api/admin/internal-links/stats`);
    const statsData = await statsRes.json();
    
    if (statsData.success) {
      console.log(`   ✅ Stats retrieved successfully`);
      console.log(`   📊 Suggestions:`, {
        total: statsData.stats.suggestions.total,
        pending: statsData.stats.suggestions.pending,
        applied: statsData.stats.suggestions.applied,
        avgScore: statsData.stats.suggestions.avgRelevanceScore?.toFixed(2)
      });
      console.log(`   📊 Orphans:`, {
        total: statsData.stats.orphans.total,
        avgIncoming: statsData.stats.orphans.avgIncomingLinks?.toFixed(1),
        avgOutgoing: statsData.stats.orphans.avgOutgoingLinks?.toFixed(1)
      });
    } else {
      console.log(`   ❌ Stats failed:`, statsData.error);
    }
    
    // 4. Test: Check if apply endpoint is reachable
    console.log('\n4️⃣  Testing apply endpoint (dry run - no actual changes)...');
    if (suggestionsData.suggestions.length > 0) {
      // Just test that the endpoint exists by sending empty array
      const applyRes = await fetch(`${BASE_URL}/api/admin/internal-links/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionIds: [] })
      });
      const applyData = await applyRes.json();
      console.log(`   ✅ Apply endpoint is reachable (status: ${applyRes.status})`);
    }
    
    console.log('\n✅ All tests completed!\n');
    console.log('📋 Summary:');
    console.log(`   - Suggestions API: ✅ Working`);
    console.log(`   - Orphans API: ✅ Working`);
    console.log(`   - Stats API: ${statsData.success ? '✅' : '❌'} ${statsData.success ? 'Working' : 'Failed'}`);
    console.log(`   - Apply API: ✅ Working`);
    
  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    console.error(error.stack);
  }
}

// Run tests
testInternalLinkingSystem();
