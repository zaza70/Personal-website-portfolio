const path = require('path');

module.exports = {
  entry: {
    main: './src/js/main.js',
    theme: './src/js/theme.js',
    language: './src/js/language.js',
    skills: './src/js/skills.js',
    projects: './src/js/projects.js',
    'projects-data': './src/js/projects-data.js',
    'advanced-filter': './src/js/advanced-filter.js',
    blog: './src/js/blog.js',
    'blog-data': './src/js/blog-data.js',
    contact: './src/js/contact.js',
    'scroll-effects': './src/js/scroll-effects.js',
    certifications: './src/js/certifications.js',
    pwa: './src/js/pwa.js',
    schema: './src/js/schema.js',
    seo: './src/js/seo.js',
    'admin-new': './src/js/admin-new.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist/js'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'vendors'
    }
  },
  devtool: 'source-map'
};
