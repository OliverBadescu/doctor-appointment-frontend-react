export async function api(path = '', method = 'GET', body = null) {
    const base = import.meta.env.VITE_API_URL;
    const url  = `${base}/${path}`;

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Requested-With': 'XMLHttpRequest',
        },
    };

    if (body !== null) options.body = JSON.stringify(body);

    return fetch(url, options);
}


export async function request(path = '', method = 'GET', body = null) {
    try {
        const res  = await api(path, method, body);
        const data = await res.json().catch(() => null);

        if (res.ok) return { success: true, status: res.status, body: data };

        const msg =
            (data && data.message) || res.statusText || 'Request failed';
        const err = new Error(msg);
        err.status = res.status;
        throw err;
    } catch (err) {
        return {
            success : false,
            status  : err.status ?? 500,
            message : err.message || 'Something went wrong',
        };
    }
}