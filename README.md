# Developer Enablement Libraries and Assets
## Authors: Michael Sanchez, Jon Oblander
### Contributors: Zhanna Avenesova, Eric Anderson, Kristina Salgado

#### Technical Enablement, Ping Identity

This project is a collection of re-usable libraries (hosted at npmjs.com), utilities, Postman collections, and documents for bootstrapping Identity and Access Management (IAM) protocols and Ping's authentication Application Programming Interfaces (APIs).

The code included is restricted to best security practices and protocols. But considering the use cases and needs of the wider audience of Ping's customers, there are optional parameters included to utilize other options that will log warnings to let you know you have chosen lesser secure options.

With a developer-first focus and simplicity in design, native Javascript APIs were chosen over 3rd-party packages and libraries which may conflict with your companies security standards. Additionally, native Javascript APIs simplify maintenance for Ping and its customers, and lessens the threat landscape in your applications. NPM transient dependencies can run deep. The one exception we made was choosing Axios over fetch() for HTTP requests. This may change at our discretion should Axios dependencies begin to outweigh the benefits.

#### Included:

Libraries
: Javascript modules hosted in NPM that encapsulate IAM protocols, such as OpenID Connect (OIDC), to automate or simplify steps in the protocol flow. Modules for simplifying various Ping product authentication APIs.
**DO NOT** clone this source code and add it to your projects source code. All libraries are hosted in NPM and can simply be added to your package.json file.
Of course, if you are working on traditional, plain old JavaScript apps, then cloning is your only option. 

Postman-collections
: Groups of ordered APIs based on common authentication use cases.

Utilities
: Collection of various scripts that Technical Enablement has found useful during development, including shell scripts for automation.

Test-apps
: Create-React-App (CRA) bootstrapped applications Technical Enablement uses to test our code (includes JSON files for mock API responses to remove the backend dependency unique to each company.)