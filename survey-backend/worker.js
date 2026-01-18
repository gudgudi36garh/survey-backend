export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    // Submit survey
    if (url.pathname === "/api/submit" && request.method === "POST") {
      const data = await request.json();
      const key = `customer_${Date.now()}`;

      await env.SURVEY_KV.put(key, JSON.stringify(data));

      return new Response(JSON.stringify({ success: true }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Get all responses
    if (url.pathname === "/api/responses" && request.method === "GET") {
      const list = await env.SURVEY_KV.list();
      const results = [];

      for (const key of list.keys) {
        const value = await env.SURVEY_KV.get(key.name);
        results.push(JSON.parse(value));
      }

      return new Response(JSON.stringify(results), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    return new Response("Not Found", { status: 404 });
  }
};
