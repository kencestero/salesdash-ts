import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phone, customerName } = await req.json();
    
    console.log(`📞 Initiating call to ${customerName} at ${phone}`);
    
    // For now, just log it - Twilio integration coming later
    // Will need TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER env vars
    
    return NextResponse.json({ 
      success: true, 
      message: `Call initiated to ${customerName}`,
      phone: phone,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Call initiation error:', error);
    return NextResponse.json({ 
      error: 'Failed to initiate call',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
