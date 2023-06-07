# Security Best Practices Reference
Build security in, don't add it on.

## Background
We all know there is really no true solid security when it comes to client-side applications. Applications that run in the browser, also referenced as "SPAs"; single-page applications. Apps that are often developed with frontend frameworks like React, Angular, Next.js, Express.js, or even the classic, jQuery, that started it all.

Evolution:
- The implicit grant type for OAuth has fallen out of favor for client-side apps due to security concerns, including leaving traces of the access token in logs and history.
- The Auth Code grant type has become the security best practice recommendation, with slightly different options enforced due to the nature of data exposure with client-side applications, such as not using secrets to authenticate to the OAuth AS, but enforce PKCE and state options.

For this reason we are providing a shortlist of targeted best practices related to browser-based apps that use OAuth/OIDC, and I assume this SDK since you're here. These are taken from the IETF document linked below if you want to finish rounding out your knowledge in this area of security. But this shortlist is to save you some reading and sifting time.

## Shortlist
These items are supported by both this OAuth/OIDC SDK and Ping's authorization server products and services; PingOne & PingFederate.

**Browser-based applications:**

-  MUST use the OAuth 2.0 authorization code flow with the PKCE
    extension when obtaining an access token

-  MUST Protect themselves against CSRF attacks by either:

    *  ensuring the authorization server supports PKCE, or

    *  by using the OAuth 2.0 "state" parameter or the OpenID Connect
        "nonce" parameter to carry one-time use CSRF tokens

-  MUST Register one or more redirect URIs, and use only exact
    registered redirect URIs in authorization requests

**OAuth 2.0 authorization servers:**

- MUST Require exact matching of registered redirect URIs
- MUST Support the PKCE extension
- MUST NOT issue access tokens in the authorization response
- Access tokens should be short-lived.
- If issuing refresh tokens to browser-based apps, then:
    *  SHOULD rotate refresh tokens on each use, and
    *  MUST set a maximum lifetime on refresh tokens or expire if they
        are not used in some amount of time
    * Protect refresh tokens.

## References
Because security has no finish line.

- [OAuth 2.0 for Browser-based Apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-07)
- tldr; key topics:
    - [Overview](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-07#section-4)
    - [Javascript Applications w/o a Backend (architecture)](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-07#section-6.3)
    - [Other JS App Architecture Patterns](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-07#section-6)
    - [Refresh Tokens](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-07#section-8)
    - [Client Authentication](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-07#section-9.2)

Deep Dive in OAuth Security
- [OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics-16)