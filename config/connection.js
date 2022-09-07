const mongoClient = require('mongodb').MongoClient
const state = {
    db: null
}
module.exports.connect = function (done) {
    const url = 'mongodb+srv://muhammedmidlaj:sherlock%40807825@shoppingcart11.7ucsp.mongodb.net/shop?retryWrites=true&w=majority'
    const dbname = 'shopping'

    mongoClient.connect(url, (err, data) => {
        if (err) return done(err)
        state.db = data.db(dbname)
        done()
    })


}

module.exports.get = function () {
    return state.db
}