const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/auth";

async function handle(res: Response) {
  if (!res.ok) {
    let msg = "Request failed";
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function signin(body: { email: string; password: string }): Promise<string> {

    console.log("hello")
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  console.log("hello2")

  const j = await handle(res);
  return j.token as string;
}

export async function getCalendar(courseId: string, token: string): Promise<{ id: string; calendarId: string }> {
  const res = await fetch(`${BASE}/auth/calendar/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}