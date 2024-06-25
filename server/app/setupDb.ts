import mongoose from 'mongoose'

export default () => {
  const connect = () => {
    mongoose.connect('mongodb://127.0.0.1:27017/gen_esys')
      .then(() => {
        console.log('Connection to MongoDB was successful.')
      })
      .catch((error) => {
        console.log('Error connecting to database', error)
        return process.exit(1)
      })
  }
  connect()

  mongoose.connection.on('disconnected', connect)
}