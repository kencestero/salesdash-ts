import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { customerId, trailerType, price, notes, trailerSize, options } = await req.json();
    
    // Generate quote number
    const quoteNumber = `QT-${Date.now().toString().slice(-6)}`;
    
    // For now, we'll save to localStorage or return mock data
    // TODO: Integrate with Prisma once Quote model is ready
    
    const quote = {
      id: `quote_${Date.now()}`,
      customerId,
      quoteNumber,
      trailerType: trailerType || 'Standard Enclosed',
      trailerSize: trailerSize || '6x12',
      price: parseFloat(price || '5000'),
      status: 'draft',
      notes: notes || 'Initial quote',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
      options: options || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log(`📋 Quote created:`, quote);
    
    // TODO: Update customer status and create activity log once models are ready
    
    return NextResponse.json({ 
      success: true, 
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      message: `Quote #${quoteNumber} created successfully`
    });
  } catch (error) {
    console.error('Quote creation error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to create quote',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
