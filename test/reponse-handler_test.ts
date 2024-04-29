import { assertEquals } from "$std/assert/mod.ts";
import { fetchx, responseJsonHandler } from "$fetchx/main.ts";

Deno.test(async function fetchResponseJsonHandler() {
  const fetchx2 = fetchx.withResponseHandler(responseJsonHandler);
  const data = await fetchx2<any>("https://httpbin.org/post", {
    method: "POST",
    json: {
      "name": "Alex",
    },
  });
  assertEquals(data.json.name, "Alex");

  /**
   *  Equal to:
  const url = "https://httpbin.org/get";
  const req = new Request(url, ...);
  const resp = await fetch(req);
  const data = await responseHandler(resp, req);
  console.log(data);
   */
});

Deno.test(async function fetchCustomResponseHandler() {
  const responseJsonHandler = async <T = any>(resp: Response, request: Request): Promise<T> => {
    if (resp?.status) {
      const text = await resp.text();
      return JSON.parse(text);
    } else {
      const errmsg = `can't connect: ${(request?.url)?.slice(0, 200)}`;
      throw Error(errmsg);
    }
  };

  fetchx.setResponseHandler(responseJsonHandler);
  const data = await fetchx<any>("https://httpbin.org/post", {
    method: "POST",
    json: {
      "name": "Alex",
    },
  });
  assertEquals(data.json.name, "Alex");
});