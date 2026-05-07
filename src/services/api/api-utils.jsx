function getStoredJwt() {
    try {
        const doctorRaw = localStorage.getItem('doctor');
        if (doctorRaw) {
            const doctor = JSON.parse(doctorRaw);
            if (doctor?.jwtToken) return doctor.jwtToken;
        }
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
            const user = JSON.parse(userRaw);
            if (user?.jwtToken) return user.jwtToken;
        }
    } catch {
        // ignore malformed JSON
    }
    return null;
}

export async function api(path = '', method = 'GET', body = null) {
    const base = import.meta.env.VITE_API_URL;
    const url  = `${base}/${path}`;

    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Requested-With': 'XMLHttpRequest',
    };

    // Attach auth here so requests fired before the providers' fetch wrappers
    // install (e.g. on first render after a refresh) still carry the token.
    const token = getStoredJwt();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const options = { method, headers };
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
