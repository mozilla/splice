# Buckter

AdGroup buckets construction tool for Tiles project

Bucketer helps populate/edit adGroups.

## links

  * [Bucketerer App on bucketerer.dev.mozaws.net](https://bucketerer.dev.mozaws.net/explore?domain=wired.com).
  * [original Buckterer repo](https://github.com/tspurway/bucketer3r).
  * [Bcolloran model code](https://gist.github.com/bcolloran/7764d88cf22ca4527b43).

## Context

A typical use of Buckter is to populate/edit AdGroup domain list with enough topical domains sites to establish privacy limits and increase the reach of suggested tiles.
There are multiple datasets that provide related sites to a domain.
A user searches for related domains of a particular site within the AdGroup and potentially selects a few related sites that fit AdGroup.
Then a user repeats the search for yet another site in the AdGroup.
This iterative process is repeated until the AdGroup contains enough sites to guarantee the reach and the privacy limits.

Kevin mentions that he uses bucketer once a month when he needs to create a new AdGroup for a new client.

## Privacy

The adGroup must contain of at least 5 sites and the number of unique users of any site should exceed 0.5 of total number of users in a bucket.
This measure is called maxP and computed [here](https://github.com/tspurway/bucketer3r/blob/master/interface/auxiliary.py#L44).
Since for majority of sites the unique users are not known, we use log regression model to compute unique visitors based on rank.
comscore data available for 100 top sites is fit into log-regression and corresponding slope and intercept of regression line are computed.
From that the site's unique visitors are computed as:

```
  exp(log(rank)*slope + intercept))
```

## Data Sets

We have multiple data sets that provide relevant sites for a domain: alexa and similarities.
It appears that alexa draws related sites from dmoz, while similarsites use proprietary algorithms to compute similarity.
Original Buckterer presents a user with both lists.

The datasets are:
  * Alexa - full dump (I think it was purchased from alexa): Used for ranks, and for related sites search
  * Similar Sites - full dump (Purchsed from Similar Group): Used for related site search
  * Comscore data - partial dump from Comscore that covers first 100 most-popular sites: only used to fit log-regrassion model

The reason for update is either an order of magnitude change in a site rank or apperance of highly popular site that we do not know about.
None of the above are very likely, and even if we miss a change in rank or a new hotness, the negative affects are not critical.
I doubt we need to update these data-sets more often then once a year.

### Data that we actually need from datasets

I believe this is all we realistically need from the datasets

  * comscore visitors and rank to fit the model
  * alexa ranks
  * list of related sites to search and pick from

#### Bucket traffic prediction
Yet another bucket measure is the number of unique visitors of a bucket.
Which is not a simple sum of users per site - same user may visit multiple sites in a bucket.
For some reason this number is computed by sum-of-site-vistors / 91.25: [check this code](https://github.com/tspurway/bucketer3r/blob/master/interface/auxiliary.py#L58).
Number of unique visitors doesn't seem to be used anywhere besides Buckterer App, and probably not important.
I hope we do not report this number to a customer as it does not seem to make much sense.

## Adding Bucketer to splice

  * Create tables in campaign database: [see ddl definitions](https://github.com/oyiptong/splice/blob/buckter/bucketer/ddl/bucketer.sql).
  * Make scripts that populate tables from avialable datasets
  * Make scripts that fit the model and populate model table
  * Application queries the database for related sites and model parameters

## Not adding Buckter to splice

  * we can do CLI that will generate bucket list from datasets
  * Per nan's suggestion we may make a stand alone zenko-like app that runs on a laptop
  * we can re-install buckter on a dev instance properly created by Olivier and approved by ops
