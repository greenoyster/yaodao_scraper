var request = require('request');
var cheerio = require('cheerio');
var util = require('util');
var promise = require('promise');
var fs = require('fs');
var htmlEscape = require("html-escape");
var getOpt = require('node-getopt');

var opt = getOpt.create([
    ['', 'post[=]' , 'post id'],
    ['', 'page[=PAGE]'  , 'Rnages of pages to fetch (start:end)'],
    ['', 'output[=DIR]' , 'Output'],
    ['', 'overwrite'    , 'Whether to overwrite existing chapters'],
    ['', 'dryrun'       , 'dry run'],
    ['h', 'help'        , 'Display help']
]).bindHelp().parseSystem();

function getOnePage(url) {
  return new Promise(function(resolve, reject) {
    console.log('Downloading', url);
    request(url, function(err, response, html) {
      if (err) {
        var errMsg = 'Error downloading' + url + err;
        console.log(errMsg);
        reject(errMsg);
      }
      console.log('Downloaded', url);
      resolve(html);
    });
  });
}

function getSections(url) {
  return getOnePage(url).then(function(content) {
    $ = cheerio.load(content);
    return $('td[id^=postmessage]').toArray();
  });
}

function writeFile(fileName, text) {
  fs.exists(fileName, function(exists) {
    if (exists) {
      if (opt.options['overwrite']) {
        console.log('Overwrite', fileName);
      } else {
        console.log('Skip', fileName);
        return;
      }
    } else {
      console.log('New file', fileName);
    }
    if (!opt.options['dryrun']) {
      fs.writeFile(fileName, text);
    }
  });
}

function processSections(index, sections) {
  for (i = 0; i < sections.length; ++i) {
    // Sanitize.
    var node = $(sections[i]);
    node.find('.pstatus').remove();
    node.find('ignore_js_op').remove();
    node.find('a').remove();
    node.find('br').replaceWith('\n');

    // Normalize line break and space.
    // Remove bad char which causes problems when translating to epub (0x0c).
    var text = node.text()
      .replace(/\r\n/g, '\n').replace(/\u3000|\xa0/g, ' ')
      .replace(/\x0c/g, '');

    // epub creator often treats text as html so needs to escape.
    text = htmlEscape(text);

    // Try best to guess redundant line break used to control layout on forum.
    text = text.replace(/([^。,？！」])\n\n([^\s])/g, '$1$2');

    console.log('Writing chapter', index);
    writeFile(String(index++) + '.part', text);
  }
  return index;
}

function download(post_url, startPage, endPage) {
  // Use promise to chain parallel responses in order.
  var all = Promise.resolve(1);
  for (var i = startPage; i <= endPage; ++i) {
    var url = util.format(post_url, i);

    // Create a closure so the "page" is copied. Otherwise the same
    // object is referenced when page is done in each iteration.
    all = (function(page){
      return all.then(function(index) {
        return page.then(processSections.bind(undefined, index));
      }, function(err) {
        console.log(err);
      });
    })(getSections(url));
  }

  all.then(function() {
    console.log('All Done.');
  }, function(err) {
    console.log(err);
  });
}

function getPageNum(post_url) {
  console.log('Getting num of pages');
  var firstPage = util.format(post_url, 1);
  return getOnePage(firstPage).then(function(content) {
    $ = cheerio.load(content);
    return parseInt($('.pgt .pg a.last').text().match(/\d+/)[0], 10);
  });
}

var YAODAO_ID = '1586268';
var URL_TEMPLATE = 'http://ck101.com/thread-%s-%s-1.html';

function main() {
  if ('output' in opt.options) {
    try {
      process.chdir(opt.options['output']);
    } catch (e) {
      console.log('Couldn not change directory', e);
      return;
    };
  }

  console.log(opt.options['post']);
  var post_url = util.format(URL_TEMPLATE, opt.options['post'] || YAODAO_ID);

  var startPage = 1;
  var endPage = null;
  if ('page' in opt.options) {
    pageRange = opt.options['page'].split(':');
    startPage = parseInt(pageRange[0], 10) || startPage;
    endPage = parseInt(pageRange[1], 10) || endPage;
  }

  var last = endPage ? Promise.resolve(endPage) : getPageNum(post_url);
  last.then(function(endPage) {
    console.log('start page', startPage, 'end page', endPage);
    download(post_url, startPage, endPage);
  });
}

main();
