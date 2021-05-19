const path = require('path');
const remark = require('remark');
const remarkFrontmatter = require('remark-frontmatter');
const remarkSlug = require('remark-slug');
const removeFrontmatter = () => (tree) =>
  // eslint-disable-next-line
  filter(tree, (node) => node.type !== 'yaml');
const visit = require('unist-util-visit');
const {
  TitleConverter,
  UrlConverter,
  getBlogPostTypeFromPath,
} = require('./src/build-utils');
require('dotenv').config();

module.exports = {
  siteMetadata: {
    title: `MakerDAO Community Portal`,
    description: `A Community of developers, designers, innovators, and just about everything cool under the sun. Come join our team!`,
    author: `MakerDAO Commuminty Development Team`,
    copyright: '',
    siteUrl: 'https://community-development.makerdao.com/',
  },
  plugins: [
    'gatsby-plugin-theme-ui',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-catch-links',
    'gatsby-plugin-flow',
    {
      resolve: '@ofqwx/gatsby-plugin-typegen',
      options: {
        language: 'flow',
        outputPath: 'flow-typed/__generated__/gatsby-types.flow.js',
        namespace: 'TGatsbyTypes_',
      },
    },
    {
      //NOTE(Rejon): This is what allows us to do aliased imports like "@modules/ect..."
      resolve: `gatsby-plugin-alias-imports`,
      options: {
        alias: {
          '@atoms': path.resolve(__dirname, 'src/atoms'),
          '@molecules': path.resolve(__dirname, 'src/molecules'),
          '@templates': path.resolve(__dirname, 'src/templates'),
          '@layouts': path.resolve(__dirname, 'src/layouts'),
          '@styles': path.resolve(__dirname, 'src/styles'),
          '@modules': path.resolve(__dirname, 'src/modules'),
          '@data': path.resolve(__dirname, 'src/data'),
          '@src': path.resolve(__dirname, 'src'),
          '@utils': path.resolve(__dirname, 'src/utils.js'),
          '@pages': path.resolve(__dirname, 'src/pages'),
          '@images': path.resolve(__dirname, 'static/images'),
          '@content': path.resolve(__dirname, 'content'),
        },
        extensions: [
          //NOTE(Rejon): You don't have to write .js at the end of js files now.
          'js',
        ],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/content`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blogPosts`,
        path: `${__dirname}/blogPosts`,
      },
    },
    {
      resolve: 'gatsby-plugin-page-creator',
      options: {
        path: `${__dirname}/content`,
        ignore: {
          patterns: [
            `**/header.mdx`,
            `**/**.js`,
            `**/**.json`,
            `**/404.mdx`,
            `**/example.mdx`,
            `**/footer.mdx`,
            `**/**.pptx`,
            '**/**.jpg',
            '**/**.png',
          ],
          options: { nocase: true },
        },
      },
    },
    {
      resolve: 'gatsby-plugin-page-creator',
      options: {
        path: `${__dirname}/blogPosts`,
        ignore: {
          patterns: [
            `**/header.mdx`,
            `**/**.js`,
            `**/**.json`,
            `**/404.mdx`,
            `**/example.mdx`,
            `**/footer.mdx`,
            `**/**.pptx`,
            '**/**.jpg',
            '**/**.png',
          ],
          options: { nocase: true },
        },
      },
    },
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                siteUrl
              }
            }
            allSitePage {
              edges {
                node {
                  path
                }
              }
            }
        }`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-transformer-json`,
    `gatsby-plugin-sharp`,
    `gatsby-remark-images`,
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        defaultLayouts: {
          default: require.resolve('./src/layouts/DefaultLayout.js'),
          blogPosts: require.resolve('./src/layouts/BlogPostLayout.js'),
        },
        remarkPlugins: [remarkSlug],
        gatsbyRemarkPlugins: [
          {
            resolve: 'gatsby-remark-embed-video',
            options: {
              width: 800,
              ratio: 1.77, // Optional: Defaults to 16/9 = 1.77.
              height: 400, // Optional: Overrides optional.ratio.
              related: false, // Optional: Will remove related videos from the end of an embedded YouTube video.
              noIframeBorder: true, // Optional: Disable insertion of <style> border: 0.
              showInfo: false, // Optional: Hides video title and player actions.
            },
          },

          `gatsby-remark-responsive-iframe`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1000,
              linkImagesToOriginal: false,
            },
          },
          {
            resolve: 'gatsby-remark-code-titles',
            options: {
              className: 'prism-code-title',
            },
          },
        ],
      },
    },

    {
      //NOTE(Rejon): Your search will have to be manually updated for ever new locale that's added.
      resolve: 'gatsby-plugin-lunr',
      options: {
        languages: [
          {
            name: 'en',
            filterNodes: (node) =>
              node.frontmatter !== undefined &&
              node.fileAbsolutePath &&
              node.fileAbsolutePath.match(
                /\/en\/(?!header.mdx|footer.mdx|index.mdx|example.mdx|social.mdx|404.mdx|.js|.json)/
              ) !== null,
          },
        ],
        fields: [
          { name: 'title', store: true, attributes: { boost: 20 } },
          { name: 'keywords', attributes: { boost: 15 } },
          { name: 'isBlog', store: true },
          { name: 'authors', store: true },
          { name: 'type', store: true },
          { name: 'description', store: true, attributes: { boost: 15 } },
          { name: 'date', store: true },
          { name: 'url', store: true },
          { name: 'excerpt', store: true, attributes: { boost: 5 } },
        ],
        resolvers: {
          Mdx: {
            title: TitleConverter,
            authors: (node) => node.frontmatter.authors,
            description: (node) => node.frontmatter.description,
            date: (node) => node.frontmatter.date,
            type: (node) => {
              if (node.frontmatter.type) {
                return node.frontmatter.type;
              } else if (node.fileAbsolutePath.includes('/blogPosts/')) {
                return getBlogPostTypeFromPath(node.fileAbsolutePath);
              }
            },
            isBlog: (node) => node.fileAbsolutePath.includes('/blogPosts/'),
            url: UrlConverter,
            excerpt: (node) => {
              const excerptLength = 200; // Hard coded excerpt length

              //If this node's frontmatter has a description use THAT for excerpts.
              if (node.frontmatter.description) {
                return node.frontmatter.description.slice(0, excerptLength);
              }

              //NOTE(Rejon): We have to do excerpt this way because excerpt isn't available at the level that the lunr resolver is tapping Graphql.
              // TLDR: The excerpt node is undefined so we have to parse it ourselves.
              let excerpt = '';
              const tree = remark()
                .use(remarkFrontmatter)
                .use(removeFrontmatter)
                .parse(node.rawBody);
              visit(tree, 'text', (node) => {
                excerpt += node.value + ' ';
              });
              return `${excerpt.slice(0, excerptLength)}${
                excerpt.length > excerptLength ? '...' : ''
              }`;
            },
            keywords: (node) => node.frontmatter.keywords,
          },
        },
        filename: 'search_index.json',
        fetchOptions: {
          credentials: 'same-origin',
        },
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        // The property ID; the tracking code won't be generated without it
        trackingId: process.env.GOOGLE_ANALYTICS_TRACKING_ID,
        // Defines where to place the tracking script - `true` in the head and `false` in the body
        head: false,
        // Setting this parameter is optional
        anonymize: true,
        // Setting this parameter is also optional
        respectDNT: true,
        // Avoids sending pageview hits from custom paths
        exclude: ['/'],
        // Delays sending pageview hits on route update (in milliseconds)
        pageTransitionDelay: 0,
        // Enables Google Optimize using your container Id
        optimizeId: process.env.GOOGLE_ANALYTICS_OPTIMIZE_ID,
        // Enables Google Optimize Experiment ID
        // experimentId: "YOUR_GOOGLE_EXPERIMENT_ID",
        // Set Variation ID. 0 for original 1,2,3....
        // variationId: "YOUR_GOOGLE_OPTIMIZE_VARIATION_ID",
        // Defers execution of google analytics script after page load
        defer: true,
        // Any additional optional fields
        // sampleRate: 5,
        // siteSpeedSampleRate: 10,
        // cookieDomain: "makerdao.com",
      },
    },
    'gatsby-plugin-preload-link-crossorigin',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `MakerDAO Community Portal`,
        short_name: `MKD Comm Portal`,
        start_url: `/`,
        background_color: '#291a42',
        theme_color: '#5AE2CA',
        display: `standalone`,
        include_favicon: false,
        icon: 'src/modules/utility/icon-512x512.png',
        cache_busting_mode: 'none',
        theme_color_in_head: false,
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // {
    //   resolve: 'gatsby-redirect-from',
    //   options: {
    //     query: 'allMdx'
    //   }
    // },
    `gatsby-plugin-client-side-redirect`, //<- NOTE(Rejon): We're only using this because we're using Github Pages. If we're on vercel or netlify just use their redirect scripts.
    // `gatsby-plugin-meta-redirect`,
    {
      resolve: 'gatsby-plugin-offline',
      options: {
        workboxConfig: {
          globPatterns: ['**/images/icons/icon-512x512.png'],
        },
      },
    },
  ],
};
