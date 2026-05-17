export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Log CSP violations (in production, you might send these to a monitoring service)
    console.warn('CSP Violation Report:', body);
  } catch {
    // Silently ignore malformed reports
  }

  return new Response(null, { status: 204 });
}
