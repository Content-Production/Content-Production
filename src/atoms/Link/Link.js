// @flow
/** @jsx jsx */

import { Link as ThemeLink, jsx } from 'theme-ui';

import { Fragment } from 'react';
import { Link as GatsbyLink } from 'gatsby';
import { Icon } from '@makerdao/dai-ui-icons';
import IconLink from './components/IconLink';
import type { Node } from 'react';
import { OutboundLink } from 'gatsby-plugin-google-analytics';
import type { TIconLinkProps } from './components/IconLink';
import { trackCustomEvent } from 'gatsby-plugin-google-analytics';
import { useTranslation } from '@modules/localization';

type TLinkProps = {
  children: Node,
  to: string,
  icon: string,
  activeClassName: string,
  partiallyActive: boolean,
  hideExternalIcon: boolean,
  href: string,
  gaProps: any,
  onClick: () => void,
};

// Since DOM elements <a> cannot receive activeClassName
// and partiallyActive, destructure the prop here and // pass it only to GatsbyLink
export default function Link({
  children,
  to,
  icon,
  activeClassName,
  partiallyActive,
  hideExternalIcon,
  href,
  gaProps,
  onClick,
  ...rest
}: TLinkProps): Node {
  const { locale } = useTranslation();
  let linkHref = to || href;

  //Check if the link has a # at the front.
  //If it does, append it to the end our current pages url for "to".
  const isAnchor = /^[#]/.test(linkHref);

  if (isAnchor && typeof window !== 'undefined') {
    return (
      <GatsbyLink
        to={`${window.location.pathname}${linkHref}`}
        sx={{ variant: 'styles.a' }}
        onClick={() => {
          if (onClick) {
            onClick();
          }

          const eventProps = {
            category: 'Internal Link',
            action: 'Click',
            label: linkHref,
            ...gaProps,
          };

          trackCustomEvent(eventProps);
        }}
        {...(rest: any)}
      >
        {children}
      </GatsbyLink>
    );
  }

  // Tailor the following test to your environment.
  // This assumes that any internal link (intended for Gatsby)
  // will start with exactly one slash, and that anything else is external.
  const internal = /^\/(?!\/)/.test(linkHref);

  // Use Gatsby Link for internal links, and <a> for others
  if (internal) {
    const hasLocale = /^\/([\w]{2})\//.test(linkHref);
    //If it doesn't have the locale specified use the current locale.
    //NOTE(Réjon): While I could also check if it has a locale and if it exists,
    //             I think it could mess with the expectations of how links work.
    //             If an invalid locale is passed, then it should go to a 404 page, unless the team specifies otherwise.
    //NOTE(Rejon): There's no slash in this string because CCs will write the md with a starting slash.
    if (!hasLocale && linkHref) {
      linkHref = `/${locale}${linkHref}`;
    }

    return (
      <GatsbyLink
        to={linkHref}
        activeClassName={
          activeClassName || (linkHref !== `/${locale}/` ? 'active' : null)
        }
        partiallyActive={
          partiallyActive || (linkHref !== `/${locale}/` ? true : null)
        }
        sx={{ variant: 'styles.a' }}
        onClick={() => {
          if (onClick !== null && onClick !== undefined) {
            onClick();
          }

          const eventProps = Object.assign(
            {
              category: 'Internal Link',
              action: 'Click',
              label: linkHref,
            },
            gaProps
          );

          trackCustomEvent(eventProps);
        }}
        {...(rest: any)}
      >
        {/*add space as workaround for svg padding resizing issue*/}
        {icon && linkHref && (
          <Fragment>
            {` ${(
              <Icon
                name={icon}
                size={'2rem'}
                sx={{
                  verticalAlign: 'middle',
                  top: '-2px',
                  position: 'relative',
                }}
              />
            )}`}
          </Fragment>
        )}
        {children}
      </GatsbyLink>
    );
  }

  ///HTTPS/HTTP checks
  //Ensure ALL links are HTTPS
  const hasHTTP = /^(http|https):\/\//i.test(linkHref);

  if (!hasHTTP) {
    linkHref = `https://${linkHref}`;
  } else if (!/^(https)?:\/\//i.test(linkHref)) {
    linkHref = linkHref.replace(/^http?:\/\//, 'https://');
  }

  return (
    <ThemeLink
      href={linkHref}
      as={OutboundLink}
      variant="styles.a"
      className="external-link"
      onClick={onClick}
      {...(rest: any)}
      target={'_blank'}
      rel="nofollow noopener"
    >
      {icon && linkHref && (
        <Fragment>
          {` `}
          <Icon
            name={icon}
            size={'2rem'}
            sx={{ verticalAlign: 'middle', top: '-2px', position: 'relative' }}
          />
        </Fragment>
      )}
      {children}
      {!hideExternalIcon && (
        <Icon
          name="increase"
          className="increase"
          sx={{ top: '2px', position: 'relative', ml: '2px' }}
        />
      )}
    </ThemeLink>
  );
}

Link.Icon = (props: TIconLinkProps): Node => <IconLink {...props} />;
