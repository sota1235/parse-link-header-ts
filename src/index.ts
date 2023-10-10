const PARSE_LINK_HEADER_MAXLEN = parseInt(process.env.PARSE_LINK_HEADER_MAXLEN ?? '') || 2000;
const PARSE_LINK_HEADER_THROW_ON_MAXLEN_EXCEEDED = process.env.PARSE_LINK_HEADER_THROW_ON_MAXLEN_EXCEEDED != null

interface RawLink {
  url: string;
  [key: string]: string;
}

interface Link extends RawLink {
  rel: string;
}

interface Result {
  [key: string]: Link;
}

function hasRel(link: null | Record<string, string>): link is Link {
  if (link === null) {
    return false;
  }

  return link.rel != null;
}

function intoRels (acc: Result, link: Link) {
  function splitRel (rel: string) {
    acc[rel] = { ...link, ...{ rel }};
  }

  link.rel.split(/\s+/).forEach(splitRel);

  return acc;
}

function createObjects (acc: Record<string, string>, p: string) {
  // rel="next" => 1: rel 2: next
  const m = p.match(/\s*(.+)\s*=\s*"?([^"]+)"?/)
  if (m) acc[m[1]] = m[2];
  return acc;
}

function parseLink(link: string) : RawLink | null {
  try {
    const m         =  link.match(/<?([^>]*)>(.*)/)

    if (m === null) {
      console.warn('Invalid link header')
      return null;
    }

    const linkUrl   =  m[1];
    const parts     =  m[2].split(';');
    const parsedUrl = new URL(linkUrl);
    const qry: Record<string, string> = {};

    for (const [key, value] of parsedUrl.searchParams) {
      qry[key] = value;
    }

    parts.shift();

    let info = parts
      .reduce<Record<string, string>>(createObjects, {});
    
    info = { ...qry, ...info, url: linkUrl };
    return info as RawLink;
  } catch (e) {
    return null;
  }
}

function checkHeader(linkHeader: string){
  if (linkHeader.length > PARSE_LINK_HEADER_MAXLEN) {
    if (PARSE_LINK_HEADER_THROW_ON_MAXLEN_EXCEEDED) {
      throw new Error('Input string too long, it should be under ' + PARSE_LINK_HEADER_MAXLEN + ' characters.');
    } else {
        return false;
      }
  }
  return true;
}

export default function (linkHeader: string): Result | null {
  if (linkHeader === '') {
    return null;
  }

  if (!checkHeader(linkHeader)) return null;

  return linkHeader.split(/,\s*</)
   .map(parseLink)
   .filter<Link>(hasRel)
   .reduce(intoRels, {});
};
