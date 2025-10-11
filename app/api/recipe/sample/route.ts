import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * GET /api/recipe/sample
 * Returns the sample recipe.json file for importing in the admin
 */
export async function GET() {
  try {
    // Read the recipe.json file from the data directory
    const filePath = join(process.cwd(), 'data', 'recipe.json');
    const fileContent = readFileSync(filePath, 'utf8');
    const recipe = JSON.parse(fileContent);
    
    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error reading sample recipe:', error);
    return NextResponse.json(
      { error: 'Failed to load sample recipe' },
      { status: 500 }
    );
  }
}