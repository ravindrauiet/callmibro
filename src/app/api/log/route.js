export async function POST(request) {
  try {
    const body = await request.json();
    
    // Log to server console
    console.log('=== AUTH LOG ===');
    console.log('Timestamp:', body.timestamp);
    console.log('Message:', body.message);
    console.log('User Agent:', body.userAgent);
    console.log('URL:', body.url);
    
    if (body.data) {
      console.log('Data:', JSON.stringify(body.data, null, 2));
    }
    
    console.log('================');
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error logging to server:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
} 