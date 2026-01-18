export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS support
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    // API: Submit survey
    if (url.pathname === "/api/submit" && request.method === "POST") {
      const data = await request.json();

      const timestamp = new Date().toISOString();
      const filename = `customer_${timestamp}.json`;

      await env.BUCKET.put(
        filename,
        JSON.stringify(data, null, 2)
      );

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    // API: Get all responses
    if (url.pathname === "/api/responses" && request.method === "GET") {
      const list = await env.BUCKET.list();
      const results = [];

      for (const obj of list.objects) {
        const file = await env.BUCKET.get(obj.key);
        const json = await file.json();
        json._file = obj.key;
        results.push(json);
      }

      return new Response(
        JSON.stringify(results),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    return new Response("Not Found", { status: 404 });
  }
};
