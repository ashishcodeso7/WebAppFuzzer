import { NextResponse } from 'next/server';

// Helper function for retrying fetch requests
async function fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 3
): Promise<Response> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            } else {
                const errorBody = await response.text();
                lastError = new Error(
                    `Non-OK response: ${response.statusText}, Body: ${errorBody}`
                );
                console.error(lastError.message);
            }
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error occurred');
            console.error(lastError.message);
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Retry delay
    }
    if (lastError) {
        throw lastError;
    }
    throw new Error('Failed after retries');
}

export async function GET(request: Request, { params }: { params: { scanId: string } }) {
    const { scanId } = params;

    try {
        const statusUrl = `${process.env.ZAP_API_URL}JSON/ascan/view/status/`;
        const queryParams = new URLSearchParams({
            scanId: scanId,
            apikey: process.env.ZAP_API_KEY || "",
        });

        const res = await fetchWithRetry(statusUrl + '?' + queryParams.toString(), { method: 'GET' });

        if (!res.ok) {
            throw new Error('Failed to fetch the scan status');
        }

        const data = await res.json();

        // Return progress percentage
        const progress = parseInt(data.status, 10) || 0; // Default to 0 if no status
        return NextResponse.json({ progress }, { status: 200 });
    } catch (error) {
        console.error('Error fetching scan progress:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
