/**
 * Ping Identity
 * Module representing OIDC endpoints.
 * Implements a library to integrate with PingOne authorization server endpoints.
 * As much as possible, this library will simplify the OIDC protocol flows.
 * For example, the authorization code grant flow requires a get auth code call,
 * then a follow-up call to swap the code for an access/ID token. This is wrapped up
 * in a single get token call because there is no reason to trouble the developer with
 * logic we can infer/presume based on protocol specs and application input.
 *
 * @author Technical Enablement Demo Team, Ping Identity.
 * @version See Github for current stable version. https://github.com/Technical-Enablement-PingIdentity/libraries-sdks
 * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#openid-connectoauth-2
*/

/**
 * // TODO
 * Think like a business apps developer that has to consume OIDC. What would YOU need and expect.
 *  IAM is not their expertise.
 * Design the library as an importable JS module.
 * Thorough JSDoc compliant comments/annotations. We are guiding developers.
 * @see https://jsdoc.app/howto-es2015-modules.html
 * Decisions on how to support less-secure, deprecated grant types. Customers still use them.
 *  console.warn lesser secure usage.
 * Secure coding built in from day one. See OWASP secure coding guidline. We can get guidance
 *
 * from Security team too.
 * Take advantage of destructuring to support default and optional, and named args.
 * Smart, useful deep links to Ping docs. Get them directly to the docs related to the code we
 *
 *  implement.
 *
*/

// JUST DUMPING OUT THOUGHTS AND PSUEDO CODE TO START.

/**
 * // TODO need to think about the design of this module.
 * What's a sensible file name convention. This and the other OIDC JS files are just initial
 * idea. Or
 * maybe we generalize the functions so they would work with any AS.
 * Which module pattern do we implement???
 * Deep diving on the patterns, our best bet is ES6 modules as
 * it gives you "the best of both worlds" of having concepts from both AMD and CommonJS
 * patterns, but
 * moreover it's built into the language. Whereas the former are framework specific conventions.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
 * @see https://medium.com/backticks-tildes/introduction-to-es6-modules-49956f580da
 *
 */
