const functions = require('firebase-functions');
const {Storage} = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
    projectId: "zebra-260622",
  });

exports.uploadHandler = functions.storage.object().onFinalize((object) => {
    const filename = path.basename(object.name);
    const validBucket = storage.bucket('valid_records');
    const invalidBucket = storage.bucket('invalid_records');

    if (object.contentType !== 'application/json') {
        console.log('This is not a valid JSON file.');
        return null;
    }

    validBucket.file(filename).download((err, contents) => {
        if (err) {
            console.log('error', err);
            return null
        }

        console.log("contents = ", JSON.parse(contents));
        verifyData(JSON.parse(contents));
    });
});

function verifyData(content) {
    let validData = {
        Grocery: [],
        Bakery: []
    };
    let invalidData = {
        Grocery: [],
        Bakery: []
    };
    for (let i = 0; i < content.Grocery.length; i++) {
        if (!content.Grocery[i].description || typeof(content.Grocery[i].price) !== "number" || (content.Grocery[i].upc.length !== 12 || parseInt(content.Grocery[i].upc, 10) === NaN)) {
            invalidData.Grocery.push(content.Grocery[i]);
        } else {
            validData.Grocery.push(content.Grocery[i]);
        }
    }

    for (let i = 0; i < content.Bakery.length; i++) {
        if (!content.Bakery[i].description || typeof(content.Bakery[i].price) !== "number" || (content.Bakery[i].upc.length !== 12 || parseInt(content.Bakery[i].upc, 10) === NaN)) {
            invalidData.Bakery.push(content.Bakery[i]);
        } else {
            validData.Bakery.push(content.Bakery[i]);
        }
    }

    console.log("validData = ", validData);
    console.log("invalidData = ", invalidData);

    writeData(JSON.stringify(invalidData));
}

function writeData(content) {
    
}
// function toDB(jsn) {
//     // Here you can add you firestore/ realtime database or merge the JSON if you want to batch write.
//     console.log(jsn)
// }