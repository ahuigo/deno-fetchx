import { assertEquals } from "$std/assert/mod.ts";
import { fetchx } from "./main.ts";


const responseHandler = async <T = any>(response: Response, request: Request): Promise<T> => {
  if (request?.mode == 'no-cors') {
    return "" as T;
  } else if (response?.status) {
    // const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    const text = await response.text();
    let responseObj: any;
    // 1. handle status
    if (status == 401) {
      throw new Error('401');
    }
    // 2. handle json
    try {
      responseObj = JSON.parse(text);
    } catch (e) {
      const errmsg = "can't parse json: " + text + `(${url})`;
      console.error("can't parse json: " + errmsg);
      throw new Error(errmsg);
    }
    return responseObj;
  } else {
    const msg = `can't connect: ${(request?.url)?.slice(0, 200)}`;
    throw msg;
  }
};

Deno.test(async function fetchPostExample() {
  fetchx.setResponseHandler(responseHandler);

  // data = await fetchx.post("https://httpbin.org/post", ...)
  const data = await fetchx<any>("https://httpbin.org/post", {
    method: "POST",
    data: {
      "name": "Alex",
    },
  });
  assertEquals(data.json.name, "Alex");
});

Deno.test(async function fetchRawExample() {
  const url = "https://httpbin.org/get";
  const req = new Request(url);
  const resp = await fetch(req);
  const data = await responseHandler(resp, req);
  console.log(data);
});
