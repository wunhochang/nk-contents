const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const OpenBrowserPlugin = require("open-browser-webpack-plugin");
const ExtJSReactorWebpackPlugin = require("@extjs/reactor-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const sourcePath = path.join(__dirname, "./src");

module.exports = function (env) {
  const nodeEnv = env && env.prod ? "production" : "development";
  const isProd = nodeEnv === "production";

  const outputPath = isProd
    ? path.join(__dirname, "../Publish")
    : path.join(__dirname, "build");
  //const outputPath = path.join(__dirname, 'build');

  // const ClientRootUrl = isProd? 'http://nkcontents.gen-one.com':'http://localhost:8081';
  // const APIUrl = isProd? 'http://nkcontents.gen-one.com/api':'http://localhost:5554/api';
  const ClientRootUrl = isProd ? "" : "";
  const APIUrl = isProd ? "/api" : "http://localhost:5554/api";

  const plugins = [
    new ExtJSReactorWebpackPlugin({
      sdk: "ext", // you need to copy the Ext JS SDK to the root of this package, or you can specify a full path to some other location
      toolkit: "classic",
      theme: "theme-triton",
      overrides: ["overrides"],
      packages: [],
      production: isProd,
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: nodeEnv,
      CLIENT_ROOT_URL: ClientRootUrl,
      API_URL: APIUrl,
    }),
    new CopyWebpackPlugin([{ from: "./assets", to: "./assets" }]),
  ];

  if (isProd) {
    plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          screw_ie8: true,
        },
      })
    );
  } else {
    plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  plugins.push(
    new HtmlWebpackPlugin({
      template: "index.html",
      hash: true,
    }),
    new OpenBrowserPlugin({
      url: "http://localhost:8081",
    })
  );

  return {
    devtool: isProd ? "source-map" : "eval",
    context: sourcePath,

    entry: ["./index.js"],

    output: {
      path: outputPath,
      filename: "bundle.js",
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ["babel-loader"],
        },
      ],
      loaders: [
        { test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3)$/, loader: "file" },
        {
          test: /\.css$/,
          loader:
            "style!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]",
        },
      ],
    },

    resolve: {
      // The following is only needed when running this boilerplate within the extjs-reactor repo with lerna bootstrap.  You can remove this from your own projects.
      alias: {
        "react-dom": path.resolve("./node_modules/react-dom"),
        react: path.resolve("./node_modules/react"),
      },
    },

    plugins,

    stats: {
      colors: {
        green: "\u001b[32m",
      },
    },

    devServer: {
      contentBase: "./build",
      historyApiFallback: true,
      port: 8081,
      compress: isProd,
      inline: !isProd,
      hot: !isProd,
      stats: {
        assets: true,
        children: false,
        chunks: false,
        hash: false,
        modules: false,
        publicPath: false,
        timings: true,
        version: false,
        warnings: true,
        colors: {
          green: "\u001b[32m",
        },
      },
    },
  };
};
