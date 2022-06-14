import { config } from 'dotenv'
import {server} from './server/server'

  //load env variables!
    config();
  // The `listen` method launches a web server.
  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
