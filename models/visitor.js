const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('database connected successfully');
})
.catch((err)=>{
    console.log(err);
})

const visitorSchema = new mongoose.Schema({
    visitorId: {
        type: String,
        unique: true,
        required: true
    },
    firstVisit: {
        type: Date,
        default: Date.now
    },
    lastVisit: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model("visitor",visitorSchema);
