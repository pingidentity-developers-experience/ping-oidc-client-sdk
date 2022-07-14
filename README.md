# Developer Enablement OIDC package
## Technical Enablement, Ping Identity
### Authors: Michael Sanchez, Jon Oblander

#### Contributors: Zhanna Avenesova, Eric Anderson, Kristina Salgado

This project is a collection of re-usable modules (hosted at npmjs.com), for bootstrapping the OpenID Connect (OIDC) protocol, with the intent to automate or simplify steps in the protocol flow. This allows you, the developer, to do what you do best, focusing on your companies business apps, while Ping Identity handles what we does best, identity security.

The code included has a prediliction for security best practices, obviously. But considering the use cases and needs of the wider audience of Ping's customers, there are optional parameters included to utilize other options that will log warnings to let you know you have chosen lesser secure options.

With a developer-first focus and simplicity in design, native Javascript APIs were chosen over 3rd-party packages and libraries which may conflict with your companies security standards. Additionally, native Javascript APIs simplify maintenance for Ping and its customers, and lessens the threat landscape in your applications. NPM transient dependencies can run deep. The one exception we made was choosing Axios over fetch() for HTTP requests. This may change at our discretion should Axios dependencies begin to outweigh the benefits.

*DO NOT* clone this source code and add it to your projects source code. All packages are hosted in NPM and can simply be added to your package.json file.
Of course, if you are working on traditional, plain old JavaScript apps, then cloning is your only option. We do not offer hosting our libraries on a CDN.
#### Included:

Test Apps
: Create-React-App (CRA) bootstrapped applications Technical Enablement uses to test our code (includes JSON files for mock API responses to remove the backend dependency unique to each company.)