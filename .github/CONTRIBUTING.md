# Contributor Guidelines

## Requirements
- The OAuth and OIDC specs are the requirements. No bespoke enhancements. No tight coupling with products/vendors.
- One of the original goals of this SDK was to make OAuth/OIDC as simple as possible for the developer. If we can infer it based on our knowledge of the spec, don't bother the developer with it. The developer just needs to get a token and use it. 
- To date, we have no plans to support ROPC or client credentials grants. They are less secure protocol options, and are planned to be removed from the OAuth spec in [the coming 2.1 draft version](https://oauth.net/2.1/). The client credentials grant, however, may make an appearance in a future server-side version of this SDK.
  - If you have a need for the SDK to support these other less secure grant types, you can always clone the repository, instead of forking it, and start your own version of this SDK. OAuth specs are linked below under Reference Documentation.

## Coding Conventions

- Our top priorities are Security, quality, integrity.
- Notwithstanding `devDependencies`, we DO NOT use 3rd-party packages, and only use intrinsic Javascript functions and APIs to remove or reduce the supply chain threat landscape. Transitive dependencies run deep in package managers and quickly increase your risk score.
- We develop in Typescript for strongly typed implementations.

## Commits
- We prefer signed commits in support of non-repudiation, but do not enforce it since we don't control your environment or internal business requirements. See the reference documentation below.
- Commit messages should be concise but clear. When relevant, reference an issue number.
- Changes that are cosmetic in nature and do not add anything substantial to the security, stability, functionality, or testability of the SDK will generally not be accepted.

## Pull Requests
- tk

## Issues
- **Do not open up a GitHub issue if the bug is a security vulnerability**, and instead refer to the [Responsible Disclosure](https://www.pingidentity.com/en/company/security-at-ping-identity.html) section on our security page, and follow instructions to [file a support case](https://support.pingidentity.com/s/security-vulnerability).
- Use the standard [Issues](https://github.com/pingidentity-developers-experience/ping-oidc-client-sdk/issues) page to report any non-security bugs, or other findings to be fixed or enhanced.
- Ensure the bug was not already reported by searching on our [GitHub issues](https://github.com/pingidentity-developers-experience/ping-oidc-client-sdk/issues) page.
- Use labels.
- Titles should be concise but clear.
- The comment section should include steps to reproduce, expected and actual behavior.

## Community Expectations
- Be professional.
- Remember, the world can see your work and comments.
- "All your code are belong to us."

## Reference Documentation
- [Signed Commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)
  - [Non-repudiation](https://csrc.nist.gov/glossary/term/non_repudiation)
- [Typescript](https://www.typescriptlang.org/)
- [OAuth Spec](https://datatracker.ietf.org/doc/html/rfc6749)
  - [For browser-based apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-07)
  - [Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics-16)
- [OIDC Spec](https://openid.net/specs/openid-connect-core-1_0.html)
