/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const findEnvironmentalVariables = require("./environment");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = env => {
  const config = {
    target: "web",
    mode: "production",
    entry: {
      main: ["./src/index.tsx"]
    },
    devtool: "inline-source-map",
    output: {
      publicPath: "/",
      filename: "[name].[contenthash].bundle.js"
    },
    resolve: {
      alias: {
        "react-dom": "@hot-loader/react-dom",
        "azure-devops-extension-sdk": path.resolve("node_modules/azure-devops-extension-sdk")
      },
      extensions: [".ts", ".tsx", ".js"]
    },
    stats: {
      warnings: true
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: ["babel-loader", "ts-loader"]
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            {
              loader: "css-loader",
              options: {
                sourceMap: false
              }
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: false,
                sassOptions: {
                  outputStyle: "compressed"
                }
              }
            }
          ]
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
        }
      ]
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false
            }
          }
        })
      ],
      splitChunks: {
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all"
          }
        }
      },
      runtimeChunk: {
        name: "manifest"
      }
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].[contenthash].css",
        chunkFilename: "[id].css"
      }),
      new HtmlWebPackPlugin({
        template: "./src/index.html",
        chunks: ["main"]
      }),
      new webpack.DefinePlugin(findEnvironmentalVariables(env.ENVIRONMENT)),
      new CopyWebpackPlugin({
        patterns: [{from: "assets", context: "src", to: "assets"}]
      }),
      new CompressionPlugin({
        test: /\.js(\?.*)?$/i
      })
    ]
  };

  if (env.ANALYZE === "true") {
    config.plugins.push(new BundleAnalyzerPlugin());
  }

  return config;
};
