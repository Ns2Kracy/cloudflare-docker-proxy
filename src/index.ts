import DOCS from './help.html';

enum Mode {
  Production = 'production',
  Debug = 'debug',
}

let MODE: Mode = Mode.Production;
let TARGET_UPSTREAM: string = '';

interface Env {
  MODE?: string;
  TARGET_UPSTREAM?: string;
}

interface Routes {
  [key: string]: string;
}

const dockerHub = 'https://registry-1.docker.io';

const routes: Routes = {
  // production
  'docker.ns2kracy.com': dockerHub,
  'quay.ns2kracy.com': 'https://quay.io',
  'gcr.ns2kracy.com': 'https://gcr.io',
  'k8s-gcr.ns2kracy.com': 'https://k8s.gcr.io',
  'k8s.ns2kracy.com': 'https://registry.k8s.io',
  'ghcr.ns2kracy.com': 'https://ghcr.io',
  'cloudsmith.ns2kracy.com': 'https://docker.cloudsmith.io',
  'ecr.ns2kracy.com': 'https://public.ecr.aws',

  // staging
  'docker-staging.ns2kracy.com': dockerHub,
};

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    MODE = (env.MODE || Mode.Production) as Mode;
    TARGET_UPSTREAM = env.TARGET_UPSTREAM || '';
    return handleRequest(request);
  },
};

function routeByHosts(host: string): string {
  return routes[host] ?? (MODE === Mode.Debug ? TARGET_UPSTREAM : '');
}

function getAuthorizationHeaders(request: Request): Headers {
  const headers = new Headers();
  const authorization = request.headers.get('Authorization');
  if (authorization) {
    headers.set('Authorization', authorization);
  }
  return headers;
}

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const upstream = routeByHosts(url.hostname);

  // return docs
  if (url.pathname === '/') {
    return new Response(DOCS, {
      status: 200,
      headers: {
        'content-type': 'text/html',
      },
    });
  }

  if (upstream === '') {
    return new Response(
      JSON.stringify({
        routes: routes,
      }),
      {
        status: 404,
      }
    );
  }

  const isDockerHub = upstream === dockerHub;
  const authorization = request.headers.get('Authorization');

  if (url.pathname === '/v2/') {
    const newUrl = new URL(upstream + '/v2/');
    const headers = getAuthorizationHeaders(request);

    // check if need to authenticate
    const resp = await fetch(newUrl.toString(), {
      method: 'GET',
      headers: headers,
      redirect: 'follow',
    });
    if (resp.status === 401) {
      const wwwAuthenticateHeader = MODE === Mode.Debug
        ? `Bearer realm="http://${url.host}/v2/auth",service="cloudflare-docker-proxy"`
        : `Bearer realm="https://${url.hostname}/v2/auth",service="cloudflare-docker-proxy"`;

      headers.set('Www-Authenticate', wwwAuthenticateHeader);

      return new Response(JSON.stringify({ message: 'UNAUTHORIZED' }), {
        status: 401,
        headers: headers,
      });
    } else {
      return resp;
    }
  }

  // get token
  if (url.pathname === '/v2/auth') {
    const newUrl = new URL(upstream + '/v2/');
    const resp = await fetch(newUrl.toString(), {
      method: 'GET',
      redirect: 'follow',
    });

    if (resp.status !== 401) {
      return resp;
    }

    const authenticateStr = resp.headers.get('WWW-Authenticate');
    if (!authenticateStr) {
      return resp;
    }

    const wwwAuthenticate = parseAuthenticate(authenticateStr);
    let scope = url.searchParams.get('scope');

    // autocomplete repo part into scope for DockerHub library images
    scope = isDockerHub ? normalizeScopeForDockerHub(scope) : scope;

    return await fetchToken(wwwAuthenticate, scope, authorization);
  }

  // redirect for DockerHub library images
  if (isDockerHub) {
    const newUrl = redirectDockerHubLibraryImages(url);
    if (newUrl) {
      return Response.redirect(newUrl.toString(), 301);
    }
  }

  // forward requests
  const newUrl = new URL(upstream + url.pathname);
  const newReq = new Request(newUrl.toString(), {
    method: request.method,
    headers: request.headers,
    redirect: 'follow',
  });

  return await fetch(newReq);
}

function redirectDockerHubLibraryImages(url: URL): URL | null {
  const pathParts = url.pathname.split('/');
  if (pathParts.length === 5 && !pathParts.includes('library')) {
    pathParts.splice(2, 0, 'library');
    const newUrl = new URL(url.toString());
    newUrl.pathname = pathParts.join('/');
    return newUrl;
  }
  return null;
}

const WWW_AUTHENTICATE_PATTERN = /(?<=\=")(?:\\.|[^"\\])*(?=")/g;

interface Authenticate {
  realm: string;
  service: string;
}

function parseAuthenticate(authenticateStr: string): Authenticate {
  const matches = authenticateStr.match(WWW_AUTHENTICATE_PATTERN);
  if (!matches || matches.length < 2) {
    throw new Error(`invalid Www-Authenticate Header: ${authenticateStr}`);
  }
  return {
    realm: matches[0],
    service: matches[1],
  };
}

async function fetchToken(wwwAuthenticate: Authenticate, scope: string | null, authorization: string | null): Promise<Response> {
  const url = new URL(wwwAuthenticate.realm);
  if (wwwAuthenticate.service) {
    url.searchParams.set('service', wwwAuthenticate.service);
  }
  if (scope) {
    url.searchParams.set('scope', scope);
  }

  const headers = new Headers();
  if (authorization) {
    headers.set('Authorization', authorization);
  }

  return await fetch(url.toString(), { method: 'GET', headers: headers });
}

function normalizeScopeForDockerHub(scope: string | null): string | null {
  if (!scope) return null;
  const scopeParts = scope.split(':');
  if (scopeParts.length === 3 && !scopeParts[1].includes('/')) {
    scopeParts[1] = `library/${scopeParts[1]}`;
  }
  return scopeParts.join(':');
}
