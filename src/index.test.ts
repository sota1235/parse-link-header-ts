import parse from './index.ts';
import { test, type TestContext } from 'node:test';

test('parsing a proper link header with next and last', (t: TestContext) => {
  const link =
    '<https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=2&per_page=100>; rel="next", ' +
    '<https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=3&per_page=100>; rel="last"';
  const result = parse(link);
  t.assert.deepStrictEqual(result, {
    next: {
      client_id: '1',
      client_secret: '2',
      page: '2',
      per_page: '100',
      rel: 'next',
      url: 'https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=2&per_page=100',
    },
    last: {
      client_id: '1',
      client_secret: '2',
      page: '3',
      per_page: '100',
      rel: 'last',
      url: 'https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=3&per_page=100',
    },
  });
});

test('handles unquoted relationships', (t: TestContext) => {
  const link =
    '<https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=2&per_page=100>; rel=next, ' +
    '<https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=3&per_page=100>; rel=last';
  const result = parse(link);
  t.assert.deepStrictEqual(result, {
    next: {
      client_id: '1',
      client_secret: '2',
      page: '2',
      per_page: '100',
      rel: 'next',
      url: 'https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=2&per_page=100',
    },
    last: {
      client_id: '1',
      client_secret: '2',
      page: '3',
      per_page: '100',
      rel: 'last',
      url: 'https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=3&per_page=100',
    },
  });
});

test('parsing a proper link header with next, prev and last', (t: TestContext) => {
  const linkHeader =
    '<https://api.github.com/user/9287/repos?page=3&per_page=100>; rel="next", ' +
    '<https://api.github.com/user/9287/repos?page=1&per_page=100>; rel="prev", ' +
    '<https://api.github.com/user/9287/repos?page=5&per_page=100>; rel="last"';

  const result = parse(linkHeader);

  t.assert.deepStrictEqual(result, {
    next: {
      page: '3',
      per_page: '100',
      rel: 'next',
      url: 'https://api.github.com/user/9287/repos?page=3&per_page=100',
    },
    prev: {
      page: '1',
      per_page: '100',
      rel: 'prev',
      url: 'https://api.github.com/user/9287/repos?page=1&per_page=100',
    },
    last: {
      page: '5',
      per_page: '100',
      rel: 'last',
      url: 'https://api.github.com/user/9287/repos?page=5&per_page=100',
    },
  });
});

test('parsing an empty link header', (t: TestContext) => {
  const linkHeader = '';
  t.assert.throws(() => parse(linkHeader), {
    message: 'linkHeader is empty',
  });
});

test('parsing a proper link header with next and a link without rel', (t: TestContext) => {
  const linkHeader =
    '<https://api.github.com/user/9287/repos?page=3&per_page=100>; rel="next", ' +
    '<https://api.github.com/user/9287/repos?page=1&per_page=100>; pet="cat", ';
  const result = parse(linkHeader);

  t.assert.deepStrictEqual(result, {
    next: {
      page: '3',
      per_page: '100',
      rel: 'next',
      url: 'https://api.github.com/user/9287/repos?page=3&per_page=100',
    },
  });
});

test('parsing a proper link header with next and properties besides rel', (t: TestContext) => {
  const linkHeader =
    '<https://api.github.com/user/9287/repos?page=3&per_page=100>; rel="next"; hello="world"; pet="cat"';
  const result = parse(linkHeader);

  t.assert.deepStrictEqual(result, {
    next: {
      page: '3',
      per_page: '100',
      rel: 'next',
      hello: 'world',
      pet: 'cat',
      url: 'https://api.github.com/user/9287/repos?page=3&per_page=100',
    },
  });
});

test('parsing a proper link header with a comma in the url', (t: TestContext) => {
  const linkHeader =
    '<https://imaginary.url.notreal/?name=What,+me+worry>; rel="next";';

  const result = parse(linkHeader);

  t.assert.deepStrictEqual(result, {
    next: {
      rel: 'next',
      name: 'What, me worry',
      url: 'https://imaginary.url.notreal/?name=What,+me+worry',
    },
  });
});

test('parsing a proper link header with a multi-word rel', (t: TestContext) => {
  const linkHeader =
    '<https://imaginary.url.notreal/?name=What,+me+worry>; rel="next page";';

  const result = parse(linkHeader);

  t.assert.deepStrictEqual(result, {
    page: {
      rel: 'page',
      name: 'What, me worry',
      url: 'https://imaginary.url.notreal/?name=What,+me+worry',
    },
    next: {
      rel: 'next',
      name: 'What, me worry',
      url: 'https://imaginary.url.notreal/?name=What,+me+worry',
    },
  });
});

test('parsing a proper link header with matrix parameters', (t: TestContext) => {
  const linkHeader =
    '<https://imaginary.url.notreal/segment;foo=bar;baz/item?name=What,+me+worry>; rel="next";';
  const result = parse(linkHeader);

  t.assert.deepStrictEqual(result, {
    next: {
      rel: 'next',
      name: 'What, me worry',
      url: 'https://imaginary.url.notreal/segment;foo=bar;baz/item?name=What,+me+worry',
    },
  });
});
