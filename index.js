const https = require("https");
const csv = require("csv-parser");
const fs = require("fs");
var stringify = require("csv-stringify");
var sleep = require('sleep');

var arr = [];
var isbncount = 0;

fs.createReadStream("data.csv")
  .pipe(csv())
  .on("data", (row) => {
    isbncount++
    console.log(row.isbn);
    var isbn = row.isbn;
    const url =
      "https://www.googleapis.com/books/v1/volumes?q=isbn:" + isbn+ "&key=AIzaSyAMwH_btfiHc-2PoVDDoT5k6yCeoE8_E-0";
     googleAPI(url , isbn);
  })
  .on("end", () => {
    console.log("Total ISBN" + " "+ isbncount);
    console.log("ISBN file successfully processed");
  });
  function googleAPI (url , isbn){
    https.get(url, (res) => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", (data) => {
        body += data;
      });
      res.on("end", () => {
        body = JSON.parse(body);
        if (body.totalItems === 0 ) {
          console.log("No Result Found For" + " " + isbn);
        } else {
          console.log("Current isbn" + " " + isbn )
          let obj = {};
          if (typeof body.items[0].volumeInfo.authors === "undefined") {
            obj["Author"] = "N/A";
          } else {
            obj["Author"] = body.items[0].volumeInfo.authors[0];
          }
          obj["Title"] = body.items[0].volumeInfo.title;
          if (typeof body.items[0].volumeInfo.subtitle === "undefined") {
            obj["Subtitle"] = "N/A";
          } else {
            obj["Subtitle"] = body.items[0].volumeInfo.subtitle;
          }
          if (typeof body.items[0].volumeInfo.description === "undefined") {
            obj["Description"] = "N/A";
          } else {
            obj["Description"] = body.items[0].volumeInfo.description;
          }
          if (typeof body.items[0].volumeInfo.categories === "undefined") {
            obj["Categories"] = "N/A";
          } else {
            obj["Categories"] = body.items[0].volumeInfo.categories[0];
          }
          if (typeof body.items[0].volumeInfo.publisher === "undefined") {
            obj["Publisher"] = "N/A";
          } else {
            obj["Publisher"] = body.items[0].volumeInfo.publisher;
          }
          if (typeof body.items[0].volumeInfo.publishedDate === "undefined") {
            obj["PublishedDate"] = "N/A";
          } else {
            obj["PublishedDate"] = body.items[0].volumeInfo.publishedDate;
          }
          obj["Language"] = body.items[0].volumeInfo.language;
          if (typeof body.items[0].volumeInfo.printType === "undefined") {
            obj["BookType"] = "N/A";
          } else {
            obj["BookType"] = body.items[0].volumeInfo.printType;
          }
          if (typeof body.items[0].volumeInfo.pageCount === "undefined") {
            obj["PageCount"] = "N/A";
          } else {
            obj["PageCount"] = body.items[0].volumeInfo.pageCount;
          }
          obj["ISBN"] =
            body.items[0].volumeInfo.industryIdentifiers[1].identifier;
          if (typeof body.items[0].volumeInfo.imageLinks === "undefined") {
            obj["imageLinks"] = "N/A";
          } else {
            obj["imageLinks"] = body.items[0].volumeInfo.imageLinks.thumbnail;
          }
          arr.push(obj);
          stringify(arr, { header: true }, (err, output) => {
            if (err) throw err;
            fs.writeFile("out.csv", output, (err) => {
              if (err) throw err;
              console.log("Details Saved For" + " " + isbn);
            });
          });
        }
      });
    });
  }
  