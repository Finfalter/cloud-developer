
import express from 'express';
import { sequelize } from './sequelize';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import { requireAuth } from './controllers/v0/users/routes/auth.router';
import { V0MODELS } from './controllers/v0/model.index';

import { IndexRouter } from './controllers/v0/index.router';

(async () => {
  // https://github.com/RobinBuschmann/sequelize-typescript/issues/835
  await sequelize.addModels(V0MODELS);
  await sequelize.sync();

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.use('/', IndexRouter)

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  app.use('/', IndexRouter)

  //! END @TODO1
  app.get( "/filteredimage", 
    requireAuth,
    async ( req, res ) => {
    let url = req.query.image_url

    if (!url || !isURL(url))
      return res.status(400).send({ message: 'a valid url is required, try /filteredimage?image_url=<your_valid_url>' });

    let photo = await filterImageFromURL(url);
  
    res.status(200).sendFile(photo);

    res.on('finish', function() {
      deleteLocalFiles([photo]);
    });
  } );

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  
  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();


/** 
 * checks if a given url is valid
 * borrowed from [StackOverflow](https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url)
 */

function isURL(s : string) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(s);
}