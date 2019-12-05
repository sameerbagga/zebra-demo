const functions = require('firebase-functions');
const {Storage} = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
const util = require('util');

let readFile = util.promisify(fs.readFile);
let writeFile = util.promisify(fs.writeFile);



const storage = new Storage({
    projectId: "zebra-260622",
  });

const validBucket = storage.bucket('valid_records');
const invalidBucket = storage.bucket('invalid_records');

exports.uploadHandler = async event => {
    // This event represents the triggering Cloud Storage object.
    const object = event;
  
    const file = storage.bucket(object.bucket).file(object.name);
    const filePath = `gs://${object.bucket}/${object.name}`;
    

    if (object.contentType !== 'application/json') {
        console.log('This is not a valid JSON file.');
        return null;
    }

    file.download((err, contents) => {
        if (err) {
            console.log('error', err);
            return null
        }
        console.log("filename = ", file.name);
        console.log("contents = ", JSON.parse(contents));
        verifyData(file, JSON.parse(contents));
    });
};

function verifyData(file, content) {
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

    return writeData(file, 'invalid_records', invalidData);

    // writeData(JSON.stringify(validData));
}


const writeData = async (file, bucketName, data) => {
    const tempLocalPath = `/tmp/${path.parse(file.name).base}`;

    await file.download({destination: tempLocalPath});


    await new Promise((resolve, reject) => {
        resolve(writeFile(tempLocalPath, JSON.stringify(data, null, 2)));
    });

    // const gcsPath = `gs://${bucketName}/${file.name}`;
    const bucket = storage.bucket(bucketName);

    await bucket.upload(tempLocalPath, {destination: file.name});

    const unlink = util.promisify(fs.unlink);
    return unlink(tempLocalPath);
}