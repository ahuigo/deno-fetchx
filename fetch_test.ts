import { assertEquals } from "https://deno.land/std@0.219.0/assert/mod.ts";
import { FetchFactory } from "./main.ts";
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
      const errmsg = text + `(${url})`;
      console.error("can't parse json ->" + errmsg);
    }
    return responseObj;
  } else {
    const msg = `can't connect: ${(request?.url)?.slice(0, 200)}`;
    throw msg;
  }
};

async function errorHander(err: any, req: Request) {
  const url = req.url;
  const msg = `can't access: ${url.slice(0, 200)}\n`;
  console.error(err);
  throw { err: msg };
}

Deno.test(async function fetchPostExample() {
  const request = new FetchFactory(
    {
      mode: "cors",
      credentials: 'include', // include cookie
    },
    responseHandler,
    errorHander,
  );

  const data = await request.post("https://httpbin.org/post", {
    data: {
      "name": "Alex",
    }
  }).then(data => {
    console.log(data);
    return data;
  }) as any;
  assertEquals(data.json.name, "Alex");
});

Deno.test(async function fetchRawExample() {
  const url = "https://httpbin.org/get";
  const req = new Request(url);
  const resp = await fetch(req);
  const data = await responseHandler(resp, req);
  console.log(data);
});
