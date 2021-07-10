const axios = require('axios')
const csv = require("csv-parser");
const fs = require("fs");
const xlsl = require("xlsx");


var arr = [];
var isbncount = 0;

(async() => {
  fs.createReadStream("data1.csv")
  .pipe(csv())
  .on("data", (row) => {

    isbncount++
    console.log(row.isbn);
    var isbn = row.isbn;

    const url =
      "https://www.googleapis.com/books/v1/volumes?q=isbn:" + isbn+ "&key=AIzaSyAMwH_btfiHc-2PoVDDoT5k6yCeoE8_E-0";
       var resultData =  googleAPI(url , isbn);

      var arrayData = resultData.then(function (result) {
        arr.push(result);
        return arr
      })

       arrayData.then(function (arrayResult){
        const wb = xlsl.utils.book_new();
        const ws = xlsl.utils.json_to_sheet(arrayResult);
        xlsl.utils.book_append_sheet(wb,ws);
        xlsl.writeFile(wb,"links.xlsx");
      })
  })
  
  .on("end", () => {
    console.log("Total ISBN" + " "+ isbncount);
    console.log("ISBN file successfully processed");
  });
})();

async function googleAPI (url , isbn){
  let obj = {};
  const objectReturn =  await axios.get(url).then((response) => {
     body =  response.data;

    if (body.totalItems === 0 ) {
      console.log("No Result Found For" + " " + isbn);
    } else {
      console.log("Current isbn" + " " + isbn )
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
    }
    return obj;
  })
  return objectReturn;
}
