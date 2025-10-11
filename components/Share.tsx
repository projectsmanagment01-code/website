import { Pin, Share2, Mail, Printer, ArrowDown } from "lucide-react";

export default function SocialShareButtons() {
  const handlePinIt = () => {
    const url = window.location.href;
    const media = "https://ext.same-assets.com/3912301781/917733602.jpeg";
    const description =
      "Crispy chicken and tender broccoli coated in a sweet and savory honey sesame sauce, ready in 30 minutes.";
    window.open(
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
        url
      )}&media=${encodeURIComponent(media)}&description=${encodeURIComponent(
        description
      )}`,
      "_blank"
    );
  };

  const handleShareIt = () => {
    const url = window.location.href;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const handleSendIt = () => {
    const subject = "Honey Sesame Chicken and Broccoli";
    const body = window.location.href;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`
    );
  };

  const handlePrintIt = () => {
    const recipeCard = document.getElementById("recipe");
    if (recipeCard) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        // Extract recipe data from the DOM
        const recipeTitle = recipeCard.querySelector('h2')?.textContent || 'Recipe';
        const recipeDescription = recipeCard.querySelector('p')?.textContent || '';
        const recipeImage = recipeCard.querySelector('img')?.src || '';
        
        // Get the current website domain
        const websiteDomain = window.location.hostname || window.location.origin;
        const websiteName = websiteDomain.replace('www.', '').split('.')[0].charAt(0).toUpperCase() + websiteDomain.replace('www.', '').split('.')[0].slice(1);
        
        // Create a beautifully formatted print document
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${recipeTitle} - Recipe Card</title>
              <style>
                @page {
                  margin: 0.75in;
                  size: A4 portrait;
                }
                
                * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
                }
                
                body {
                  font-family: 'Georgia', 'Times New Roman', serif;
                  line-height: 1.6;
                  color: #2d3748;
                  background: white;
                }
                
                .website-header {
                  text-align: center;
                  padding: 15px 0;
                  margin-bottom: 20px;
                  border-bottom: 2px solid #B45253;
                }
                
                .website-name {
                  font-size: 24px;
                  font-weight: bold;
                  color: #B45253;
                  text-transform: uppercase;
                  letter-spacing: 2px;
                  margin-bottom: 5px;
                }
                
                .website-url {
                  font-size: 14px;
                  color: #666;
                  font-style: italic;
                }
                
                .recipe-card {
                  max-width: 100%;
                  background: #FFECC0;
                  border: 3px solid #B45253;
                  border-radius: 15px;
                  overflow: hidden;
                  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                
                .recipe-header {
                  background: linear-gradient(135deg, #D97D55 0%, #B45253 100%);
                  color: white;
                  padding: 25px;
                  text-align: center;
                  position: relative;
                }
                
                .recipe-header::after {
                  content: '';
                  position: absolute;
                  bottom: -10px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 0;
                  height: 0;
                  border-left: 15px solid transparent;
                  border-right: 15px solid transparent;
                  border-top: 15px solid #B45253;
                }
                
                .recipe-title {
                  font-size: 28px;
                  font-weight: bold;
                  margin-bottom: 10px;
                  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                }
                
                .recipe-subtitle {
                  font-size: 14px;
                  opacity: 0.9;
                  font-style: italic;
                }
                
                .recipe-body {
                  padding: 30px;
                }
                
                .recipe-image {
                  width: 100%;
                  max-width: 300px;
                  height: 200px;
                  object-fit: cover;
                  border-radius: 10px;
                  margin: 0 auto 25px;
                  display: block;
                  border: 3px solid #B45253;
                }
                
                .recipe-description {
                  text-align: center;
                  font-size: 16px;
                  color: #4a5568;
                  margin-bottom: 25px;
                  padding: 15px;
                  background: white;
                  border-radius: 8px;
                  border-left: 4px solid #B45253;
                }
                
                .recipe-meta {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 15px;
                  margin-bottom: 30px;
                }
                
                .meta-item {
                  background: white;
                  padding: 15px;
                  border-radius: 8px;
                  text-align: center;
                  border: 2px solid #B45253;
                }
                
                .meta-label {
                  font-size: 12px;
                  color: #B45253;
                  font-weight: bold;
                  text-transform: uppercase;
                  margin-bottom: 5px;
                }
                
                .meta-value {
                  font-size: 16px;
                  font-weight: bold;
                  color: #2d3748;
                }
                
                .section {
                  margin-bottom: 30px;
                }
                
                .section-title {
                  font-size: 20px;
                  font-weight: bold;
                  color: #B45253;
                  margin-bottom: 15px;
                  padding-bottom: 5px;
                  border-bottom: 2px solid #B45253;
                  display: flex;
                  align-items: center;
                }
                
                .section-icon {
                  width: 24px;
                  height: 24px;
                  margin-right: 10px;
                  fill: #B45253;
                }
                
                .ingredients-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 15px;
                }
                
                .ingredient-group {
                  background: white;
                  padding: 15px;
                  border-radius: 8px;
                  border: 1px solid #e2e8f0;
                }
                
                .ingredient-group-title {
                  font-size: 14px;
                  font-weight: bold;
                  color: #B45253;
                  margin-bottom: 10px;
                  border-bottom: 1px solid #e2e8f0;
                  padding-bottom: 5px;
                }
                
                .ingredient-item {
                  display: flex;
                  align-items: flex-start;
                  margin-bottom: 8px;
                  font-size: 14px;
                }
                
                .ingredient-number {
                  background: #B45253;
                  color: white;
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 12px;
                  font-weight: bold;
                  margin-right: 10px;
                  flex-shrink: 0;
                }
                
                .instruction-item {
                  display: flex;
                  align-items: flex-start;
                  margin-bottom: 15px;
                  background: white;
                  padding: 15px;
                  border-radius: 8px;
                  border-left: 4px solid #B45253;
                }
                
                .instruction-number {
                  background: #B45253;
                  color: white;
                  min-width: 32px;
                  height: 32px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 14px;
                  font-weight: bold;
                  margin-right: 15px;
                  flex-shrink: 0;
                }
                
                .instruction-text {
                  font-size: 14px;
                  line-height: 1.6;
                }
                
                .notes-tips {
                  background: #fff7ed;
                  border: 2px solid #B45253;
                  border-radius: 10px;
                  padding: 20px;
                }
                
                .note-item {
                  display: flex;
                  align-items: flex-start;
                  margin-bottom: 12px;
                  font-size: 14px;
                }
                
                .note-number {
                  background: #B45253;
                  color: white;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 11px;
                  font-weight: bold;
                  margin-right: 10px;
                  flex-shrink: 0;
                }
                
                .tools-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 10px;
                }
                
                .tool-item {
                  background: white;
                  padding: 10px;
                  border-radius: 6px;
                  border: 1px solid #e2e8f0;
                  font-size: 13px;
                  display: flex;
                  align-items: center;
                }
                
                .tool-bullet {
                  color: #B45253;
                  font-weight: bold;
                  margin-right: 8px;
                }
                
                .recipe-footer {
                  background: #f7fafc;
                  padding: 20px;
                  text-align: center;
                  border-top: 2px solid #B45253;
                  font-size: 12px;
                  color: #718096;
                }
                
                .decorative-border {
                  background: repeating-linear-gradient(
                    45deg,
                    #B45253,
                    #B45253 10px,
                    transparent 10px,
                    transparent 20px
                  );
                  height: 4px;
                  margin: 20px 0;
                }
                
                @media print {
                  .recipe-card {
                    box-shadow: none;
                  }
                }
              </style>
            </head>
            <body>
              <!-- Website Header -->
              <div class="website-header">
                <div class="website-name">${websiteName}</div>
                <div class="website-url">${websiteDomain}</div>
              </div>
              
              <div class="recipe-card">
                <!-- Header -->
                <div class="recipe-header">
                  <div class="recipe-title">${recipeTitle}</div>
                  <div class="recipe-subtitle">Delicious Recipe to Print & Keep</div>
                </div>
                
                <!-- Body -->
                <div class="recipe-body">
                  ${recipeImage ? `<img src="${recipeImage}" alt="${recipeTitle}" class="recipe-image">` : ''}
                  
                  ${recipeDescription ? `<div class="recipe-description">${recipeDescription}</div>` : ''}
                  
                  <!-- Recipe Meta Info -->
                  <div class="recipe-meta">
                    <div class="meta-item">
                      <div class="meta-label">Prep Time</div>
                      <div class="meta-value" id="prep-time">-</div>
                    </div>
                    <div class="meta-item">
                      <div class="meta-label">Cook Time</div>
                      <div class="meta-value" id="cook-time">-</div>
                    </div>
                    <div class="meta-item">
                      <div class="meta-label">Total Time</div>
                      <div class="meta-value" id="total-time">-</div>
                    </div>
                  </div>
                  
                  <div class="decorative-border"></div>
                  
                  <!-- Ingredients Section -->
                  <div class="section">
                    <h3 class="section-title">
                      <svg class="section-icon" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      Ingredients
                    </h3>
                    <div class="ingredients-grid" id="ingredients-container">
                      <!-- Ingredients will be populated here -->
                    </div>
                  </div>
                  
                  <!-- Instructions Section -->
                  <div class="section">
                    <h3 class="section-title">
                      <svg class="section-icon" viewBox="0 0 24 24"><path d="M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5H9z"/></svg>
                      Instructions
                    </h3>
                    <div id="instructions-container">
                      <!-- Instructions will be populated here -->
                    </div>
                  </div>
                  
                  <!-- Notes Section -->
                  <div class="section">
                    <h3 class="section-title">
                      <svg class="section-icon" viewBox="0 0 24 24"><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-2h-2v2z"/></svg>
                      Notes & Tips
                    </h3>
                    <div class="notes-tips" id="notes-container">
                      <!-- Notes will be populated here -->
                    </div>
                  </div>
                  
                  <!-- Tools Section -->
                  <div class="section">
                    <h3 class="section-title">
                      <svg class="section-icon" viewBox="0 0 24 24"><path d="M9 3H15V1H9V3ZM11 14.17L16.71 8.46L18.12 9.88L11 17L5.88 11.88L7.29 10.46L11 14.17Z"/></svg>
                      Tools You'll Need
                    </h3>
                    <div class="tools-grid" id="tools-container">
                      <!-- Tools will be populated here -->
                    </div>
                  </div>
                </div>
                
                <!-- Footer -->
                <div class="recipe-footer">
                  <div>🍽️ Enjoy your cooking! Print date: ${new Date().toLocaleDateString()} 🍽️</div>
                </div>
              </div>
              
              <script>
                // Extract and populate recipe data
                const originalCard = window.opener.document.getElementById("recipe");
                if (originalCard) {
                  // Extract timing info
                  const timingElements = originalCard.querySelectorAll('[class*="grid-cols-3"] > div');
                  if (timingElements.length >= 3) {
                    document.getElementById('prep-time').textContent = timingElements[0].querySelector('p:last-child')?.textContent || '-';
                    document.getElementById('cook-time').textContent = timingElements[1].querySelector('p:last-child')?.textContent || '-';
                    document.getElementById('total-time').textContent = timingElements[2].querySelector('p:last-child')?.textContent || '-';
                  }
                  
                  // Extract ingredients
                  const ingredientsContainer = document.getElementById('ingredients-container');
                  const ingredientSections = originalCard.querySelectorAll('#recipe-ingredients h4');
                  ingredientSections.forEach((section, index) => {
                    const groupDiv = document.createElement('div');
                    groupDiv.className = 'ingredient-group';
                    
                    const titleDiv = document.createElement('div');
                    titleDiv.className = 'ingredient-group-title';
                    titleDiv.textContent = section.textContent;
                    groupDiv.appendChild(titleDiv);
                    
                    const nextUl = section.nextElementSibling;
                    if (nextUl && nextUl.tagName === 'UL') {
                      const items = nextUl.querySelectorAll('li');
                      items.forEach((item, itemIndex) => {
                        const ingredientDiv = document.createElement('div');
                        ingredientDiv.className = 'ingredient-item';
                        
                        const numberSpan = document.createElement('span');
                        numberSpan.className = 'ingredient-number';
                        numberSpan.textContent = (itemIndex + 1).toString().padStart(2, '0');
                        
                        const textSpan = document.createElement('span');
                        textSpan.textContent = item.textContent.replace(/^\\d+\\s*/, '');
                        
                        ingredientDiv.appendChild(numberSpan);
                        ingredientDiv.appendChild(textSpan);
                        groupDiv.appendChild(ingredientDiv);
                      });
                    }
                    
                    ingredientsContainer.appendChild(groupDiv);
                  });
                  
                  // Extract instructions
                  const instructionsContainer = document.getElementById('instructions-container');
                  const instructionItems = originalCard.querySelectorAll('#recipe-instructions > div');
                  instructionItems.forEach((item, index) => {
                    const instructionDiv = document.createElement('div');
                    instructionDiv.className = 'instruction-item';
                    
                    const numberSpan = document.createElement('span');
                    numberSpan.className = 'instruction-number';
                    numberSpan.textContent = (index + 1).toString();
                    
                    const textDiv = document.createElement('div');
                    textDiv.className = 'instruction-text';
                    const textContent = item.querySelector('p')?.textContent || item.textContent.replace(/^Step \\d+\\s*/, '');
                    textDiv.textContent = textContent;
                    
                    instructionDiv.appendChild(numberSpan);
                    instructionDiv.appendChild(textDiv);
                    instructionsContainer.appendChild(instructionDiv);
                  });
                  
                  // Extract notes
                  const notesContainer = document.getElementById('notes-container');
                  const noteItems = originalCard.querySelectorAll('[class*="Notes"] ul li');
                  noteItems.forEach((item, index) => {
                    const noteDiv = document.createElement('div');
                    noteDiv.className = 'note-item';
                    
                    const numberSpan = document.createElement('span');
                    numberSpan.className = 'note-number';
                    numberSpan.textContent = (index + 1).toString();
                    
                    const textSpan = document.createElement('span');
                    textSpan.textContent = item.textContent;
                    
                    noteDiv.appendChild(numberSpan);
                    noteDiv.appendChild(textSpan);
                    notesContainer.appendChild(noteDiv);
                  });
                  
                  // Extract tools
                  const toolsContainer = document.getElementById('tools-container');
                  const toolItems = originalCard.querySelectorAll('[class*="Tools"] ul li');
                  toolItems.forEach((item) => {
                    const toolDiv = document.createElement('div');
                    toolDiv.className = 'tool-item';
                    
                    const bulletSpan = document.createElement('span');
                    bulletSpan.className = 'tool-bullet';
                    bulletSpan.textContent = '•';
                    
                    const textSpan = document.createElement('span');
                    textSpan.textContent = item.textContent;
                    
                    toolDiv.appendChild(bulletSpan);
                    toolDiv.appendChild(textSpan);
                    toolsContainer.appendChild(toolDiv);
                  });
                }
              </script>
            </body>
          </html>
        `);
        
        printWindow.document.close();
        
        // Wait for content to load, then print
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  const handleJumpToRecipe = () => {
    const recipeCard = document.getElementById("recipe");
    if (recipeCard) {
      recipeCard.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-wrap gap-4 items-center text-sm">
      <button
        onClick={handlePinIt}
        className="inline-flex items-center gap-1.5 px-2 py-2 border-2 border-black bg-transparent rounded text-black font-bold transition-all duration-300 hover:bg-black hover:text-white cursor-pointer"
      >
        <Pin className="w-5 h-5 flex-shrink-0" />
        <span>Pin it</span>
      </button>

      <button
        onClick={handleShareIt}
        className="inline-flex items-center gap-1.5 px-2 py-2 border-2 border-black bg-transparent rounded text-black font-bold transition-all duration-300 hover:bg-black hover:text-white cursor-pointer"
      >
        <Share2 className="w-5 h-5 flex-shrink-0" />
        <span>Share it</span>
      </button>

      <button
        onClick={handleSendIt}
        className="inline-flex items-center gap-1.5 px-2 py-2 border-2 border-black bg-transparent rounded text-black font-bold transition-all duration-300 hover:bg-black hover:text-white cursor-pointer"
      >
        <Mail className="w-5 h-5 flex-shrink-0" />
        <span>Send it</span>
      </button>

      <button
        onClick={handlePrintIt}
        className="inline-flex items-center gap-1.5 px-2 py-2 border-2 border-black bg-transparent rounded text-black font-bold transition-all duration-300 hover:bg-black hover:text-white cursor-pointer"
      >
        <Printer className="w-5 h-5 flex-shrink-0" />
        <span>Print it</span>
      </button>

      <button
        onClick={handleJumpToRecipe}
        className="inline-flex items-center gap-1.5 px-2 py-2 border-2 border-black bg-transparent rounded text-black font-bold transition-all duration-300 hover:bg-black hover:text-white cursor-pointer"
        aria-label="Jump To Recipe"
      >
        <ArrowDown className="w-5 h-5 flex-shrink-0" />
        <span>Jump To Recipe</span>
      </button>
    </div>
  );
}
