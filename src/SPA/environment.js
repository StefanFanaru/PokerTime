/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Get the root path (assuming your webpack config is in the root of your project!)
const currentPath = path.join(__dirname);

// Create the fallback path (the production .env)
const basePath = `${currentPath}/.env`;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function findEnvironmentalVariables(environment) {
  // We're concatenating the environment name to our filename to specify the correct env file!
  const envPath = `${basePath}.${environment}`;

  // Check if the file exists, otherwise fall back to the production .env
  const finalPath = fs.existsSync(envPath) ? envPath : basePath;

  // Set the path parameter in the dotenv config
  const fileEnv = dotenv.config({path: finalPath}).parsed;

  // reduce it to a nice object, the same as before (but with the variables from the file)
  var vars = Object.keys(fileEnv).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(fileEnv[next]);
    return prev;
  }, {});
  return vars;
}

module.exports = findEnvironmentalVariables;
