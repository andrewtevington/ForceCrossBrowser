# ForceCrossBrowser

Query Rally to see which customers should be forced to cross browser.

## Usage

The general syntax is:

`node index.js feature schedule state`

For example:

`node index.js F933 In-Progress`

This will query all in-progress user stories under the `F933` feature. It will then pull the company key out of the case title, and turn on force cross browser for that company in the Squid site.

## Authentication

All authentication credentials (Rally / AWS) are stored in environment variables. Set yours accordingly:

`SET RALLYUSER=user
SET RALLYPASSWORD=password
SET AWSKEY=key
SET AWSSECRET=secretkey
SET AWSREGION=region`