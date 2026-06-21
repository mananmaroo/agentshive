import { NextRequest, NextResponse } from 'next/server';
import { AgentRequestService } from '@/app/lib/services/agent-request-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { requester_name, requester_email, agent_description, use_case, budget } = body;

    if (!requester_name || !requester_email || !agent_description || !use_case) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const agentRequest = await AgentRequestService.submitRequest({
      requester_email,
      requester_name,
      agent_description,
      use_case,
      budget: budget || undefined,
    });

    return NextResponse.json(agentRequest, { status: 201 });
  } catch (error) {
    console.error('Error submitting agent request:', error);
    return NextResponse.json(
      { error: 'Failed to submit request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Admin-only: this returns customer PII (emails, budgets). Require a secret token.
  // Set ADMIN_API_TOKEN in the server env; without it the endpoint stays locked.
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (!adminToken || request.headers.get('x-admin-token') !== adminToken) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, count } = await AgentRequestService.getRequests(limit, offset);

    return NextResponse.json({
      requests: data,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching agent requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
