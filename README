<h1>妖刀記 scraper</h1>

## overview
  This project downloads the onging book 妖刀記 from some post on 卡提諾論壇(ck101.com) to files. Then we can create an ebook from the text files.

## prerequisite
  - node.js + npm
  - pandoc (epub creator), you can replace it by whatever ebook creator you like.

## Usage
  - npm install

  Install needed packages defined in package.json

  - node download.js [--page=\<start\>:\<end\>] [--output] [--overwrite]
  
  This step downads each subpost, usually one chapter(一折) into a separate file<chapter index>.part. 
    - --page Specifies indices of pages in the post to download. If omitted it downloads all pages available. 
    - --output Output directory.
    - --overwrite Wehther to overwrite existing files.

  - Modify the text files as you like. There're many bad layout, typo, missing words, etc. I can't fix it without books in hand.

  - node combine.js --input --output
 
  Combines each chapters into a single file in markdown language so ebook creator can consume.
    - --input and --output are mandatory.

  - Generate ebook
    - Example: pandoc -s -o 妖刀記.epub yaodao

## Caveat
  The content of this post from 卡提諾 is not in a good condition. I tried my best to fix some problems systematically. For example, it uses `<br>` to break lines in the middle of a sentence to fit the forum layout. I did a hack to delete all line breaks which don't come after a punctuation and the next line doesn't start with spaces. Thought hacky, it saves my eyes a lot. Also it's hard to determine the title of each chapter because it doesn't always sit in the first line perfectly. 
