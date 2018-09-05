// request is a module that makes http calls easier
const request = require('request');
const MongoClient =  require('mongodb').MongoClient;

const dsn = "mongodb://localhost:27017";
MongoClient.connect(dsn, {useNewUrlParser : true} , (err , client) => {
    console.time('mongodb');
    if(err){
        console.log(err);
    }

    console.log("Db connected");
    fetchFromAPI((err, data) => {
        try{
            if (err) throw err;

            const db = client.db('maxcoin');

            const collection =  db.collection('value');
            insertMongodb(collection , data.bpi).then((result) =>{
                console.log(`Inserted sucessfully`);
                const options = {sort : [['value' , 'desc']]};
                collection.findOne({} , options  , (err , doc) => {
                    if(err) throw err ;

                    console.log(`Max value reach ${doc.value} on date ${doc.date}`);
                    client.close();
                    console.timeEnd('mongodb');
                })
               
            }).catch((err) => {
                console.log(err);
                process.exit();
            });
        }catch(err){
            console.log(err);
        }
      
    });
    
});

function insertMongodb(collection , data ){
    const promiseInserts = [] ;
    Object.keys(data).forEach((element) => {
        promiseInserts.push(
            collection.insertOne({
                date : element , 
                value : data[element]
            })
        )
    });
    return Promise.all(promiseInserts);
}
// Generic function that fetches the closing bitcoin dates of the last month from a public API
function fetchFromAPI(callback) {

    // We are using fat arrow (=>) syntax here. This is a new way to create anonymous functions in Node
    // Please review the Node.js documentation if this looks unfamiliar to you
    request.get('https://api.coindesk.com/v1/bpi/historical/close.json', (err, raw, body) => {
        return callback(err, JSON.parse(body));
    });
}

