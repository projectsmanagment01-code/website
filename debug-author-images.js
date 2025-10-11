// Script to identify and fix author image path duplication issues
// Run this in the browser console on /authors page

async function debugAuthorImagePaths() {
    console.log('🔍 Debugging Author Image Path Issues...\n');
    
    try {
        const response = await fetch('/api/admin/authors?page=1&limit=100');
        const data = await response.json();
        const authors = data.authors || [];
        
        console.log(`Found ${authors.length} authors to check\n`);
        
        let issuesFound = 0;
        
        authors.forEach((author, index) => {
            console.log(`${index + 1}. ${author.name}:`);
            console.log(`   - ID: ${author.id}`);
            console.log(`   - Avatar: ${author.avatar || 'null'}`);
            console.log(`   - IMG: ${author.img || 'null'}`);
            
            // Check for path duplication
            let hasIssue = false;
            
            if (author.img && author.img.includes('/uploads/authors/')) {
                console.log(`   ⚠️  IMG field contains full path: ${author.img}`);
                hasIssue = true;
            }
            
            if (author.avatar && author.avatar.includes('/uploads/authors//uploads/authors/')) {
                console.log(`   ❌ AVATAR has duplicated path: ${author.avatar}`);
                hasIssue = true;
            }
            
            if (author.img && author.img.includes('/uploads/authors//uploads/authors/')) {
                console.log(`   ❌ IMG has duplicated path: ${author.img}`);
                hasIssue = true;
            }
            
            if (hasIssue) {
                issuesFound++;
                console.log(`   🔧 Suggested fix needed for ${author.name}`);
            } else {
                console.log(`   ✅ No issues detected`);
            }
            
            console.log('');
        });
        
        console.log(`\n📊 SUMMARY:`);
        console.log(`Total authors: ${authors.length}`);
        console.log(`Authors with issues: ${issuesFound}`);
        console.log(`Authors without issues: ${authors.length - issuesFound}`);
        
        if (issuesFound > 0) {
            console.log(`\n🔧 RESOLUTION:`);
            console.log(`The fix has been applied to handle these cases automatically.`);
            console.log(`The new utility function will:`);
            console.log(`1. Use avatar if available (as-is)`);
            console.log(`2. If img starts with '/uploads/authors/', use as-is`);
            console.log(`3. If img is just filename, prepend '/uploads/authors/'`);
            console.log(`4. Prevent path duplication`);
        }
        
    } catch (error) {
        console.error('❌ Error debugging author images:', error);
    }
}

// Auto-run the debug
debugAuthorImagePaths();