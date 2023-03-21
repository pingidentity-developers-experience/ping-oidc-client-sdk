# OAuth/OIDC SDK
## Ping Identity
### Authors: Technical Enablement Demo Team


This project is an OAuth/OIDC SDK (hosted at npmjs.com), for bootstrapping the [OAuth](https://www.rfc-editor.org/rfc/rfc6749) and [OpenID Connect (OIDC)](https://openid.net/developers/specs/) protocol in your own custom applications, with the intent to automate or simplify steps in the protocol flow and integration of it. This allows you, the developer, to do what you do best, focusing on your companies business apps, while Ping Identity handles what we does best, identity security.

With a developer-first focus and simplicity in design, native Javascript APIs were chosen as much as possible over 3rd-party packages and libraries which may conflict with your companies security standards. Additionally, native Javascript APIs simplify maintenance for Ping Identity and its customers, and reduces the potential atack vectors of this package in your applications. 

### Security

#### Software Bill of Materials

NPM transient dependencies can run deep. For this reason, we include a software bill of materials (SBOM) with each release that you or your security teams can audit. These SBOMs are generated using [CycloneDX by OWASP](https://owasp.org/www-project-cyclonedx/). Packages we import are primarily for development of the SDK and can be excluded in builds. These packages may change at our discretion.

#### Responsible Disclosure

Before each release, we run the following commands against our project to ensure a clean project. We make every reasonable effort to resolve category critical and high vulnerabilities.

`npm doctor`
`npx unimported`
`npm outdated`
`npx depcheck`
`npm audit`

Because of the as-is offering and license of this project, it is highly recommended that users of this SDK run `npm audit` and evaluate the results and  make changes to meet their internal application security requirements. Alternatively or additionally you can submit issues in our [Github repo](https://github.com/Technical-Enablement-PingIdentity/dev-enablement-oidc/issues).

#### Disclaimer
THIS ENTIRE PROJECT AND ALL ITS ASSETS IS PROVIDED "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL PING IDENTITY OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) SUSTAINED BY YOU OR A THIRD PARTY, HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT ARISING IN ANY WAY OUT OF THE USE OF THIS SAMPLE CODE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

### Included:

*Eric puts his super clear, concise, intuitive usage docs here*.

stuff about using the sdk

stuff about getting it from NPM

mkaybe stuff about the file system

Test Apps
: Create-React-App (CRA) bootstrapped application Technical Enablement uses to test our code.