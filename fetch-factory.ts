
type ResponseHandler<T> = (resp: Response, req: Request) => Promise<T>;
type ErrorHandler = (err: any, req: Request) => void;

interface RequestInitExt extends RequestInit {
  data?: any;
  params?: object | URLSearchParams;
  json?: Record<string, any> | string | number | Array<unknown>;
}


export function addSearchParams(
  params: URLSearchParams | object = {},
  oriurl: undefined | URL | string = undefined
) {
  const urlInfo = (oriurl instanceof URL) ?
    oriurl :
    new URL(oriurl || globalThis.location.href);
  const searchParams = new globalThis.URLSearchParams(urlInfo.search);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, '' + value);
    }
  });

  urlInfo.search = searchParams.toString();
  const url = urlInfo.toString();
  return url;
}

/**
 *
 * @param headers
 * @param key
 * @param value
 * @returns
 */
function addHeader(headers: HeadersInit, key: string, value: string) {
  if (headers instanceof Array) {
    headers.push([key, value]);
  } else if (headers instanceof Headers) {
    headers.set(key, value);
  } else {
    // @ts-ignore:
    headers[key] = value;
  }
  return headers;
}

function addHeaders(headers: HeadersInit, newHeaders: Record<string, string>) {
  for (const [key, value] of Object.entries(newHeaders)) {
    addHeader(headers, key, value);
  }
  return headers;
}


class Callable extends Function {
  constructor() {
    super('return arguments.callee._call(...arguments)');
  }
}


export type FetchTracer = (req: Request) => Promise<any>;

class FetchFactory<T = any> extends Callable {
  #defaultInit: RequestInit = {};
  #responseHandler: ResponseHandler<T>;
  #errorHandler: ErrorHandler;
  #fetchTracer?: FetchTracer;

  constructor(defaultInit: RequestInit, responseHandler: ResponseHandler<T>, errorHandler: ErrorHandler) {
    super();
    this.#defaultInit = defaultInit || {};
    this.#responseHandler = responseHandler;
    this.#errorHandler = errorHandler;
  }

  // fetch
  async _call<M = any>(input: string | URL, init?: RequestInitExt): Promise<M> {
    if (init?.data) {
      if (typeof init.data === 'string'
        || init.data instanceof URLSearchParams
      ) {
        init.headers = addHeader(init?.headers ?? {}, 'Content-Type', 'application/x-www-form-urlencoded');
        init.body = init.data;
      } else if (
        init.data instanceof FormData
        || init.data instanceof Blob
      ) {
        init.body = init.data;
      } else {
        init.json = init.data;
      }
      delete init.data;
    }
    if (init?.params) {
      input = addSearchParams(init.params, input);
      delete init.params;
    }
    if (init?.json) {
      init.headers = addHeader(init?.headers ?? {}, 'Content-Type', 'application/json');
      init.body = JSON.stringify(init.json);
      delete init.json;
    }
    const newinit = { ...this.#defaultInit, ...(init || {}) };
    const req = new Request(input, newinit);
    try {
      let response: Response;
      if (this.#fetchTracer) {
        response = await this.#fetchTracer(req);
      } else {
        response = await fetch(req)
      }
      const handledResp = this.#responseHandler!(response, req) as M;
      return handledResp;
    } catch (e) {
      this.#errorHandler(e, req);
      return Promise.reject(e);
    }
  }

  withHeader(key: string, value: string) {
    this.#defaultInit.headers = addHeader(this.#defaultInit.headers ?? {}, key, value);
    return this;
  }

  withTracer(tracer: FetchTracer) {
    this.#fetchTracer = tracer;
  }

  get(url: string | URL, init?: RequestInitExt) {
    const options = Object.assign({ method: "GET", }, init);
    return this._call(url, options);
  }
  post(url: string | URL, init?: RequestInitExt) {
    const options = Object.assign({ method: "POST" }, init);
    return this._call(url, options);
  }
  delete(url: string | URL, init?: RequestInitExt) {
    const options = Object.assign({ method: "DELETE" }, init);
    return this._call(url, options);
  }
  put(url: string | URL, init?: RequestInitExt) {
    const options = Object.assign({ method: "PUT" }, init);
    return this._call(url, options);
  }
  patch(url: string | URL, init?: RequestInitExt) {
    const options = Object.assign({ method: "PUT" }, init);
    return this._call(url, options);
  }
}

type FetchFactoryF = FetchFactory & FetchFactory['_call'];
const FetchFactoryAlias = FetchFactory as new (
  ...args: ConstructorParameters<typeof FetchFactory>
) => FetchFactoryF;

export { FetchFactoryAlias as FetchFactory };
export default FetchFactory as typeof FetchFactoryAlias;


export const PolicyDict = {
  // Referer will never be set.
  NoReferer: 'no-referrer',

  // Referer will not be set when navigating from HTTPS to HTTP.
  NoRefererWhenDowngrade: 'no-referrer-when-downgrade',

  // Full Referer for same-origin requests, and no Referer for cross-origin requests.
  SameOrigin: 'same-origin',

  // Referer will be set to just the origin, omitting the URL's path and search.
  Origin: 'origin',

  // Referer will be set to just the origin except when navigating from HTTPS to HTTP,
  // in which case no Referer is sent.
  StrictOrigin: 'strict-origin',

  // Full Referer for same-origin requests, and bare origin for cross-origin requests.
  OriginWhenCrossOrigin: 'origin-when-cross-origin',

  // Full Referer for same-origin requests, and bare origin for cross-origin requests
  // except when navigating from HTTPS to HTTP, in which case no Referer is sent.
  StrictOriginWhenCrossOrigin: 'strict-origin-when-cross-origin',

  // Full Referer for all requests, whether same- or cross-origin.
  UnsafeUrl: 'unsafe-url'
} as const;

/*
Object.values(PolicyDict).forEach(policy => {
  fetch(url, {referrerPolicy: policy});
});
*/
