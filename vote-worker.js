export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const url = new URL(request.url);
    if (!env.OPENCLAW_VOTES) {
      return json({ error: "OPENCLAW_VOTES KV binding is missing" }, 500, cors);
    }

    if (url.pathname === "/votes" && request.method === "GET") {
      const version = cleanVersion(url.searchParams.get("version"));
      if (!version) return json({ error: "version is required" }, 400, cors);
      return json(await readCounts(env, version), 200, cors);
    }

    if (url.pathname === "/votes" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "invalid json" }, 400, cors);
      }

      const version = cleanVersion(body.version);
      const choice = body.choice === "reject" ? "reject" : body.choice === "recommend" ? "recommend" : "";
      if (!version || !choice) return json({ error: "version and choice are required" }, 400, cors);

      const counts = await readCounts(env, version);
      counts[choice] += 1;
      await env.OPENCLAW_VOTES.put(`votes:${version}`, JSON.stringify(counts));
      return json(counts, 200, cors);
    }

    return json({ error: "not found" }, 404, cors);
  },
};

async function readCounts(env, version) {
  const stored = await env.OPENCLAW_VOTES.get(`votes:${version}`, "json");
  return {
    version,
    recommend: Number(stored?.recommend || 0),
    reject: Number(stored?.reject || 0),
  };
}

function cleanVersion(value) {
  const text = String(value || "").trim();
  return /^[0-9]{4}\.[0-9]{1,2}\.[0-9]{1,2}([-.][0-9A-Za-z.-]+)?$/.test(text) ? text : "";
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers });
}
