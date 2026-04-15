require('dotenv').config();
// destroying the createClient function from redis package and creating a redis client using the createClient function and passing the url of the redis server as an argument to it
const { createClient } = require('redis');
const redisClient = createClient({
  url: process.env.REDIS_URL
});
// this is to handle the error if any error occurs while connecting to redis server
redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

module.exports=redisClient;
