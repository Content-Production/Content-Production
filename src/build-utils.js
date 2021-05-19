const TitleConverter = ({ frontmatter, rawBody, fileAbsolutePath }) => {
  const firstHeading = rawBody
    ? rawBody.split('\n').find((n) => n[0] === '#')
    : null;
  const splitPath = fileAbsolutePath.split('/');
  let fileName = splitPath.pop().replace(/(.mdx|.md)$/gm, '');

  //If the filename is index.mdx, use the name of it's directory instead.
  if (fileName === 'index') {
    fileName = splitPath[splitPath.length - 1];
  }

  const frontMatterTitle =
    frontmatter && frontmatter.title ? frontmatter.title : null;
  const headingsTitle = firstHeading ? firstHeading.replace(/^# +/, '') : null;

  //Classic title rule.
  return frontMatterTitle || headingsTitle || fileName;
};

const UrlConverter = ({ fileAbsolutePath }) => {
  return fileAbsolutePath
    .slice(fileAbsolutePath.indexOf('/content/') + 8, fileAbsolutePath.length)
    .replace(/(.mdx.md|.md|.mdx|index.mdx)$/gm, '');
};

const getBlogPostTypeFromPath = (path) => {
  const pathArr = path.split('/');

  const nodeAfterBlog = pathArr[pathArr.indexOf('blog') + 1];

  if (nodeAfterBlog !== undefined) {
    //Check if node after blog is not undefined.
    //Check if the node after blog is a mdx/markdown file.
    if (nodeAfterBlog.includes('.mdx') || nodeAfterBlog.includes('.md')) {
      return null;
    }

    return nodeAfterBlog;
  } else {
    return null;
  }
};

module.exports = {
  TitleConverter,
  UrlConverter,
  getBlogPostTypeFromPath,
};
