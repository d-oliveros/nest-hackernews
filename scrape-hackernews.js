var Nest = require('node-nest');

var nest = new Nest();

nest.addRoute({

  // This is the route ID
  key: 'hackernews-articles',


  // Route url strings are passed to lodash's 'template' function.
  // @see https://lodash.com/docs#template
  //
  // You can also provide a function that should return the newly built URL
  //
  // the scraping state is available in the URL generator function's scope
  // we can use the "state.currentPage" property to enable pagination
  url: 'https://news.ycombinator.com/news?p=<%= state.currentPage %>',

  scraper: function($) {
    var currentPage = $('.rank').last().text() / 30;

    // You should return an object with the following properties:
    // - items:       `Array` Items to save in the database.
    // - jobs:        `Array` New scraping jobs to add to the scraper worker queue
    // - hasNextPage: `Boolean` If true, Nest will scrape the "next page"
    var data = {
      items: [],

      // by returning data through the 'jobs' property,
      // you are queueing new scraping operations for the workers to pick up
      jobs: [],

      // if this property is true, the scraper will re-scrape the route,
      // but with the 'state.currentPage' parameter incremented by 1
      //
      // for the sake of this example, let's just scrape the first 5 pages
      hasNextPage: currentPage < 5
    };

    // The HTML is already loaded and wrapped with Cheerio in '$',
    // meaning you can get data from the page, jQuery style.

    // for each article
    $('tr.athing').each((i, row) => {

      // create superficial hackernews article items in the database
      data.items.push({
        key: $(row).attr('id'), // this is the only required property
        title: $(row).find('a.storylink').text(),
        href: $(row).find('a.storylink').attr('href'),
        postedBy: $(row).find('a.hnuser').text()
      });

      // also, queue scraping jobs to the "hackernews-post" route, defined above
      data.jobs.push({
        routeId: 'hackernews-post', // defines which route to be used
        query: { // defines the "query" object, used to build the final URL
          id: $(row).attr('id')
        }
      });
    });

    // Nest will save the objects in 'data.items' and queue jobs in 'data.jobs'
    // Nest won't repeat URLs that have already been scraped
    return data;
  }
});

nest.addRoute({
  key: 'hackernews-post',

  // Route url strings are passed to lodash's 'template' function.
  // You can also provide a function that should return the newly built URL
  // @see https://lodash.com/docs#template
  url: 'https://news.ycombinator.com/item?id=<%= query.id %>',

  scraper: function($) {
    var $post = $('tr.athing').first();

    return {
      items: [{
        key: $post.attr('id'),
        title: $post.find('.title a').text(),
        href: $post.find('.title a').attr('href'),
        postedBy: $post.find('.hnuser').text(),

        // for the sake of this tutorial let's just save most voted comment
        bestComment: $('.comment').first().text()
      }]
    };
  }
});

nest.queue('hackernews-articles');

nest.start().catch((err) => console.error(err));
