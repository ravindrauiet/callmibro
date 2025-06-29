import { NextResponse } from 'next/server';

// This route handler is specifically for Firebase Auth callbacks
// It proxies requests to the Firebase Auth emulator or production service
export async function GET(request, { params }) {
  const path = params.path || [];
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  
  // Log the auth callback for debugging
  console.log(`Firebase Auth callback received: /${path.join('/')}?${queryString}`);
  
  // Construct the Firebase Auth URL
  const firebaseAuthUrl = `https://callmibro.firebaseapp.com/__/auth/${path.join('/')}?${queryString}`;
  
  try {
    // Proxy the request to Firebase Auth
    const response = await fetch(firebaseAuthUrl);
    const data = await response.text();
    
    // Return the response with appropriate headers
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'text/html',
      },
    });
  } catch (error) {
    console.error('Error proxying Firebase Auth request:', error);
    return new NextResponse('Authentication Error', { status: 500 });
  }
}

// Also handle POST requests for completeness
export async function POST(request, { params }) {
  const path = params.path || [];
  const body = await request.text();
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  
  // Construct the Firebase Auth URL
  const firebaseAuthUrl = `https://callmibro.firebaseapp.com/__/auth/${path.join('/')}?${queryString}`;
  
  try {
    // Proxy the request to Firebase Auth
    const response = await fetch(firebaseAuthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
      },
      body,
    });
    
    const data = await response.text();
    
    // Return the response with appropriate headers
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'text/html',
      },
    });
  } catch (error) {
    console.error('Error proxying Firebase Auth request:', error);
    return new NextResponse('Authentication Error', { status: 500 });
  }
} 