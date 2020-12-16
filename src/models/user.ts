import mongoose from 'mongoose'

mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected to mongodb')
});

const userSchema = new mongoose.Schema({
  githubProfile: String
});

export const User = mongoose.model('User', userSchema);
