module.exports = {
  target: "serverless",
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^electron$/ })
    );
    config.resolve = {
      ...config.resolve,
      fallback: {
        fs: false,
        path: false,
        os: false,
        net: false,
        stream: false,
        https: false,
        http: false,
      },
    };
    return config;
  },
};
