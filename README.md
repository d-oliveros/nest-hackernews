
## Nest Hackernews Example

This is a simple example that scrapes the first 5 pages of hackernews.

## Requirements

  * MongoDB up and running
  * Node


## Installation

```shell
git clone https://github.com/d-oliveros/nest-hackernews.git
cd nest-hackernews
npm install
```

Also, make sure MongoDB is up and running. See [Install MongoDB](https://docs.mongodb.com/manual/installation/#mongodb-community-edition).


## Usage

Run this program by doing:

```
node scrape-hackernews
```

After running the example, the first worker will go to the articles feed, scrape the 30 articles in the list, store those scraped items in the database, and queue scraping jobs to those articles by their article ID. Then, it will paginate and scrape the next page of the feed.

Meanwhile, the other workers will pick the jobs in the queue, scrape the article pages, and update the article in the database by their article ID.

Try looking at the scraped data using mongo's native REPL:

```shell
mongo nest
> db.items.count()
> db.items.find().pretty()
```

Cheers.
