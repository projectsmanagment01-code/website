// Test script to debug authors page issues
// Run this in the browser console

async function debugAuthorsPage() {
    console.log('🔍 Debugging Authors Page Issues...\n');
    
    try {
        // Step 1: Get all authors from API
        console.log('📋 Step 1: Fetching authors from API...');
        const response = await fetch('/api/admin/authors?page=1&limit=50');
        const authorsData = await response.json();
        
        console.log('Authors API Response:', authorsData);
        
        // Step 2: Analyze image issues
        console.log('\n🖼️ Step 2: Analyzing image issues...');
        authorsData.authors?.forEach((author, index) => {
            console.log(`\nAuthor ${index + 1}: ${author.name}`);
            console.log(`  - ID: ${author.id}`);
            console.log(`  - Slug: ${author.slug}`);
            console.log(`  - Avatar: ${author.avatar || 'NOT SET'}`);
            console.log(`  - IMG: ${author.img || 'NOT SET'}`);
            console.log(`  - Link: ${author.link || 'NOT SET'}`);
            console.log(`  - Recipe Count: ${author.recipeCount || 0}`);
            
            // Check if image exists
            if (author.img) {
                const imgUrl = `/uploads/authors/${author.img}`;
                console.log(`  - Image URL: ${imgUrl}`);
                // Test image accessibility
                fetch(imgUrl).then(imgResponse => {
                    if (imgResponse.ok) {
                        console.log(`  ✅ Image accessible: ${imgUrl}`);
                    } else {
                        console.log(`  ❌ Image not accessible: ${imgUrl} (Status: ${imgResponse.status})`);
                    }
                }).catch(err => {
                    console.log(`  ❌ Image error: ${imgUrl} - ${err.message}`);
                });
            }
            
            // Check profile link
            if (author.slug) {
                const profileUrl = `/authors/${author.slug}`;
                console.log(`  - Profile URL: ${profileUrl}`);
                fetch(profileUrl).then(profileResponse => {
                    if (profileResponse.ok) {
                        console.log(`  ✅ Profile accessible: ${profileUrl}`);
                    } else {
                        console.log(`  ❌ Profile not accessible: ${profileUrl} (Status: ${profileResponse.status})`);
                    }
                }).catch(err => {
                    console.log(`  ❌ Profile error: ${profileUrl} - ${err.message}`);
                });
            }
        });
        
        // Step 3: Check uploads directory structure
        console.log('\n📁 Step 3: Testing uploads directory access...');
        fetch('/uploads/authors/').then(uploadsResponse => {
            console.log(`Uploads directory status: ${uploadsResponse.status}`);
        }).catch(err => {
            console.log(`Uploads directory error: ${err.message}`);
        });
        
        // Step 4: Summary of issues
        console.log('\n📊 Step 4: Summary...');
        const authorsWithoutImages = authorsData.authors?.filter(a => !a.avatar && !a.img) || [];
        const authorsWithoutSlugs = authorsData.authors?.filter(a => !a.slug) || [];
        
        console.log(`Total authors: ${authorsData.authors?.length || 0}`);
        console.log(`Authors without images: ${authorsWithoutImages.length}`);
        console.log(`Authors without slugs: ${authorsWithoutSlugs.length}`);
        
        if (authorsWithoutImages.length > 0) {
            console.log('Authors missing images:', authorsWithoutImages.map(a => a.name));
        }
        
        if (authorsWithoutSlugs.length > 0) {
            console.log('Authors missing slugs:', authorsWithoutSlugs.map(a => a.name));
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

// Run the debug
debugAuthorsPage();