var fs = require('fs');
var util = require('util');
var getOpt = require('node-getopt');

var opt = getOpt.create([
    ['', 'input=DIR' , 'Iutput'],
    ['', 'output=DIR' , 'Output'],
    ['h', 'help'        , 'Display help']
]).bindHelp().parseSystem();

if (!opt.options['input'] || !opt.options['output']) {
  console.log('Must specify --input and --output');
  return;
}

var inputDir = opt.options['input'];
var outputFile = opt.options['output'];

var fd = fs.openSync(outputFile, 'w');

var title = '妖刀記';
var author = '默默猴';
fs.writeSync(fd, util.format('%% %s\n%% %s\n\n', title, author));

for (var i = 1; ;++i) {
  var fileName = util.format('%s/%s.part', inputDir, i);
  if (!fs.existsSync(fileName)) {
    break;
  }
  var text = fs.readFileSync(fileName, {'encoding':'utf8'});

  // Try best to get title (for checking only).
  var title = text.match(/\s*([^\n]+)\s*/)[1];
  console.log('Writing', title);

  // Turn first line into chapter title. 
  text = text.replace(/^\s+(.*)/, '$1');
  try {
    fs.writeSync(fd, '# ' + text + '\n\n');
  } catch (err) {
    console.log('Append file error', err);    
  };
}

fs.closeSync(fd);
