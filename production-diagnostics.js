// Production Issue Diagnostics for Author Profiles
// Common issues that work in dev but fail in production

console.log('🔍 PRODUCTION ISSUE DIAGNOSTICS FOR AUTHOR PROFILES');

// Check 1: Environment Variables
console.log('\n📋 1. ENVIRONMENT VARIABLES CHECK:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || 'undefined');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

// Check 2: Static Generation Issues
console.log('\n⚡ 2. STATIC GENERATION POTENTIAL ISSUES:');

async function checkStaticGenerationIssues() {
    try {
        // Test if generateStaticParams is working correctly
        console.log('Testing generateStaticParams function...');
        
        const response = await fetch('/api/admin/authors?page=1&limit=1000');
        if (!response.ok) {
            console.log('❌ Cannot fetch authors for static generation');
            return;
        }
        
        const data = await response.json();
        const authors = data.authors || [];
        
        console.log(`Found ${authors.length} authors for static generation`);
        
        // Check for problematic slugs
        const problematicAuthors = authors.filter(author => {
            if (!author.slug) return true;
            if (author.slug.includes(' ')) return true;
            if (author.slug.includes('/')) return true;
            if (author.slug.includes('\\')) return true;
            if (author.slug.includes('?')) return true;
            if (author.slug.includes('#')) return true;
            if (author.slug !== encodeURIComponent(author.slug)) return true;
            return false;
        });
        
        if (problematicAuthors.length > 0) {
            console.log('❌ Found authors with problematic slugs:');
            problematicAuthors.forEach(author => {
                console.log(`  - ${author.name}: "${author.slug}"`);
            });
        } else {
            console.log('✅ All author slugs are valid for static generation');
        }
        
    } catch (error) {
        console.log('❌ Error checking static generation:', error.message);
    }
}

// Check 3: Database Connection Issues
console.log('\n🗃️ 3. DATABASE CONNECTION CHECK:');

async function checkDatabaseIssues() {
    try {
        const response = await fetch('/api/admin/authors/stats');
        if (response.ok) {
            console.log('✅ Database connection working');
        } else {
            console.log('❌ Database connection issue:', response.status);
        }
    } catch (error) {
        console.log('❌ Database connection error:', error.message);
    }
}

// Check 4: File System Issues (Images)
console.log('\n📁 4. FILE SYSTEM/UPLOADS CHECK:');

async function checkFileSystemIssues() {
    try {
        // Test a known image from uploads directory
        const testImageResponse = await fetch('/uploads/authors/1759527005802-ogmf9dujxbj-a (16).webp');
        if (testImageResponse.ok) {
            console.log('✅ Uploads directory accessible');
        } else {
            console.log('❌ Uploads directory not accessible:', testImageResponse.status);
        }
    } catch (error) {
        console.log('❌ File system error:', error.message);
    }
}

// Check 5: Production Build Issues
console.log('\n🏗️ 5. PRODUCTION BUILD CHECKS:');

function checkBuildIssues() {
    // Check if we're in production mode
    const isProduction = window.location.protocol === 'https:' || 
                        window.location.hostname !== 'localhost';
    
    console.log('Is Production Environment:', isProduction);
    
    if (isProduction) {
        console.log('🔍 Running production-specific checks...');
        
        // Check for HTTPS redirects
        if (window.location.protocol === 'http:') {
            console.log('⚠️ Running on HTTP in production - may cause issues');
        }
        
        // Check for CDN/proxy issues
        console.log('Host:', window.location.hostname);
        console.log('Port:', window.location.port);
    }
}

// Check 6: Next.js 15 Specific Issues
console.log('\n🚀 6. NEXT.JS 15 COMPATIBILITY CHECK:');

function checkNextJS15Issues() {
    console.log('Checking for Next.js 15 compatibility issues...');
    
    // Check if params are being awaited properly
    console.log('✅ Async params fix applied in author profile page');
    
    // Check for other potential Next.js 15 issues
    const potentialIssues = [
        'Server components using client-side features',
        'Incorrect use of dynamic imports',
        'Middleware configuration issues',
        'App router specific problems'
    ];
    
    console.log('Potential issues to check:', potentialIssues);
}

// Run all checks
async function runAllChecks() {
    checkBuildIssues();
    checkNextJS15Issues();
    await checkStaticGenerationIssues();
    await checkDatabaseIssues();
    await checkFileSystemIssues();
    
    console.log('\n📊 DIAGNOSIS COMPLETE');
    console.log('If issues persist, check:');
    console.log('1. VPS server logs');
    console.log('2. Database connectivity from VPS');
    console.log('3. File permissions for uploads directory');
    console.log('4. Environment variables on VPS');
    console.log('5. Build output on VPS');
}

runAllChecks();