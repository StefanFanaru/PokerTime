## Running this project

### Hot reload

1. Start the webpack-dev-server with:

   ```shell
   npm run start:dev
   ```

1. Go to `localhost:3000` in your browser. You should get an untrusted certificate error page. Select **Advanced** and then
   select **Accept the Risk
   and Continue**.

1. Navigate to the extension in Azure DevOps. Any changes to the source code will cause webpack to recompile and reload the
   extension automatically.
