// Disable this API route when exporting
export const dynamic = "force-static";
export const revalidate = 60; // or any number

import { NextResponse } from "next/server";
import { signToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Function to verify reCAPTCHA token
async function verifyRecaptcha(token: string, secretKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

// Replace with your DB logic
async function authenticateUser(emailOrUsername: string, password: string) {
  // For now using hardcoded admin credentials with password update support
  const adminEmail = "admin@yourrecipesite.com";
  
  // Check if user is trying to login with email
  let isEmailLogin = emailOrUsername === adminEmail;
  
  // If not email login, check if it's a username login
  if (!isEmailLogin) {
    // Get the stored username for this admin
    const usernameData = await prisma.adminSettings.findUnique({
      where: { key: `admin_username_${adminEmail}` }
    });
    
    // Check if the input matches the stored username
    if (usernameData?.value && usernameData.value === emailOrUsername) {
      isEmailLogin = true; // Treat username login same as email login
    }
  }
  
  if (isEmailLogin) {
    // Check if user has a stored hashed password
    const storedPasswordData = await prisma.adminSettings.findUnique({
      where: { key: `admin_password_${adminEmail}` }
    });

    let isPasswordValid = false;

    if (storedPasswordData?.value) {
      // Compare with stored hashed password
      isPasswordValid = await bcrypt.compare(password, storedPasswordData.value);
    } else {
      // Compare with hardcoded password for first-time users
      isPasswordValid = password === "admin123";
    }

    if (isPasswordValid) {
      // Get the current username to return
      const usernameData = await prisma.adminSettings.findUnique({
        where: { key: `admin_username_${adminEmail}` }
      });
      
      return { 
        id: 1, 
        email: adminEmail, 
        username: usernameData?.value || "Administrator",
        role: "admin" 
      };
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { email, password, recaptchaToken } = await request.json();

    // Check if reCAPTCHA is enabled
    const recaptchaEnabledSetting = await prisma.adminSettings.findUnique({
      where: { key: 'recaptcha_enabled' }
    });

    const isRecaptchaEnabled = recaptchaEnabledSetting?.value === 'true';

    // If reCAPTCHA is enabled, verify the token
    if (isRecaptchaEnabled) {
      if (!recaptchaToken) {
        return NextResponse.json(
          { error: "reCAPTCHA verification required" },
          { status: 400 }
        );
      }

      // Get the secret key
      const secretKeySetting = await prisma.adminSettings.findUnique({
        where: { key: 'recaptcha_secret_key' }
      });

      if (!secretKeySetting?.value) {
        return NextResponse.json(
          { error: "reCAPTCHA configuration error" },
          { status: 500 }
        );
      }

      // Verify reCAPTCHA token
      const isRecaptchaValid = await verifyRecaptcha(recaptchaToken, secretKeySetting.value);
      
      if (!isRecaptchaValid) {
        return NextResponse.json(
          { error: "reCAPTCHA verification failed" },
          { status: 400 }
        );
      }
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create JWT
    const token = signToken(user.id, user.email, user.role);

    // Option A: Return token in JSON (good for mobile/web SPA)
    return NextResponse.json({ 
      token,
      user: {
        email: user.email,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
