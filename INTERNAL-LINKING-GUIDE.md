/**
 * INTERNAL LINKING SYSTEM - QUICK FIX GUIDE
 * ==========================================
 * 
 * ✅ FIXED ISSUES:
 * 1. Field name mismatch: incomingLinksCount → incomingLinks ✓
 * 2. Field name mismatch: outgoingLinksCount → outgoingLinks ✓
 * 3. Field name mismatch: lastScannedAt → lastChecked ✓
 * 4. Link insertion: Now searches entire content instead of using positions ✓
 * 5. Nested links prevention: Recalculates existing links on each iteration ✓
 * 
 * 🎯 HOW TO USE THE SYSTEM:
 * 
 * Step 1: SCAN FOR LINKS
 *   - Go to: http://localhost:3000/admin/internal-links
 *   - Click "Quick Scan" button
 *   - Wait for scan to complete
 *   - You should see suggestions appear in the table
 * 
 * Step 2: REVIEW SUGGESTIONS
 *   - Look at the "Suggestions" tab
 *   - Filter by: All | Pending | Applied
 *   - Each suggestion shows:
 *     • Source Recipe (where link will be added)
 *     • Target Recipe (what it links to)
 *     • Anchor Text (the linked words)
 *     • Field (intro, story, description, instructions)
 *     • Relevance Score (higher = better match)
 * 
 * Step 3: SELECT & APPLY LINKS
 *   - Check the boxes next to suggestions you want to apply
 *   - OR click "Select All" to apply all pending suggestions
 *   - Click "Apply Selected" button
 *   - System will insert links into your recipe content
 * 
 * Step 4: CHECK ORPHAN PAGES
 *   - Go to "Orphans" tab
 *   - Click "Scan Orphan Pages"
 *   - See which recipes have too few incoming links
 *   - High priority orphans need more links pointing to them
 * 
 * 🔍 WHAT WAS FIXED:
 * 
 * Problem: "Validation failed: Nested <a> tags detected"
 * Solution: Link inserter now recalculates existing links before each insertion
 *           This prevents creating links inside other links
 * 
 * Problem: Only 1 of 47 suggestions applied
 * Solution: Changed from position-based to content-search matching
 *           Now searches for anchor text anywhere in content
 *           Tracks used anchors to prevent duplicates
 * 
 * Problem: Stats API failing with "Unknown field incomingLinksCount"
 * Solution: Fixed all field names to match schema:
 *           - incomingLinks (not incomingLinksCount)
 *           - outgoingLinks (not outgoingLinksCount)
 *           - lastChecked (not lastScannedAt)
 * 
 * 🎨 LINK FORMAT:
 * Generated links look like this:
 * <a href="/recipes/target-slug" class="text-orange-600 hover:text-orange-700 underline transition-colors">anchor text</a>
 * 
 * 📊 FEATURES:
 * ✓ Content-based keyword extraction (analyzes intro, story, description, instructions)
 * ✓ Extracts 2-3 word phrases with priority scoring
 * ✓ Prevents self-links (recipe won't link to itself)
 * ✓ Prevents duplicate links (same anchor text only linked once per field)
 * ✓ Prevents nested links (won't create links inside existing links)
 * ✓ Relevance scoring (higher scores = better keyword matches)
 * ✓ Orphan page detection (finds recipes with insufficient links)
 * ✓ Optional AI enhancement (requires GITHUB_TOKEN)
 * 
 * ⚠️ CURRENT LIMITATIONS:
 * - Instructions field: Currently skipped (needs JSON handling)
 * - Same anchor text: Can only be linked once per field
 * - Case sensitivity: Uses case-insensitive matching
 * 
 * 💡 TIPS FOR BEST RESULTS:
 * 1. Create recipes with unique titles and content
 * 2. Use descriptive phrases in your intro/story text
 * 3. Apply high relevance score suggestions first
 * 4. Check orphan pages regularly and add links to them
 * 5. Review links in the actual recipe page after applying
 * 
 * 🐛 IF YOU STILL HAVE ISSUES:
 * 1. Check browser console for errors (F12)
 * 2. Check server terminal for errors
 * 3. Make sure dev server is running (yarn dev)
 * 4. Try scanning again (clears old suggestions first)
 * 5. Check that recipes have different content
 * 
 * 📝 FILES MODIFIED (for reference):
 * - lib/internal-linking/link-inserter.ts (main fix)
 * - lib/internal-linking/keyword-extractor.ts (content analysis)
 * - lib/internal-linking/orphan-detector.ts (field names)
 * - app/api/admin/internal-links/stats/route.ts (field names)
 * - app/api/admin/internal-links/apply/route.ts (status filter)
 * - components/admin/internal-links/SuggestionsTable.tsx (UI simplification)
 * 
 * ✨ THE SYSTEM IS NOW READY TO USE! ✨
 * 
 * Navigate to: http://localhost:3000/admin/internal-links
 * And start by clicking "Quick Scan"
 */

console.log('📖 Read the FIX-GUIDE.md file for complete instructions!');
