# ForceCrossBrowser

Query Rally each release cycle to see which customers should be forced to cross browser.

## Usage

The general syntax is:

`node index.js feature release`

For example:

`node index.js F934 2017.50`

This will query all accepted user stories under the `F934` feature with a release of `2017.50`. It will then pull the company key out of the case title, and turn on force cross browser for that company in the Squid site.

## Authentication

All authentication credentials (Rally / AWS) should go in `/auth/index.js`. Do not commit actual credentials, leave the exported object as a blank shell.