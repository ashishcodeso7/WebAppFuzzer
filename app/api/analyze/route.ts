import { NextRequest, NextResponse } from 'next/server';

const ZAP_API_URL = process.env.ZAP_API_URL;
const ZAP_API_KEY = process.env.ZAP_API_KEY; // Set this in your .env.local

// Helper function to retry fetch requests
async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            } else {
                const errorBody = await response.text();
                lastError = new Error(`Non-OK response: ${response.statusText}, Body: ${errorBody}`);
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

// Start a spider (crawl) for the URL
async function startSpider(url: string) {
    const spiderUrl = `${ZAP_API_URL}JSON/spider/action/scan/?url=${encodeURIComponent(url)}&apikey=${ZAP_API_KEY}`;
    const res = await fetchWithRetry(spiderUrl, { method: 'GET' });
    const data = await res.json();
    return data.scan;
}

// Check the spider's status
async function checkSpiderStatus(scanId: string) {
    const statusUrl = `${ZAP_API_URL}JSON/spider/view/status/?scanId=${scanId}&apikey=${ZAP_API_KEY}`;
    const res = await fetchWithRetry(statusUrl, { method: 'GET' });
    const data = await res.json();
    return data.status;
}

// Start an active scan
async function startActiveScan(url: string) {
    const scanUrl = `${ZAP_API_URL}JSON/ascan/action/scan/?url=${encodeURIComponent(url)}&apikey=${ZAP_API_KEY}`;
    const res = await fetchWithRetry(scanUrl, { method: 'GET' });
    const data = await res.json();
    return data.scan;
}

async function checkScanStatus(scanId: string) {
    const statusUrl = `${ZAP_API_URL}JSON/ascan/view/status/`;
    const params = new URLSearchParams({
        scanId: scanId,
        apikey: ZAP_API_KEY || "",
    });

    const res = await fetchWithRetry(statusUrl + '?' + params.toString(), { method: 'GET' });

    if (!res.ok) {
        throw new Error('Failed to fetch the scan status');
    }

    const data = await res.json();
    return data.status; // This is the percentage progress (0–100)
}


// Get filtered alerts
async function getFilteredAlerts(baseUrl: string) {
    const alertsUrl = `${ZAP_API_URL}JSON/core/view/alerts/?baseurl=${encodeURIComponent(baseUrl)}&apikey=${ZAP_API_KEY}`;
    const res = await fetchWithRetry(alertsUrl, { method: 'GET' });
    const data = await res.json();
    // Filter out "Informational" risk alerts
    return data.alerts.filter((alert: any) => alert.risk !== 'Informational');
}

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Start the spider
        const spiderScanId = await startSpider(url);

        // Wait for the spider to complete
        let spiderStatus = await checkSpiderStatus(spiderScanId);
        while (spiderStatus !== '100') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            spiderStatus = await checkSpiderStatus(spiderScanId);
        }

        // Start the active scan
        const scanId = await startActiveScan(url);

        // Wait for the active scan to complete
        let scanStatus = await checkScanStatus(scanId);
        while (scanStatus !== '100') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            scanStatus = await checkScanStatus(scanId);
        }

        // Get filtered alerts
        const alerts = await getFilteredAlerts(url);

        // Return the analysis results
        return NextResponse.json({ scanId, alerts }, { status: 200 });
    } catch (error: any) {
        console.error('Error in /api/analyze:', error.message);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
