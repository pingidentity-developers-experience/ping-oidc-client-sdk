# Contributor Guidelines

## Requirements
- The OAuth and OIDC specs are the requirements. No bespoke enhancements

## Coding Conventions

- Our top priorities are Security, quality, integrity.
- Notwithstanding `devDependencies`, we DO NOT use 3rd-party packages, and only use intrinsic Javascript functions and APIs to remove or reduce the supply chain threat landscape. Transitive dependencies run deep in package managers and quickly increase your risk score.
- We develop in Typescript for strongly typed implementations.

## Commits
- We prefer signed commits in support of non-repudiation, but do not enforce it since we don't control your environment or internal business requirements. See the reference documentation below.
- Commit messages should be concise but clear. When relevant, reference an issue number.

## Issues
- Use the standard [Issues](https://github.com/pingidentity-developers-experience/ping-oidc-client-sdk/issues) page to report any findings.
- Use labels.
  - We created a `security` label for findings that are a potential vulnerability, or the issue puts security at risk, or if you made a security enhancement. This can be combined with related labels, such as `bug` or `enahncement`.
- Titles should be concise but clear.
- The comment section should include steps to reproduce, expected and actual behavior.

## Pull Requests


## Reference Documentation
- [Signed Commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)
- [Typescript](https://www.typescriptlang.org/)
- [OAuth Spec](https://datatracker.ietf.org/doc/html/rfc6749)
  - [For browser-based apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-07)
  - [Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics-16)
- [OIDC Spec](https://openid.net/specs/openid-connect-core-1_0.html)


## Community Expectations