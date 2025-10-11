/**
 * Backup API Test
 * 
 * Test the backup API endpoints to debug restore issues
 */

async function testBackupAPI() {
  console.log('🧪 Testing Backup API endpoints...\n');
  
  const baseUrl = 'http://localhost:3001'; // Assuming dev server is running
  
  try {
    // Test 1: Get backup stats
    console.log('📊 Test 1: Getting backup stats...');
    const statsResponse = await fetch(`${baseUrl}/api/admin/backup/stats`);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Stats retrieved successfully:', statsData.data);
    } else {
      const error = await statsResponse.json();
      console.log('❌ Stats failed:', error);
    }
    
    // Test 2: List backups
    console.log('\n📋 Test 2: Listing backups...');
    const listResponse = await fetch(`${baseUrl}/api/admin/backup`);
    
    if (listResponse.ok) {
      const listData = await listResponse.json();
      console.log(`✅ Found ${listData.data.length} backups`);
      
      if (listData.data.length > 0) {
        console.log('Latest backup:', {
          id: listData.data[0].id,
          name: listData.data[0].name,
          type: listData.data[0].type,
        });
      }
    } else {
      const error = await listResponse.json();
      console.log('❌ List failed:', error);
    }
    
    // Test 3: Create a test backup
    console.log('\n📦 Test 3: Creating a test backup...');
    const createResponse = await fetch(`${baseUrl}/api/admin/backup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'debug-test-backup',
        description: 'Test backup for debugging restore issues',
        includeDatabase: true,
        includeFiles: true,
        type: 'full'
      }),
    });
    
    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Backup created successfully!');
      console.log('Job status:', createData.data.status);
      
      if (createData.data.metadata) {
        console.log('Backup ID:', createData.data.metadata.id);
      }
    } else {
      const error = await createResponse.json();
      console.log('❌ Backup creation failed:', error);
    }
    
    console.log('\n🎉 API tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testBackupAPI();