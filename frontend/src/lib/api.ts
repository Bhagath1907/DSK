const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchServices() {
    console.log("Fetching services from:", `${API_URL}/services/`);
    try {
        const res = await fetch(`${API_URL}/services/`);
        if (!res.ok) {
            const errorBody = await res.text();
            console.error("Fetch failed:", res.status, res.statusText, errorBody);
            throw new Error(`Failed to fetch services: ${res.status} ${res.statusText}`);
        }
        return res.json();
    } catch (error) {
        console.error("Network error in fetchServices:", error);
        throw error;
    }
}

export async function fetchServiceById(id: string) {
    const res = await fetch(`${API_URL}/services/${id}`);
    if (!res.ok) throw new Error('Failed to fetch service');
    return res.json();
}
