/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const fs = require("fs");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const findEnvironmentalVariables = require("./environment");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = env => {
  return {
    target: "web",
    mode: "development",
    entry: {
      main: ["react-hot-loader/patch", "./src/index.tsx"]
    },
    devtool: "inline-source-map",
    output: {
      publicPath: "/",
      filename: "[name].js"
    },
    resolve: {
      alias: {
        "react-dom": "@hot-loader/react-dom",
        "azure-devops-extension-sdk": path.resolve("node_modules/azure-devops-extension-sdk")
      },
      extensions: [".ts", ".tsx", ".js"]
    },
    devServer: {
      // Redirects all 404s to the index page
      // this is needed for the callback page to work in development
      historyApiFallback: true,
      hot: true,
      http2: true,
      https: {
        key: fs.readFileSync(path.join(__dirname, "local-ssl", "localhost.key")),
        cert: fs.readFileSync(path.join(__dirname, "local-ssl", "localhost.crt"))
      }
    },
    stats: {
      warnings: false
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: ["babel-loader", "ts-loader"]
        },
        {
          test: /\.scss$/,
          use: ["style-loader", "css-loader", "azure-devops-ui/buildScripts/css-variables-loader", "sass-loader"]
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource"
        },
        {
          test: /\.html$/,
          use: ["html-loader"]
        },
        {
          test: /\.svg$/,
          use: ["@svgr/webpack"]
        }
      ]
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: "./src/index.html",
        chunks: ["main"]
      }),
      new webpack.DefinePlugin(findEnvironmentalVariables(env.ENVIRONMENT)),
      new CopyWebpackPlugin({
        patterns: [{from: "assets", context: "src", to: "assets"}]
      })
    ]
  };
};
