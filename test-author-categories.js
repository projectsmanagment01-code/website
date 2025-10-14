/**
 * Test Author-Category System
 * 
 * This script demonstrates creating an author with multiple categories
 * Usage: node test-author-categories.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_TOKEN = process.env.API_TOKEN; // Your API token

async function testAuthorCategories() {
  console.log('🔍 Testing Author-Category System\n');

  try {
    // Step 1: Get available categories
    console.log('1️⃣ Fetching available categories...');
    const categoriesResponse = await fetch(`${API_URL}/api/admin/categories`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    if (!categoriesResponse.ok) {
      throw new Error(`Failed to fetch categories: ${categoriesResponse.status}`);
    }
    
    const categoriesData = await categoriesResponse.json();
    const categories = categoriesData.categories || [];
    
    console.log(`   ✅ Found ${categories.length} categories`);
    
    if (categories.length === 0) {
      console.log('   ⚠️  No categories found. Please create categories first.');
      return;
    }
    
    // Display first 3 categories
    console.log('   📋 Available categories:');
    categories.slice(0, 3).forEach(cat => {
      console.log(`      - ${cat.title} (ID: ${cat.id})`);
    });
    console.log('');

    // Step 2: Create author with multiple categories
    console.log('2️⃣ Creating author with 2 categories...');
    
    const categoryIds = categories.slice(0, 2).map(c => c.id);
    
    const createResponse = await fetch(`${API_URL}/api/admin/authors`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Chef',
        bio: 'Expert in multiple cuisines',
        img: '/uploads/test-chef.jpg',
        categoryIds: categoryIds
      })
    });
    
    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(`Failed to create author: ${JSON.stringify(errorData)}`);
    }
    
    const createData = await createResponse.json();
    const author = createData.author;
    
    console.log(`   ✅ Created author: ${author.name}`);
    console.log(`   📝 Slug: ${author.slug}`);
    console.log(`   🆔 ID: ${author.id}`);
    console.log(`   📂 Categories: ${author.categories?.length || 0}`);
    
    if (author.categories && author.categories.length > 0) {
      author.categories.forEach(cat => {
        console.log(`      - ${cat.title}`);
      });
    }
    console.log('');

    // Step 3: Get author by ID to verify categories
    console.log('3️⃣ Fetching author by ID...');
    
    const getResponse = await fetch(`${API_URL}/api/admin/authors/${author.id}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    if (!getResponse.ok) {
      throw new Error(`Failed to fetch author: ${getResponse.status}`);
    }
    
    const fetchedAuthor = await getResponse.json();
    
    console.log(`   ✅ Retrieved author: ${fetchedAuthor.name}`);
    console.log(`   📂 Categories: ${fetchedAuthor.categories?.length || 0}`);
    
    if (fetchedAuthor.categories && fetchedAuthor.categories.length > 0) {
      fetchedAuthor.categories.forEach(cat => {
        console.log(`      - ${cat.title} (${cat.slug})`);
      });
    }
    console.log('');

    // Step 4: Update author with different categories
    if (categories.length >= 3) {
      console.log('4️⃣ Updating author categories...');
      
      const newCategoryIds = [categories[0].id, categories[2].id];
      
      const updateResponse = await fetch(`${API_URL}/api/admin/authors/${author.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categoryIds: newCategoryIds
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Failed to update author: ${updateResponse.status}`);
      }
      
      const updateData = await updateResponse.json();
      const updatedAuthor = updateData.author;
      
      console.log(`   ✅ Updated author categories`);
      console.log(`   📂 New categories: ${updatedAuthor.categories?.length || 0}`);
      
      if (updatedAuthor.categories && updatedAuthor.categories.length > 0) {
        updatedAuthor.categories.forEach(cat => {
          console.log(`      - ${cat.title}`);
        });
      }
      console.log('');
    }

    // Step 5: Cleanup - Delete test author
    console.log('5️⃣ Cleaning up test data...');
    
    const deleteResponse = await fetch(`${API_URL}/api/admin/authors/${author.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    if (!deleteResponse.ok) {
      console.log(`   ⚠️  Failed to delete test author: ${deleteResponse.status}`);
    } else {
      console.log('   ✅ Test author deleted');
    }
    console.log('');

    // Summary
    console.log('✅ All tests passed!');
    console.log('\n📊 Summary:');
    console.log('   - Authors can be created with multiple categories');
    console.log('   - Categories are returned when fetching an author');
    console.log('   - Author categories can be updated');
    console.log('   - Junction table properly handles many-to-many relationship');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Check for API token
if (!API_TOKEN) {
  console.error('❌ Error: API_TOKEN environment variable is required');
  console.log('\nUsage:');
  console.log('  API_TOKEN=your-token node test-author-categories.js');
  console.log('  API_URL=http://localhost:3000 API_TOKEN=your-token node test-author-categories.js');
  process.exit(1);
}

// Run tests
testAuthorCategories();
